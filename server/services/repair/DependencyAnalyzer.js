import fs from "fs/promises";
import path from "path";

/**
 * DependencyAnalyzer Service (Phase 7)
 * 
 * Single Responsibility Principle (SRP):
 * Responsible ONLY for static syntax parsing of workspace JavaScript/React code files to construct a complete
 * import dependency graph and discover broken dependencies, missing files, circular cycles, and orphan components.
 */
export class DependencyAnalyzer {
  /**
   * Parses source files to map imports and identify architectural anomalies or missing dependencies.
   * 
   * @param {string} workspacePath - Absolute path to project workspace directory
   * @param {string[]} [providedFiles=null] - Pre-scanned file list from WorkspaceScanner
   * @returns {Promise<Object>} Object containing dependency graph and diagnosed structural metrics
   */
  static async analyze(workspacePath, providedFiles = null) {
    const rootDir = path.resolve(workspacePath || "");
    const result = {
      graph: {},
      missingFiles: [],
      orphanFiles: [],
      circularDependencies: [],
      missingDetails: {
        missingComponents: [],
        missingPages: [],
        missingAssets: [],
        missingStylesheets: [],
        unresolvedRelativeImports: []
      }
    };

    if (!workspacePath) return result;

    let allFiles = providedFiles;
    if (!allFiles || !Array.isArray(allFiles)) {
      allFiles = [];
      try {
        await this._collectFilesRecursive(rootDir, rootDir, allFiles);
      } catch {
        return result;
      }
    }

    const fileSet = new Set(allFiles.map(f => f.replace(/\\/g, "/")));
    const baseToPathMap = new Map();
    for (const file of fileSet) {
      const base = path.posix.basename(file);
      const noExt = base.includes(".") ? base.substring(0, base.lastIndexOf(".")) : base;
      if (!baseToPathMap.has(base)) baseToPathMap.set(base, file);
      if (!baseToPathMap.has(noExt)) baseToPathMap.set(noExt, file);
    }

    const sourceFiles = Array.from(fileSet).filter(f => /^(\/?src\/)?.*\.(jsx?|tsx?)$/i.test(f));
    const importedTargets = new Set();
    const missingSet = new Set();

    for (const relSource of sourceFiles) {
      const absPath = path.join(rootDir, relSource);
      let content = "";
      try {
        content = await fs.readFile(absPath, "utf-8");
      } catch {
        continue;
      }

      const dependencies = [];
      // Matches import X from "Y", import "Y", export X from "Y", require("Y"), dynamic import("Y")
      const importRegex = /(?:(?:import|export)\s+(?:[^'"]*from\s+)?|require\s*\(\s*|import\s*\(\s*|import\s+)['"]([^'"\r\n]+)['"]\)?/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const target = match[1].trim();
        if (!target) continue;

        // Ignore third-party NPM packages
        if (!target.startsWith(".") && !target.startsWith("/") && !target.startsWith("src/")) {
          continue;
        }

        const resolved = this._resolveImport(relSource, target, fileSet, baseToPathMap);
        if (resolved.exists) {
          dependencies.push(resolved.path);
          importedTargets.add(resolved.path);
        } else {
          const expectedPath = resolved.path;
          dependencies.push(expectedPath);
          if (!missingSet.has(expectedPath)) {
            missingSet.add(expectedPath);
            result.missingFiles.push(expectedPath);
            result.missingDetails.unresolvedRelativeImports.push(target);

            const ext = path.extname(expectedPath).toLowerCase();
            if (ext === ".css" || ext === ".scss" || ext === ".less") {
              result.missingDetails.missingStylesheets.push(expectedPath);
            } else if (/\.(svg|png|jpg|jpeg|webp|ico|gif|woff2?|json)$/i.test(expectedPath)) {
              result.missingDetails.missingAssets.push(expectedPath);
            } else if (/pages?\//i.test(expectedPath) || /Page\.(jsx?|tsx?)$/i.test(expectedPath)) {
              result.missingDetails.missingPages.push(expectedPath);
            } else {
              result.missingDetails.missingComponents.push(expectedPath);
            }
          }
        }
      }
      result.graph[relSource] = dependencies;
    }

    result.circularDependencies = this._findCircularDependencies(result.graph);

    const entryPoints = /[\/\\]?(main|index|App|vite-env\.d|setupTests)\.(jsx?|tsx?)$/i;
    for (const src of sourceFiles) {
      if (!entryPoints.test(src) && !importedTargets.has(src)) {
        result.orphanFiles.push(src);
      }
    }

    return result;
  }

  async analyze(workspacePath, providedFiles = null) {
    return DependencyAnalyzer.analyze(workspacePath, providedFiles);
  }

  static _resolveImport(importerRelPath, importStr, fileSet, baseToPathMap) {
    const importerDir = path.posix.dirname(importerRelPath.replace(/\\/g, "/"));
    let targetCandidate = importStr.replace(/\\/g, "/");
    if (targetCandidate.startsWith("./") || targetCandidate.startsWith("../")) {
      targetCandidate = path.posix.join(importerDir, targetCandidate);
    } else if (targetCandidate.startsWith("/")) {
      targetCandidate = "src" + targetCandidate;
    }

    targetCandidate = targetCandidate.replace(/^\/+/, "");

    const extensions = ["", ".jsx", ".js", ".tsx", ".ts", ".css", ".svg", ".json", "/index.jsx", "/index.js", "/index.tsx", "/index.ts"];
    for (const ext of extensions) {
      const testPath = targetCandidate + ext;
      if (fileSet.has(testPath)) {
        return { exists: true, path: testPath };
      }
      if (!testPath.startsWith("src/") && fileSet.has("src/" + testPath)) {
        return { exists: true, path: "src/" + testPath };
      }
    }

    const base = path.posix.basename(targetCandidate);
    if (baseToPathMap.has(base)) {
      return { exists: true, path: baseToPathMap.get(base) };
    }

    let expected = targetCandidate;
    if (!expected.startsWith("src/")) {
      expected = "src/" + expected.replace(/^src\//, "");
    }
    if (!path.extname(expected)) {
      expected = expected + ".jsx";
    }

    return { exists: false, path: expected };
  }

  static _findCircularDependencies(graph) {
    const circles = [];
    const visited = new Set();
    const inStack = new Set();

    const dfs = (node, pathArr) => {
      visited.add(node);
      inStack.add(node);
      const neighbors = graph[node] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && graph[neighbor]) {
          dfs(neighbor, [...pathArr, neighbor]);
        } else if (inStack.has(neighbor)) {
          const cycleStart = pathArr.indexOf(neighbor);
          const cycle = pathArr.slice(cycleStart > -1 ? cycleStart : 0).concat(neighbor);
          circles.push(cycle);
        }
      }
      inStack.delete(node);
    };

    for (const node of Object.keys(graph)) {
      if (!visited.has(node)) {
        dfs(node, [node]);
      }
    }
    return circles;
  }

  static async _collectFilesRecursive(currentDir, rootDir, resultList) {
    let entries = [];
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === "artifacts") continue;
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        await this._collectFilesRecursive(fullPath, rootDir, resultList);
      } else {
        resultList.push(relPath);
      }
    }
  }
}
