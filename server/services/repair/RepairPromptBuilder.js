/**
 * RepairPromptBuilder Service (Phase 7.1 Hardened)
 * 
 * Single Responsibility Principle (SRP):
 * Responsible ONLY for generating structured AI prompts from build failure diagnostics, workspace structures,
 * dependency graphs, and batch repair plans.
 * 
 * Rules & Constraints:
 * - Must NOT make API calls or network requests.
 * - Must NOT write or modify files on disk.
 * - Must NOT contain retry logic or orchestration rules.
 * - Must NOT depend on any other helper repair services.
 */
export class RepairPromptBuilder {
  /**
   * Formulates an AI prompt string tailored to the provided structured diagnostics and project awareness context.
   * 
   * @param {Object} buildDiagnostics - Structured diagnostics object from BuildDiagnostics service
   * @param {Object} [projectContext={}] - Workspace scan, dependency graph, and repair plan metadata
   * @returns {string} The constructed AI prompt instruction string
   */
  buildPrompt(buildDiagnostics, projectContext = {}) {
    if (!buildDiagnostics || !buildDiagnostics.category) {
      throw new Error("Cannot build repair prompt without valid buildDiagnostics.");
    }

    const { category, summary } = buildDiagnostics;
    const title = projectContext.title || "Untitled Project";
    const userPrompt = projectContext.prompt || "N/A";

    const scan = projectContext.workspaceScan || {};
    const graphObj = projectContext.dependencyGraph || {};
    const planObj = projectContext.repairPlan || [];

    let existingStructure = "Not provided";
    if (scan && Array.isArray(scan.files) && scan.files.length > 0) {
      existingStructure = scan.files.join(", ");
    } else if (projectContext.generatedCode && typeof projectContext.generatedCode === "object") {
      existingStructure = Object.keys(projectContext.generatedCode).join(", ");
    } else if (projectContext.structure || projectContext.existingFiles) {
      const files = projectContext.structure || projectContext.existingFiles;
      existingStructure = Array.isArray(files) ? files.join(", ") : String(files);
    }

    const missingFilesList = [...(scan.missingPages || []), ...(scan.missingComponents || []), ...(graphObj.missingDetails?.missingPages || []), ...(graphObj.missingDetails?.missingComponents || [])];
    const missingFilesStr = missingFilesList.length > 0 ? Array.from(new Set(missingFilesList)).join(", ") : (category === "MissingFile" ? summary : "None detected");
    const missingCssList = [...(scan.missingStylesheets || []), ...(graphObj.missingDetails?.missingStylesheets || [])];
    const missingCssStr = missingCssList.length > 0 ? Array.from(new Set(missingCssList)).join(", ") : (category === "CSSError" ? summary : "None detected");
    const missingAssetsList = [...(scan.missingAssets || []), ...(graphObj.missingDetails?.missingAssets || [])];
    const missingAssetsStr = missingAssetsList.length > 0 ? Array.from(new Set(missingAssetsList)).join(", ") : "None detected";

    const missingImportsList = [...(scan.missingImports || []), ...(graphObj.missingDetails?.unresolvedRelativeImports || [])];
    const missingImportsStr = missingImportsList.length > 0 ? Array.from(new Set(missingImportsList)).join(", ") : (missingFilesStr !== "None detected" ? missingFilesStr : "None detected");

    let depGraphStr = "Not provided";
    let currentImportsStr = "None detected";
    if (graphObj && graphObj.graph && Object.keys(graphObj.graph).length > 0) {
      const entries = Object.entries(graphObj.graph);
      depGraphStr = entries
        .map(([k, v]) => `${k} -> ${v.length > 0 ? v.join(", ") : "none"}`)
        .slice(0, 35).join("; ");
      currentImportsStr = entries
        .map(([k, v]) => `${k} imports: [ ${v.join(", ")} ]`)
        .slice(0, 35).join("\n");
    } else if (projectContext.currentImports) {
      currentImportsStr = Array.isArray(projectContext.currentImports) ? projectContext.currentImports.join("\n") : String(projectContext.currentImports);
    }

    const directoryTreeStr = scan.projectTree || "src/\n  pages/\n  components/\n  hooks/\n  3d/";

    let planStr = "Resolve diagnostic issue";
    if (Array.isArray(planObj) && planObj.length > 0) {
      planStr = planObj.map((it, i) => `${i + 1}. [Priority ${it.priority || 1}] ${it.path} (${it.reason || "Missing file"})`).join("\n");
    } else if (category === "MissingFile") {
      planStr = `1. [Priority 1] Generate missing file required by project imports: ${summary}`;
    }

    let categoryInstruction = "";
    if (Array.isArray(planObj) && planObj.length > 1) {
      const planItems = planObj.map((it, i) => `${i + 1}. [Priority ${it.priority}] ${it.path} - ${it.reason}`).join("\n");
      categoryInstruction = `Batch Repair Required: Generate complete valid source code for ALL ${planObj.length} of the following prioritized files in a single batch response:\n${planItems}\n\nEnsure all interdependent React JSX components, CSS stylesheets, and SVG assets are created cleanly in one response.`;
    } else if (category === "MissingFile") {
      const fileMatch = summary.match(/(?:\.|\/|src\/)[^\s'"]+/);
      const filePath = fileMatch ? fileMatch[0].replace(/^["']|["']$/g, "") : "the missing file";
      categoryInstruction = `Generate ONLY the missing file:\n${filePath}`;
    } else if (category === "MissingPackage" || category === "MissingModule") {
      categoryInstruction = `Fix the missing package or module dependency identified by: ${summary}\nProvide the required patch to resolve the import or config.`;
    } else if (category === "CSSError") {
      categoryInstruction = `Fix the stylesheet import or CSS resolution error: ${summary}`;
    } else if (category === "SyntaxError" || category === "JSXError" || category === "TypeScriptError" || category === "BundlerError") {
      categoryInstruction = `Fix the build compiler error identified by:\nCategory: ${category}\nSummary: ${summary}`;
    } else {
      categoryInstruction = `Analyze and resolve the following build failure: ${summary}`;
    }

    return `Project Title: ${title}
Project Goal: ${title}
User Prompt: ${userPrompt}

Project tree:
${directoryTreeStr}
Directory Tree:
${directoryTreeStr}
Folder hierarchy:
${directoryTreeStr}

Existing Project Structure: ${existingStructure}
Existing Files: ${existingStructure}

Current compiler error:
Category: ${category}
Summary: ${summary}
Build Diagnostics:
Category: ${category}
Summary: ${summary}

Current import statements:
${currentImportsStr}

Missing imports:
${missingImportsStr}
Missing Files: ${missingFilesStr}
Missing CSS: ${missingCssStr}
Missing Assets: ${missingAssetsStr}

Dependency Graph:
${depGraphStr}

Repair plan:
${planStr}

Project Structure
${directoryTreeStr}

All returned file paths must be relative to the project root.
Example: src/pages/PricingPage.jsx
Never: ./pages/PricingPage.jsx

Instructions:
${categoryInstruction}

Do not regenerate the project.
Do not modify unrelated files.
Return only valid source code in structured JSON format matching this exact schema:
{
  "files": [
    {
      "path": "src/pages/PricingPage.jsx",
      "content": "complete valid source code of the repaired or created file"
    }
  ],
  "patches": [
    {
      "file": "src/pages/PricingPage.jsx",
      "content": "complete valid source code of the repaired or created file"
    }
  ]
}

Return every required missing file in one JSON response.
Do not omit dependent components.
Do not return explanations.
Return JSON only.`;
  }
}
