/**
 * RepairValidator Service (Phase 7.1 Hardened)
 * 
 * Single Responsibility Principle (SRP):
 * Responsible ONLY for validating AI provider response payloads and normalizing varied formats before patch application.
 * 
 * Responsibilities:
 * - Support all AI JSON formats: { patches: [] }, { files: [] }, Markdown wrapped JSON (```json ... ```), plain JSON.
 * - Normalize every response into a unified internal structure: { patches: [...] }.
 * - Validate against path traversal attacks, duplicate files, and empty contents.
 * - Provide granular audit logging metadata (rawResponse, parsedResponse, detectedFormat, validationResult, patchCount, fileCount).
 */
export class RepairValidator {
  /**
   * Validates and normalizes raw AI response content before it is passed to the patch applier.
   * 
   * @param {any} aiResponse - Raw text or parsed payload returned by the AI provider
   * @returns {Object} Validated structured patch payload and audit metadata
   */
  validate(aiResponse) {
    const errors = [];
    const report = {
      passed: false,
      errors,
      patches: [],
      parsedPatch: null,
      rawResponse: aiResponse,
      parsedResponse: null,
      detectedFormat: "unknown",
      validationResult: "FAILED",
      validationErrors: errors,
      patchCount: 0,
      fileCount: 0
    };

    if (!aiResponse || (typeof aiResponse !== "string" && typeof aiResponse !== "object")) {
      errors.push("Empty or invalid AI response payload");
      report.detectedFormat = "empty";
      return report;
    }

    let parsed = aiResponse;
    let detectedFormat = "unknown";

    if (typeof aiResponse === "string") {
      const rawTrim = aiResponse.trim();
      if (!rawTrim) {
        errors.push("Empty AI response string");
        report.detectedFormat = "empty";
        return report;
      }

      let clean = rawTrim;
      const fenceMatch = /```(?:json|js|javascript|javascript react|jsx|tsx|ts)?\s*([\s\S]*?)```/im.exec(rawTrim);
      if (fenceMatch && fenceMatch[1].trim()) {
        clean = fenceMatch[1].trim();
        detectedFormat = "markdown-json";
      } else {
        clean = rawTrim.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
      }

      try {
        parsed = JSON.parse(clean);
      } catch (e) {
        // Fallback: extract outermost JSON object { ... } or array [ ... ] if AI added surrounding conversational explanation
        const firstBrace = clean.indexOf("{");
        const lastBrace = clean.lastIndexOf("}");
        const firstBracket = clean.indexOf("[");
        const lastBracket = clean.lastIndexOf("]");
        
        let targetSlice = null;
        if (firstBracket !== -1 && lastBracket > firstBracket && (firstBrace === -1 || firstBracket < firstBrace)) {
          targetSlice = clean.slice(firstBracket, lastBracket + 1);
        } else if (firstBrace !== -1 && lastBrace > firstBrace) {
          targetSlice = clean.slice(firstBrace, lastBrace + 1);
        }

        if (targetSlice) {
          try {
            parsed = JSON.parse(targetSlice);
            if (detectedFormat === "unknown") detectedFormat = "markdown-json";
          } catch {
            errors.push("Malformed JSON format in AI response");
            report.detectedFormat = "malformed";
            return report;
          }
        } else {
          errors.push("Malformed JSON format in AI response");
          report.detectedFormat = "malformed";
          return report;
        }
      }
    } else {
      parsed = aiResponse;
    }

    // Normalize varied structures into { patches: [...] }
    let rawPatches = [];
    if (Array.isArray(parsed)) {
      rawPatches = parsed;
      if (detectedFormat === "unknown") detectedFormat = "json-array";
    } else if (parsed && Array.isArray(parsed.patches)) {
      rawPatches = parsed.patches;
      if (detectedFormat === "unknown") detectedFormat = "json-patches";
    } else if (parsed && Array.isArray(parsed.files)) {
      rawPatches = parsed.files;
      if (detectedFormat === "unknown") detectedFormat = "json-files";
    } else if (parsed && ((parsed.file || parsed.path) && (parsed.content !== undefined || parsed.code !== undefined))) {
      rawPatches = [parsed];
      if (detectedFormat === "unknown") detectedFormat = "json-single";
    } else {
      errors.push("Unexpected response structure: missing patches or files array in response");
      report.detectedFormat = detectedFormat !== "unknown" ? detectedFormat : "malformed";
      return report;
    }

    report.detectedFormat = detectedFormat;

    if (rawPatches.length === 0) {
      errors.push("Received empty patches array in response (AI generated no code patches or file items)");
      return report;
    }

    const validatedPatches = [];
    const seenFiles = new Set();

    for (const item of rawPatches) {
      const filePath = item.file || item.path;
      const content = item.content !== undefined ? item.content : item.code;

      if (!filePath || typeof filePath !== "string" || !filePath.trim()) {
        errors.push("Missing required field or invalid file path in patch item");
        continue;
      }

      const cleanPath = filePath.trim().replace(/\\/g, "/");

      // Check path traversal and system absolute paths
      if (
        cleanPath.includes("../") ||
        cleanPath.startsWith("..") ||
        cleanPath.startsWith("/") ||
        /^[a-zA-Z]:/.test(cleanPath)
      ) {
        errors.push(`Path traversal or absolute filesystem path detected: ${filePath}`);
      }

      // Check duplicate files
      if (seenFiles.has(cleanPath)) {
        errors.push(`Duplicate file path in patch payload: ${cleanPath}`);
      } else {
        seenFiles.add(cleanPath);
      }

      // Check empty content
      if (content === undefined || content === null || typeof content !== "string" || !content.trim()) {
        errors.push(`Empty code content detected for file: ${cleanPath}`);
      }

      validatedPatches.push({
        file: cleanPath,
        path: cleanPath,
        content: content || ""
      });
    }

    report.passed = errors.length === 0;
    if (report.passed) {
      report.patches = validatedPatches;
      report.parsedPatch = validatedPatches.length === 1 ? validatedPatches[0] : validatedPatches;
      report.parsedResponse = { patches: validatedPatches };
      report.validationResult = "PASSED";
      report.patchCount = validatedPatches.length;
      report.fileCount = validatedPatches.length;
    } else {
      report.validationResult = "FAILED";
      report.patchCount = validatedPatches.length;
      report.fileCount = validatedPatches.length;
    }

    return report;
  }
}
