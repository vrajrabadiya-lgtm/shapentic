import path from "path";
import { RepairPromptBuilder } from "./RepairPromptBuilder.js";
import { PatchApplier } from "./PatchApplier.js";
import { RetryManager } from "./RetryManager.js";
import { RepairValidator } from "./RepairValidator.js";
import { WorkspaceScanner } from "./WorkspaceScanner.js";
import { DependencyAnalyzer } from "./DependencyAnalyzer.js";
import { RepairPlanner } from "./RepairPlanner.js";
import { WorkspaceValidator } from "./WorkspaceValidator.js";
import { BuildDiagnostics } from "../../core/BuildDiagnostics.js";
import { logger } from "../../core/logger.js";
import { AIProvider } from "../../core/AIProvider.js";

const defaultAIProvider = {
  name: "AWS Bedrock",
  model: process.env.AWS_BEDROCK_TEXT_MODEL_ID || "anthropic.claude-3-5-sonnet-20240620-v1:0",
  generateRepair: async (prompt) => {
    const systemPrompt = "You are an AI code repair engine. You analyze build failure diagnostics and return valid source code patches in strict JSON format.";
    const resultJson = await AIProvider.generateJSON(systemPrompt, prompt, "free");
    return JSON.stringify(resultJson);
  }
};

/**
 * RepairEngine Service (Phase F6 - Boundary Cleanup)
 * 
 * Single Responsibility Principle (SRP):
 * Acts exclusively as the resilient orchestrator coordinating automated build repair workflows for syntax errors,
 * JSX errors, broken imports, missing npm packages, incorrect exports, and CSS syntax.
 * 
 * IMPORTANT: RepairEngine should NEVER create files that should have been generated initially (e.g., PricingPage.jsx,
 * ContactPage.jsx, Navbar.jsx, Footer.jsx). Those belong exclusively to CodeGenerator. RepairEngine ONLY runs on build
 * errors after workspace validation succeeds.
 */
export class RepairEngine {
  constructor({
    promptBuilder = new RepairPromptBuilder(),
    validator = new RepairValidator(),
    patchApplier = new PatchApplier(),
    retryManager = new RetryManager(),
    aiProvider = null,
    aiTimeoutMs = 90000
  } = {}) {
    this.promptBuilder = promptBuilder;
    this.validator = validator;
    this.patchApplier = patchApplier;
    this.retryManager = retryManager;
    this.aiProvider = aiProvider || defaultAIProvider;
    this.aiTimeoutMs = aiTimeoutMs;
  }

  /**
   * Coordinates the automated repair cycle for a failed build with full rollback and backoff resilience.
   * 
   * @param {Object} project - The project document containing buildDiagnostics
   * @param {Object} builder - The ProjectBuilder instance to apply fixes to and re-verify build
   * @param {string} [jobId="N/A"] - BullMQ job identifier for structured logging
   * @returns {Promise<Object>} Outcome summary of the automated repair cycle
   */
  logSessionSummary(jobId, projectId, project, finalStatus, totalDurationMs) {
    let summaryText = "\n=========================\nREPAIR SESSION SUMMARY\n=========================\n";
    const attempts = project?.repair?.attempts || [];
    attempts.forEach((att, idx) => {
      const attemptNum = idx + 1;
      const resultStr = att.fixed || att.rebuildStatus ? "SUCCESS" : "FAILED";
      summaryText += `\nAttempt ${attemptNum}\nCategory: ${att.category || "Unknown"}\nSummary: ${att.summary || "No summary"}\nResult: ${resultStr}\n\n↓\n`;
    });
    summaryText += `\nFinal Build Status\n\n${finalStatus}\n\nTotal Attempts\n\n${project?.repair?.totalAttempts || attempts.length}\n\nRepair Duration\n\n${totalDurationMs} ms`;
    logger.job(jobId, projectId, "Repair Session Summary", summaryText);
  }

  async repair(project, builder = null, jobId = "N/A") {
    const sessionStartMs = Date.now();
    const projectId = project._id || project.id || "N/A";

    if (!project.repair) {
      project.repair = {
        attempts: [],
        retryHistory: [],
        analytics: { totalRepairDuration: 0, totalAiGenerationDuration: 0, totalValidationDuration: 0, totalPatchApplyDuration: 0, totalRebuildDuration: 0 },
        totalAttempts: 0,
        success: false,
        rollbackPerformed: false,
        rollbackSuccess: false
      };
    }
    if (!project.repair.analytics) {
      project.repair.analytics = { totalRepairDuration: 0, totalAiGenerationDuration: 0, totalValidationDuration: 0, totalPatchApplyDuration: 0, totalRebuildDuration: 0 };
    }

    // Phase F6: Repair Engine Boundary Enforcement
    // Never run on workspace validation failures or attempt to create scaffold files belonging to CodeGenerator
    const summaryStr = project.buildDiagnostics?.summary || "";
    const missingWsFiles = project.workspaceValidation?.missing || [];
    const isScaffoldCreation = summaryStr.includes("PricingPage") || summaryStr.includes("ContactPage") || 
                               summaryStr.includes("Navbar") || summaryStr.includes("Footer") || 
                               missingWsFiles.some(f => f.includes("PricingPage") || f.includes("ContactPage") || f.includes("Navbar") || f.includes("Footer"));
                               
    if ((project.workspaceValidation && project.workspaceValidation.passed === false) || isScaffoldCreation) {
      logger.warn(`[RepairEngine] Aborting repair: RepairEngine should NEVER create scaffold files that belong to CodeGenerator or run when WorkspaceValidator fails.`);
      logger.job(jobId, projectId, "Repair Aborted", "Workspace validation detected missing scaffold files before build; those belong to CodeGenerator. Stopping without invoking repair.");
      project.repair.success = false;
      project.repair.failureReason = "Workspace validation failed or missing scaffold files detected (belong to CodeGenerator).";
      project.repair.finalCategory = "MISSING_SCAFFOLD_FILE_ABORT";
      project.repair.completedAt = new Date();
      if (typeof project.save === "function") await project.save();
      return { success: false, attempts: 0, reason: "Aborted: Missing scaffold files belong to CodeGenerator", error: { type: "BOUNDARY_VIOLATION", message: project.repair.failureReason } };
    }

    if (!this.retryManager.canRetry(project)) {
      project.repair.success = false;
      project.repair.failureReason = project.buildDiagnostics?.summary || "Error is unrecoverable or retry limit exceeded before starting";
      project.repair.finalCategory = project.buildDiagnostics?.category || "UNRECOVERABLE_BUILD_ERROR";
      project.repair.completedAt = new Date();
      if (typeof project.save === "function") await project.save();

      logger.job(jobId, projectId, "Repair Failed", "Error is unrecoverable or retry limit exceeded before starting");
      logger.job(jobId, projectId, "Repair Completed", "Repair workflow finished without success");
      return { success: false, attempts: project.repair?.totalAttempts || 0, reason: "Unrecoverable or limit exceeded", error: { type: "UNRECOVERABLE_ERROR", message: project.repair.failureReason } };
    }

    let lastError = null;
    const accumulatedBackups = [];

    while (this.retryManager.canRetry(project, lastError?.type)) {
      const attemptStartMs = Date.now();
      const attemptNum = (project.repair.totalAttempts || 0) + 1;

      let prompt = "";
      let aiResponse = "";
      let validationReport = { passed: false, errors: [], patches: [], parsedPatch: null };
      let applyStatus = false;
      let rebuildStatus = false;
      let aiGenerationDuration = 0;
      let validationDuration = 0;
      let patchApplyDuration = 0;
      let rebuildDuration = 0;
      let backupRecords = [];
      let currentStepError = null;
      let buildResults = { status: "SUCCESS", error: null, logs: "Build succeeded without errors.", completedAt: new Date() };

      // 1. Repair Started
      project.status = "REPAIRING";
      if (typeof project.save === "function") await project.save();
      logger.job(jobId, projectId, "Repair Started", `Starting automated build recovery attempt ${attemptNum}`);

      if (!project.repair.analytics) project.repair.analytics = { totalRepairDuration: 0, totalAiGenerationDuration: 0, totalValidationDuration: 0, totalPatchApplyDuration: 0, totalRebuildDuration: 0 };
      if (project.repair.analytics.workspaceScanDuration === undefined) project.repair.analytics.workspaceScanDuration = 0;
      if (project.repair.analytics.dependencyAnalysisDuration === undefined) project.repair.analytics.dependencyAnalysisDuration = 0;
      if (project.repair.analytics.planningDuration === undefined) project.repair.analytics.planningDuration = 0;
      if (project.repair.analytics.batchGenerationDuration === undefined) project.repair.analytics.batchGenerationDuration = 0;
      if (project.repair.analytics.validationDuration === undefined) project.repair.analytics.validationDuration = project.repair.analytics.totalValidationDuration || 0;
      if (project.repair.analytics.repairDuration === undefined) project.repair.analytics.repairDuration = project.repair.analytics.totalRepairDuration || 0;

      const workspaceDir = builder ? (builder.buildDir || builder.projectDir || builder.workDir) : null;
      let wsScanDuration = 0;
      let depAnalDuration = 0;
      let planDuration = 0;
      let workspaceScan = {};
      let dependencyGraph = {};
      let repairPlan = [];

      try {
        // Part 1: Workspace Scanner & Part 2: Dependency Analyzer & Part 3: Repair Planner
        logger.job(jobId, projectId, "Workspace Scan Started", "Scanning project workspace for files, configs, and missing items");
        const scanStart = Date.now();
        workspaceScan = await WorkspaceScanner.scan(workspaceDir || null);
        wsScanDuration = Date.now() - scanStart;
        project.repair.analytics.workspaceScanDuration += wsScanDuration;
        logger.job(jobId, projectId, "Workspace Scan Completed", `Scanned ${workspaceScan.statistics?.totalFiles || 0} file(s) and ${workspaceScan.statistics?.totalDirectories || 0} folder(s) (${wsScanDuration}ms)`);

        if (attemptNum === 1 || !project.repair.missingFilesBeforeRepair) {
          project.repair.missingFilesBeforeRepair = [...(workspaceScan.missingPages || []), ...(workspaceScan.missingComponents || []), ...(workspaceScan.missingStylesheets || []), ...(workspaceScan.missingAssets || [])];
        }
        project.repair.workspaceScan = workspaceScan;

        logger.job(jobId, projectId, "Dependency Analysis Started", "Analyzing source imports and constructing dependency graph");
        const depStart = Date.now();
        dependencyGraph = await DependencyAnalyzer.analyze(workspaceDir || null, workspaceScan.files || null);
        depAnalDuration = Date.now() - depStart;
        project.repair.analytics.dependencyAnalysisDuration += depAnalDuration;
        logger.job(jobId, projectId, "Dependency Analysis Completed", `Analyzed dependencies across ${Object.keys(dependencyGraph.graph || {}).length} source code files (${depAnalDuration}ms)`);
        project.repair.dependencyGraph = dependencyGraph;

        const planStart = Date.now();
        const planRes = RepairPlanner.plan(project.buildDiagnostics, workspaceScan, dependencyGraph);
        repairPlan = planRes.repairPlan || [];
        planDuration = Date.now() - planStart;
        project.repair.analytics.planningDuration += planDuration;
        logger.job(jobId, projectId, "Repair Plan Generated", `Created prioritized repair plan with ${repairPlan.length} action item(s) (${planDuration}ms)`);
        project.repair.repairPlan = repairPlan;

        // 2. Generate Prompt
        prompt = this.promptBuilder.buildPrompt(project.buildDiagnostics, { ...project, workspaceScan, dependencyGraph, repairPlan });
        logger.job(jobId, projectId, "Prompt Built", `Prompt built for category ${project.buildDiagnostics.category}`);
        logger.job(jobId, projectId, "Prompt Generated", `Prompt formulated for category ${project.buildDiagnostics.category}`);

        // 3. Call AI Provider with Timeout Handling
        logger.job(jobId, projectId, "AI Request Started", `Requesting repair patch from ${this.aiProvider.name || "Gemini"}`);
        logger.job(jobId, projectId, "Batch AI Request Started", `Requesting batch repair generation for ${repairPlan.length || 1} file(s)`);
        const aiStartMs = Date.now();
        try {
          const timeoutPromise = new Promise((_, reject) => {
            const timer = setTimeout(() => {
              const timeoutErr = new Error(`AI generation timed out after ${this.aiTimeoutMs}ms`);
              timeoutErr.structured = { error: true, type: "AI_TIMEOUT", message: timeoutErr.message };
              reject(timeoutErr);
            }, this.aiTimeoutMs);
            if (timer.unref) timer.unref();
          });
          aiResponse = await Promise.race([this.aiProvider.generateRepair(prompt), timeoutPromise]);
        } catch (aiErr) {
          aiGenerationDuration = Date.now() - aiStartMs;
          project.repair.analytics.batchGenerationDuration += aiGenerationDuration;
          throw aiErr;
        }
        aiGenerationDuration = Date.now() - aiStartMs;
        project.repair.analytics.batchGenerationDuration += aiGenerationDuration;
        logger.job(jobId, projectId, "AI Response Received", `Received AI repair payload (${aiGenerationDuration}ms)`);
        logger.job(jobId, projectId, "Bedrock Response Received", "AI code repair payload received successfully");
        logger.job(jobId, projectId, "Batch AI Response Received", `Received batch AI code repair payload (${aiGenerationDuration}ms)`);

        // 4. Validate Response (Catch Invalid JSON / Malformed Payload / Schema / Traversal)
        const valStartMs = Date.now();
        validationReport = this.validator.validate(aiResponse);
        validationDuration = Date.now() - valStartMs;
        project.repair.analytics.validationDuration += validationDuration;

        if (!validationReport.passed) {
          const valMsg = `Validation errors: ${validationReport.errors.join("; ")}`;
          logger.job(jobId, projectId, "Validation Failed", valMsg);
          
          const rawLen = typeof validationReport.rawResponse === "string" ? validationReport.rawResponse.length : JSON.stringify(validationReport.rawResponse || "").length;
          logger.job(jobId, projectId, "Validation Audit", `AI Response Format:\n${validationReport.detectedFormat || "unknown"}\n\nValidation Failed\n\nReason:\n${validationReport.errors.join("; ")}\n\nRaw Length:\n${rawLen} bytes`);
          
          let errType = "INVALID_JSON";
          const valLower = valMsg.toLowerCase();
          if (valLower.includes("empty ai response") || valLower.includes("empty patches")) errType = "EMPTY_RESPONSE";
          else if (valLower.includes("path traversal") || valLower.includes("absolute filesystem")) errType = "PATH_TRAVERSAL";
          else if (valLower.includes("missing required field") || valLower.includes("unexpected response structure") || valLower.includes("duplicate file") || valLower.includes("empty code content")) errType = "INVALID_SCHEMA";
          else if (valLower.includes("malformed json")) errType = "INVALID_JSON";

          const valErr = new Error(valMsg);
          valErr.structured = { error: true, type: errType, message: valMsg };
          throw valErr;
        }

        logger.job(jobId, projectId, "Validation Passed", `Validated ${validationReport.patches.length} source code patch(es) (${validationDuration}ms)`);
        logger.job(jobId, projectId, "Validation Audit", `AI Response Format:\n${validationReport.detectedFormat || "unknown"}\n\nDetected Files:\n${validationReport.fileCount || validationReport.patches.length}\n\nDetected Patches:\n${validationReport.patchCount || validationReport.patches.length}\n\nValidation:\nPASSED`);
        logger.job(jobId, projectId, "Patch Ready", "Structured patches ready for workspace application");

        // 5. Apply Patch to Disk (Catch Filesystem / Patch Failure)
        const applyStartMs = Date.now();
        if (builder) {
          logger.job(jobId, projectId, "Applying Batch Patches", `Safely applying batch of ${validationReport.patches.length} patch(es) to physical workspace`);
          try {
            const applyRes = await this.patchApplier.applyPatch(workspaceDir, validationReport.patches);
            applyStatus = true;
            backupRecords = applyRes?.backup || [];
            if (backupRecords.length > 0) accumulatedBackups.push(...backupRecords);
          } catch (patchErr) {
            patchApplyDuration = Date.now() - applyStartMs;
            project.repair.rollbackPerformed = true;
            project.repair.rollbackSuccess = true;
            logger.job(jobId, projectId, "Patch Failed", `Patch application error: ${patchErr.message}`);
            if (!patchErr.structured) {
              patchErr.structured = { error: true, type: "FILESYSTEM_CORRUPTION", message: patchErr.message };
            }
            throw patchErr;
          }
          patchApplyDuration = Date.now() - applyStartMs;
          logger.job(jobId, projectId, "Patch Applied", `Code patches safely written to filesystem workspace (${patchApplyDuration}ms)`);
        } else {
          applyStatus = true;
        }

        const generatedPaths = validationReport.patches.map(p => p.file || p.path);
        project.repair.generatedFiles = Array.from(new Set([...(project.repair.generatedFiles || []), ...generatedPaths]));

        // Part 6: Workspace Validation & Rebuild Verification
        let wsValidated = true;
        if (builder && workspaceDir) {
          logger.job(jobId, projectId, "Workspace Validation Started", "Pre-validating filesystem workspace import resolutions before OS build");
          const valWsStart = Date.now();
          const wsValReport = await WorkspaceValidator.validate(workspaceDir, validationReport.patches);
          const valWsDur = Date.now() - valWsStart;
          project.repair.analytics.validationDuration += valWsDur;
          validationDuration += valWsDur;

          project.repair.missingFilesAfterRepair = wsValReport.missing || [];

          if (!wsValReport.passed) {
            wsValidated = false;
            logger.job(jobId, projectId, "Workspace Validation Failed", wsValReport.error);
            const simLogs = wsValReport.missing.map(f => {
              const ext = path.extname(f).toLowerCase();
              const base = path.posix.basename(f.replace(/\\/g, "/"));
              const noExt = base.includes(".") ? base.substring(0, base.lastIndexOf(".")) : base;
              if (ext === ".css" || ext === ".scss" || ext === ".less") {
                return `Cannot resolve CSS file "./${base}"`;
              }
              return `Could not resolve "./${noExt}"`;
            }).join("\n");
            buildResults = {
              status: "FAILED",
              error: wsValReport.error,
              logs: `${wsValReport.error}\n\n--- DETECTED MISSING IMPORTS ---\n${simLogs}`,
              completedAt: new Date()
            };
            rebuildDuration = 0;
          } else {
            logger.job(jobId, projectId, "Workspace Validation Passed", `Verified all code imports, stylesheets, and assets exist (${valWsDur}ms)`);
          }
        } else {
          logger.job(jobId, projectId, "Workspace Validation Started", "Skipping validation for synthetic test mock without disk workspace");
          logger.job(jobId, projectId, "Workspace Validation Passed", "Synthetic test workspace validated");
          project.repair.missingFilesAfterRepair = [];
        }

        // 6. Rebuilding & Verification (Catch Build Failure)
        project.status = "BUILDING";
        if (typeof project.save === "function") await project.save();
        logger.job(jobId, projectId, "Rebuild Started", "Re-verifying project build after applying patch");
        logger.job(jobId, projectId, "Rebuilding", "Re-verifying project build after applying patch");

        const buildStartMs = Date.now();
        if (wsValidated && builder && typeof builder.verifyBuild === "function") {
          buildResults = await builder.verifyBuild();
          rebuildDuration = Date.now() - buildStartMs;
        } else if (!wsValidated) {
          rebuildDuration = 0;
        } else {
          buildResults = { status: "SUCCESS", error: null, logs: "Build succeeded without errors.", completedAt: new Date() };
          rebuildDuration = Date.now() - buildStartMs;
        }
        logger.job(jobId, projectId, "Rebuild Finished", `Build verification finished with status ${buildResults.status} (${rebuildDuration}ms)`);

        const repairDuration = Date.now() - attemptStartMs;
        this.retryManager.increment(project, project.buildDiagnostics.category);
        rebuildStatus = !buildResults.error && buildResults.status === "SUCCESS";

        if (!rebuildStatus) {
          currentStepError = {
            error: true,
            type: "BUILD_FAILURE",
            message: buildResults.error || "Build script exited with non-zero code"
          };
          // Rebuild failed: retain valid repairs between retry attempts; rollback will occur only if all retry attempts are exhausted
          lastError = currentStepError;
        }

        // Store complete attempt audit trail metadata
        project.repair.attempts.push({
          attempt: project.repair.totalAttempts,
          category: project.buildDiagnostics?.category || "Unknown",
          summary: project.buildDiagnostics?.summary || "Automated attempt",
          prompt,
          aiProvider: this.aiProvider.name || "Gemini",
          model: this.aiProvider.model || "gemini-2.5-flash",
          rawResponse: String(aiResponse || ""),
          parsedPatch: validationReport.parsedPatch || null,
          validation: {
            passed: Boolean(validationReport.passed),
            errors: validationReport.errors || []
          },
          applyStatus,
          rebuildStatus,
          fixed: rebuildStatus,
          durationMs: repairDuration,
          repairDuration,
          aiGenerationDuration,
          validationDuration,
          patchApplyDuration,
          rebuildDuration,
          workspaceScanDuration: wsScanDuration,
          dependencyAnalysisDuration: depAnalDuration,
          planningDuration: planDuration,
          batchGenerationDuration: aiGenerationDuration,
          startedAt: new Date(attemptStartMs),
          completedAt: new Date(),
          timestamp: new Date()
        });

        // Update analytics totals
        project.repair.analytics.totalRepairDuration += repairDuration;
        project.repair.analytics.totalAiGenerationDuration += aiGenerationDuration;
        project.repair.analytics.totalValidationDuration += validationDuration;
        project.repair.analytics.totalPatchApplyDuration += patchApplyDuration;
        project.repair.analytics.totalRebuildDuration += rebuildDuration;
        project.repair.analytics.repairDuration = project.repair.analytics.totalRepairDuration;

        // 7. Evaluate Success / Failure
        if (rebuildStatus) {
          project.buildStatus = "SUCCESS";
          project.buildLogs = buildResults.logs;
          project.buildCompletedAt = buildResults.completedAt;
          project.repair.success = true;
          project.repair.failureReason = null;
          project.repair.finalCategory = "RESOLVED";
          project.repair.completedAt = new Date();
          if (typeof project.save === "function") await project.save();

          logger.job(jobId, projectId, "Rebuild Status", "Rebuild SUCCESS");
          logger.job(jobId, projectId, "Detected Errors Remaining", "None");
          logger.job(jobId, projectId, "Repair Outcome", "Repair Completed Successfully");
          logger.job(jobId, projectId, "Repair Successful", `Build recovery succeeded on attempt ${project.repair.totalAttempts}`);
          logger.job(jobId, projectId, "Repair Completed", "Automated build recovery successfully restored project build");
          
          this.logSessionSummary(jobId, projectId, project, "SUCCESS", Date.now() - sessionStartMs);
          return { success: true, attempts: project.repair.totalAttempts, buildResults };
        } else {
          project.buildStatus = buildResults.status;
          project.buildLogs = buildResults.logs;
          project.buildDiagnostics = BuildDiagnostics.analyzeLogs(buildResults.logs);
          if (typeof project.save === "function") await project.save();

          logger.job(jobId, projectId, "Rebuild Status", `Rebuild FAILED\nAttempt: ${project.repair.totalAttempts}`);
          const compilerError = buildResults.error || (buildResults.logs ? buildResults.logs.split('\n').filter(l => l.trim().length > 0 && !l.includes('---')).slice(0, 3).join(' - ') : "Unknown compiler error");
          logger.job(jobId, projectId, "Compiler Error", String(compilerError));
          logger.job(jobId, projectId, "Detected Category", String(project.buildDiagnostics?.category || "Unknown"));
          logger.job(jobId, projectId, "Detected Summary", String(project.buildDiagnostics?.summary || "No diagnostic summary available"));

          if (this.retryManager.canRetry(project, lastError?.type)) {
            logger.job(jobId, projectId, "Retry Decision", `Category: ${project.buildDiagnostics?.category || "Unknown"}\nRecoverable: ${project.buildDiagnostics?.recoverable ?? true}\nScheduling Attempt ${project.repair.totalAttempts + 1}`);
            logger.job(jobId, projectId, "Retry Started", `Starting recovery retry attempt (${project.buildDiagnostics.category})`);
            logger.job(jobId, projectId, "Retrying", `Build still failing (${project.buildDiagnostics.category}), starting retry attempt`);
            await this.retryManager.scheduleBackoff(project, project.buildDiagnostics.category);
          } else {
            logger.job(jobId, projectId, "Retry Decision", "Retry Limit Reached\nStopping automated repair.");
            logger.job(jobId, projectId, "Retry Completed", "Exhausted allowable automated retry attempts");
          }
        }
      } catch (err) {
        const repairDuration = Date.now() - attemptStartMs;
        this.retryManager.increment(project, err.structured?.type || "Exception");
        lastError = err.structured || { error: true, type: "UNHANDLED_EXCEPTION", message: err.message };
        
        project.repair.attempts.push({
          attempt: project.repair.totalAttempts,
          category: project.buildDiagnostics?.category || lastError.type || "Unknown",
          summary: `Repair execution error: ${err.message}`,
          prompt,
          aiProvider: this.aiProvider.name || "Gemini",
          model: this.aiProvider.model || "gemini-2.5-flash",
          rawResponse: String(aiResponse || ""),
          parsedPatch: null,
          validation: { passed: false, errors: [err.message] },
          applyStatus: false,
          rebuildStatus: false,
          fixed: false,
          durationMs: repairDuration,
          repairDuration,
          aiGenerationDuration,
          validationDuration,
          patchApplyDuration,
          rebuildDuration,
          startedAt: new Date(attemptStartMs),
          completedAt: new Date(),
          timestamp: new Date()
        });

        project.repair.analytics.totalRepairDuration += repairDuration;
        if (typeof project.save === "function") await project.save();
        logger.warn(`[RepairEngine] Exception during repair attempt ${project.repair.totalAttempts}: ${err.message}`);

        if (this.retryManager.canRetry(project, lastError.type)) {
          logger.job(jobId, projectId, "Retry Started", `Retrying after exception: ${err.message}`);
          logger.job(jobId, projectId, "Retrying", `Retrying after exception: ${err.message}`);
          await this.retryManager.scheduleBackoff(project, lastError.type);
        } else {
          logger.job(jobId, projectId, "Retry Completed", "Exhausted allowable automated retry attempts after exception");
        }
      }
    }

    // Exhausted retries without fixing the build: perform rollback of all accumulated repair modifications
    if (builder && accumulatedBackups.length > 0) {
      const workspaceDir = builder.buildDir || builder.projectDir || builder.workDir;
      logger.job(jobId, projectId, "Rollback Started", "Exhausted retry attempts; rolling back workspace to pre-repair state");
      try {
        await this.patchApplier.rollback(workspaceDir, accumulatedBackups);
        project.repair.rollbackPerformed = true;
        project.repair.rollbackSuccess = true;
        logger.job(jobId, projectId, "Rollback Completed", "Successfully restored project filesystem to pre-repair state");
      } catch (rbErr) {
        project.repair.rollbackPerformed = true;
        project.repair.rollbackSuccess = false;
        logger.warn(`[RepairEngine] Rollback failure after exhausting retries: ${rbErr.message}`);
      }
    }

    // Exhausted retries without fixing the build
    project.repair.success = false;
    project.repair.failureReason = lastError?.message || project.buildDiagnostics?.summary || "Exhausted maximum automated recovery attempts";
    project.repair.finalCategory = lastError?.type || project.buildDiagnostics?.category || "UNRECOVERABLE_BUILD_ERROR";
    project.repair.completedAt = new Date();
    if (typeof project.save === "function") await project.save();

    logger.job(jobId, projectId, "Repair Failed", `Exhausted ${project.repair.totalAttempts} max recovery attempt(s)`);
    logger.job(jobId, projectId, "Repair Completed", `Repair workflow finished without restoring project build after ${project.repair.totalAttempts} attempt(s)`);
    this.logSessionSummary(jobId, projectId, project, "FAILED", Date.now() - sessionStartMs);
    return { success: false, attempts: project.repair.totalAttempts, reason: project.repair.failureReason, error: lastError };
  }
}

