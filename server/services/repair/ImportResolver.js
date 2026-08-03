import fs from "fs/promises";
import path from "path";

/**
 * ImportResolver Service (Phase 7.1 Hardening)
 * 
 * Single Responsibility Principle (SRP):
 * Responsible ONLY for resolving workspace imports exactly like Vite, validating filesystem path resolution,
 * extensions, directory location, filename casing, and existence.
 * 
 * Supports extensions: .jsx, .js, .ts, .tsx, .css, .scss, .less, .svg, .png, .jpg, .jpeg, .json, .webp, .gif, .ico, .gltf, .glb
 */
const SUPPORTED_EXTENSIONS = [".jsx", ".js", ".tsx", ".ts", ".css", ".scss", ".less", ".svg", ".json", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico", ".gltf", ".glb", ".mp3", ".mp4", ".woff", ".woff2"];
const RESOLUTION_EXTENSIONS = ["", ".jsx", ".js", ".tsx", ".ts", "/index.jsx", "/index.js", "/index.tsx", "/index.ts", ".css", ".scss", ".svg", ".json"];

export class ImportResolver {
  /**
   * Resolves an import specifier from a given source importer path against the physical workspace or file list.
   * 
   * @param {string} rootDir - Absolute path to workspace root
   * @param {string} importerRelPath - Relative path of the importing file (e.g., "src/App.jsx")
   * @param {string} targetSpecifier - Import string from source code (e.g., "./pages/PricingPage")
   * @param {string[]} [workspaceFiles=null] - Optional pre-collected list of relative workspace files
   * @returns {Promise<Object>} Structured import resolution diagnosis
   */
  static async resolve(rootDir, importerRelPath, targetSpecifier, workspaceFiles = null) {
    const spec = targetSpecifier.trim();
    
    // External package imports (npm modules)
    if (!spec.startsWith(".") && !spec.startsWith("/") && !spec.startsWith("src/")) {
      return {
        resolved: true,
        status: "resolved",
        target: spec,
        importer: importerRelPath,
        path: spec,
        details: "External package module import"
      };
    }

    const importerDir = path.posix.dirname(importerRelPath.replace(/\\/g, "/"));
    let targetCandidate = spec.replace(/\\/g, "/");
    if (targetCandidate.startsWith("./") || targetCandidate.startsWith("../")) {
      targetCandidate = path.posix.join(importerDir, targetCandidate);
    } else if (targetCandidate.startsWith("/")) {
      targetCandidate = "src" + targetCandidate;
    }
    targetCandidate = targetCandidate.replace(/^\/+/, "");

    // Check invalid extension if an unsupported extension was specified explicitly
    const specExt = path.posix.extname(targetCandidate).toLowerCase();
    if (specExt && !SUPPORTED_EXTENSIONS.includes(specExt)) {
      return {
        resolved: false,
        status: "invalidExtension",
        target: spec,
        importer: importerRelPath,
        path: targetCandidate,
        details: `Invalid or unsupported import extension: '${specExt}' in '${spec}'`
      };
    }

    let allFiles = workspaceFiles;
    if (!allFiles || !Array.isArray(allFiles)) {
      allFiles = [];
      if (rootDir) {
        try {
          await this._collectFilesRecursive(path.resolve(rootDir), path.resolve(rootDir), allFiles);
        } catch {
          // If workspace doesn't exist on disk (synthetic test mock), fallback to simple heuristic
        }
      }
    }

    const fileSet = new Set(allFiles.map(f => f.replace(/\\/g, "/")));

    // 1. Check exact casing match across resolution extension candidates
    for (const ext of RESOLUTION_EXTENSIONS) {
      const testPath = targetCandidate + ext;
      if (fileSet.has(testPath)) {
        return {
          resolved: true,
          status: "resolved",
          target: spec,
          importer: importerRelPath,
          path: testPath,
          details: "Import resolved cleanly with exact path and casing"
        };
      }
      if (!testPath.startsWith("src/") && fileSet.has("src/" + testPath)) {
        return {
          resolved: true,
          status: "resolved",
          target: spec,
          importer: importerRelPath,
          path: "src/" + testPath,
          details: "Import resolved cleanly in src/ directory"
        };
      }
    }

    // 2. Check incorrectCase: exists on disk with different casing
    const targetLower = targetCandidate.toLowerCase();
    for (const file of fileSet) {
      const fileLower = file.toLowerCase();
      for (const ext of RESOLUTION_EXTENSIONS) {
        if (fileLower === (targetLower + ext) || fileLower === ("src/" + targetLower + ext)) {
          return {
            resolved: false,
            status: "incorrectCase",
            target: spec,
            importer: importerRelPath,
            path: file,
            details: `Incorrect filename casing: imported as '${spec}' but file on disk is '${file}'`
          };
        }
      }
    }

    // 3. Check incorrectPath: exists in workspace under a different folder (broken relative path / wrong directory)
    const targetBase = path.posix.basename(targetCandidate);
    const targetBaseNoExt = targetBase.includes(".") ? targetBase.substring(0, targetBase.lastIndexOf(".")) : targetBase;
    for (const file of fileSet) {
      const fileBase = path.posix.basename(file);
      const fileBaseNoExt = fileBase.includes(".") ? fileBase.substring(0, fileBase.lastIndexOf(".")) : fileBase;
      if (fileBase === targetBase || (targetBaseNoExt && fileBaseNoExt === targetBaseNoExt)) {
        return {
          resolved: false,
          status: "incorrectPath",
          target: spec,
          importer: importerRelPath,
          path: file,
          details: `Wrong folder or broken relative path: imported '${spec}' from '${importerRelPath}', but actual file location is '${file}'`
        };
      }
    }

    // 4. Missing file: does not exist anywhere in the workspace
    let expectedPath = targetCandidate;
    if (!expectedPath.startsWith("src/") && !expectedPath.startsWith("public/")) {
      expectedPath = "src/" + expectedPath.replace(/^src\//, "");
    }
    if (!path.extname(expectedPath)) {
      expectedPath = expectedPath + ".jsx";
    }

    return {
      resolved: false,
      status: "missing",
      target: spec,
      importer: importerRelPath,
      path: expectedPath,
      details: `Missing file: imported target '${expectedPath}' could not be resolved from '${importerRelPath}'`
    };
  }

  /**
   * Performs a comprehensive import resolution audit across all source files in the workspace.
   * 
   * @param {string} rootDir - Absolute path to physical workspace directory
   * @param {string[]} [providedFiles=null] - Pre-collected list of workspace files
   * @returns {Promise<Object>} Complete import audit report
   */
  static async auditWorkspace(rootDir, providedFiles = null) {
    const absRoot = rootDir ? path.resolve(rootDir) : null;
    let allFiles = providedFiles;
    if (!allFiles || !Array.isArray(allFiles)) {
      allFiles = [];
      if (absRoot) {
        try {
          await this._collectFilesRecursive(absRoot, absRoot, allFiles);
        } catch {
          // Synthetic in-memory test workspace or non-existent folder
        }
      }
    }

    const report = {
      passed: true,
      totalImports: 0,
      resolvedCount: 0,
      failedCount: 0,
      results: [],
      missing: [],
      missingStylesheets: [],
      missingAssets: [],
      missingComponents: [],
      errors: [],
      summaryByCategory: {
        missing: [],
        incorrectPath: [],
        incorrectCase: [],
        invalidExtension: []
      }
    };

    if (!absRoot) return report;

    const sourceFiles = allFiles.filter(f => /^(\/?src\/)?.*\.(jsx?|tsx?|css|scss|less)$/i.test(f));
    const missingSet = new Set();

    for (const relSrc of sourceFiles) {
      const absSrc = path.join(absRoot, relSrc);
      let content = "";
      try {
        content = await fs.readFile(absSrc, "utf-8");
      } catch {
        continue;
      }

      const imports = this.extractImportSpecifiers(content, relSrc);
      for (const importSpec of imports) {
        report.totalImports++;
        const res = await this.resolve(absRoot, relSrc, importSpec, allFiles);
        report.results.push(res);
        if (res.resolved) {
          report.resolvedCount++;
        } else {
          report.failedCount++;
          report.passed = false;
          report.errors.push(`[${res.status}] ${res.details}`);
          if (report.summaryByCategory[res.status]) {
            report.summaryByCategory[res.status].push(res);
          }
          if (res.path && !missingSet.has(res.path)) {
            missingSet.add(res.path);
            report.missing.push(res.path);
            const ext = path.extname(res.path).toLowerCase();
            if (ext === ".css" || ext === ".scss" || ext === ".less") {
              report.missingStylesheets.push(res.path);
            } else if (/\.(svg|png|jpg|jpeg|webp|ico|gif|json)$/i.test(res.path)) {
              report.missingAssets.push(res.path);
            } else {
              report.missingComponents.push(res.path);
            }
          }
        }
      }
    }

    return report;
  }

  /**
   * Extracts import specifiers from code string (JS, JSX, TS, TSX, CSS, SCSS).
   * 
   * @param {string} content - File source code content
   * @param {string} filePath - Relative file path for context
   * @returns {string[]} Array of extracted import specifier strings
   */
  static extractImportSpecifiers(content, filePath = "") {
    const specifiers = new Set();
    if (!content) return [];

    const ext = path.posix.extname(filePath.replace(/\\/g, "/")).toLowerCase();
    if (ext === ".css" || ext === ".scss" || ext === ".less") {
      // Matches @import "Y", @import url("Y"), url("Y")
      const cssRegex = /(?:@import\s+(?:url\s*\(\s*)?|url\s*\(\s*)['"]?([^'")\s]+)['"]?\)?/g;
      let match;
      while ((match = cssRegex.exec(content)) !== null) {
        const target = match[1].trim();
        if (target && !target.startsWith("http://") && !target.startsWith("https://") && !target.startsWith("data:")) {
          specifiers.add(target);
        }
      }
    } else {
      // JS / React / TS matches: import X from "Y", import "Y", require("Y"), dynamic import("Y")
      const jsRegex = /(?:(?:import|export)\s+(?:[^'"]*from\s+)?|require\s*\(\s*|import\s*\(\s*|import\s+)['"]([^'"\r\n]+)['"]\)?/g;
      let match;
      while ((match = jsRegex.exec(content)) !== null) {
        const target = match[1].trim();
        if (target) specifiers.add(target);
      }
    }

    return Array.from(specifiers);
  }

  static async _collectFilesRecursive(rootDir, currDir, outList) {
    let entries;
    try {
      entries = await fs.readdir(currDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(currDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== "dist" && entry.name !== ".git" && entry.name !== ".next") {
          await this._collectFilesRecursive(rootDir, fullPath, outList);
        }
      } else if (entry.isFile()) {
        outList.push(path.relative(rootDir, fullPath).replace(/\\/g, "/"));
      }
    }
  }

  async resolve(rootDir, importerRelPath, targetSpecifier, workspaceFiles = null) {
    return ImportResolver.resolve(rootDir, importerRelPath, targetSpecifier, workspaceFiles);
  }

  async auditWorkspace(rootDir, providedFiles = null) {
    return ImportResolver.auditWorkspace(rootDir, providedFiles);
  }
}
