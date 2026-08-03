import fs from "fs/promises";
import path from "path";
import { DependencyAnalyzer } from "./DependencyAnalyzer.js";
import { ImportResolver } from "./ImportResolver.js";

/**
 * WorkspaceScanner Service (Phase 7)
 * 
 * Single Responsibility Principle (SRP):
 * Responsible ONLY for scanning the physical project workspace on disk, cataloging all directory and file
 * trees, verifying key structural configurations, and synthesizing dependency metrics before repair generation.
 */
export class WorkspaceScanner {
  /**
   * Scans a workspace directory and synthesizes complete project awareness data.
   * 
   * @param {string} workspacePath - Absolute filesystem path to the project root
   * @returns {Promise<Object>} Comprehensive scan summary including projectTree, files, directories, missing items, and statistics
   */
  static async scan(workspacePath) {
    const result = {
      projectTree: "src/\n  components/\n  pages/\n  assets/\n  hooks/\n  3d/",
      files: [],
      directories: [],
      missingImports: [],
      missingAssets: [],
      missingStylesheets: [],
      missingPages: [],
      missingComponents: [],
      unresolvedRelativeImports: [],
      importErrors: [],
      importAudit: null,
      statistics: {
        totalFiles: 0,
        totalDirectories: 0,
        hasPackageJson: false,
        hasViteConfig: false,
        hasTailwindConfig: false,
        hasPublicFolder: false,
        hasSrcFolder: false
      }
    };

    if (!workspacePath) return result;
    const rootDir = path.resolve(workspacePath);

    try {
      const stat = await fs.stat(rootDir);
      if (!stat.isDirectory()) return result;
    } catch {
      return result;
    }

    const files = [];
    const directories = [];
    await this._scanDir(rootDir, rootDir, files, directories);

    result.files = files;
    result.directories = directories;

    const hasPackageJson = files.some(f => path.posix.basename(f) === "package.json");
    const hasViteConfig = files.some(f => /^vite\.config\.(js|ts|mjs|cjs)$/i.test(path.posix.basename(f)));
    const hasTailwindConfig = files.some(f => /^tailwind\.config\.(js|ts|mjs|cjs)$/i.test(path.posix.basename(f)));
    const hasPublicFolder = directories.some(d => d === "public" || d.startsWith("public/"));
    const hasSrcFolder = directories.some(d => d === "src" || d.startsWith("src/"));

    result.statistics = {
      totalFiles: files.length,
      totalDirectories: directories.length,
      hasPackageJson,
      hasViteConfig,
      hasTailwindConfig,
      hasPublicFolder,
      hasSrcFolder
    };

    result.projectTree = this._buildTreeRepresentation(files, directories);

    const depReport = await DependencyAnalyzer.analyze(rootDir, files);
    const auditReport = await ImportResolver.auditWorkspace(rootDir);
    result.importAudit = auditReport;
    result.importErrors = auditReport?.errors || [];

    if (depReport && depReport.missingDetails) {
      result.missingImports = Array.from(new Set([...(depReport.missingFiles || []), ...(auditReport?.missingFiles || [])]));
      result.missingAssets = Array.from(new Set([...(depReport.missingDetails.missingAssets || []), ...(auditReport?.missingAssets || [])]));
      result.missingStylesheets = Array.from(new Set([...(depReport.missingDetails.missingStylesheets || []), ...(auditReport?.missingStylesheets || [])]));
      result.missingPages = Array.from(new Set([...(depReport.missingDetails.missingPages || []), ...(auditReport?.missingPages || [])]));
      result.missingComponents = Array.from(new Set([...(depReport.missingDetails.missingComponents || []), ...(auditReport?.missingComponents || [])]));
      result.unresolvedRelativeImports = depReport.missingDetails.unresolvedRelativeImports || [];
    } else if (auditReport) {
      result.missingImports = auditReport.missingFiles || [];
      result.missingAssets = auditReport.missingAssets || [];
      result.missingStylesheets = auditReport.missingStylesheets || [];
      result.missingComponents = auditReport.missingComponents || [];
    }

    return result;
  }

  async scan(workspacePath) {
    return WorkspaceScanner.scan(workspacePath);
  }

  static async _scanDir(currentDir, rootDir, files, directories) {
    let entries = [];
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (["node_modules", ".git", "dist", "build", "artifacts"].includes(entry.name)) continue;
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        directories.push(relPath);
        await this._scanDir(fullPath, rootDir, files, directories);
      } else {
        files.push(relPath);
      }
    }
  }

  static _buildTreeRepresentation(files, directories) {
    const allPaths = [...directories.map(d => d + "/"), ...files].sort();
    if (allPaths.length === 0) return "src/\n  components/\n  pages/\n  assets/\n  hooks/\n  3d/";

    const lines = [];
    for (const p of allPaths.slice(0, 60)) {
      const depth = (p.match(/\//g) || []).length - (p.endsWith("/") ? 1 : 0);
      const indent = "  ".repeat(Math.max(0, depth));
      const name = path.posix.basename(p.endsWith("/") ? p.slice(0, -1) : p) + (p.endsWith("/") ? "/" : "");
      lines.push(`${indent}${name}`);
    }
    if (allPaths.length > 60) {
      lines.push("  ... (additional files omitted)");
    }
    return lines.join("\n");
  }
}
