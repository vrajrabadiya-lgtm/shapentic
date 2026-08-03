import path from "path";

/**
 * RepairPlanner Service (Phase 7.1 Hardened)
 * 
 * Single Responsibility Principle (SRP):
 * Responsible ONLY for synthesizing diagnostic failure reports, workspace scan structures, dependency graphs,
 * and import analysis to collect ALL missing files before generating a single unified repair prompt.
 * 
 * Objectives:
 * - Collect every missing file across components, pages, stylesheets, and visual assets into ONE repair plan.
 * - Eliminate sequential rebuild loops by planning batch repairs in one pass.
 */
export class RepairPlanner {
  /**
   * Generates a comprehensive prioritized repair plan based on diagnostics, scan output, and dependency analysis.
   * 
   * @param {Object} [buildDiagnostics={}] - Structured error diagnostic from compiler verification
   * @param {Object} [workspaceScan={}] - Complete file scan metrics from WorkspaceScanner
   * @param {Object} [dependencyGraph={}] - Import graph analysis from DependencyAnalyzer
   * @returns {Object} Structured repair plan with prioritized action items
   */
  static plan(buildDiagnostics = {}, workspaceScan = {}, dependencyGraph = {}) {
    const planMap = new Map();

    const addItem = (filePath, reason, priority) => {
      if (!filePath || typeof filePath !== "string") return;
      let normPath = filePath.trim().replace(/\\/g, "/");
      if (normPath.startsWith("./") || normPath.startsWith("../")) {
        normPath = "src/" + normPath.replace(/^(\.\/|\.\.\/)+/, "");
      }
      // Ensure source/css/asset paths are inside src/ if not config root files or public assets
      if (!normPath.startsWith("src/") && !normPath.startsWith("public/") && !["package.json", "vite.config.js", "tailwind.config.js", "index.html"].includes(normPath)) {
        normPath = "src/" + normPath;
      }

      if (planMap.has(normPath)) {
        const existing = planMap.get(normPath);
        if (priority < existing.priority) {
          existing.priority = priority;
          existing.reason = reason;
        }
      } else {
        planMap.set(normPath, { path: normPath, reason, priority });
      }
    };

    // Priority 1: Missing files (Pages & Components across WorkspaceScan and DependencyGraph) and broken import paths
    if (Array.isArray(workspaceScan.importErrors)) {
      for (const err of workspaceScan.importErrors) {
        if ((err.type === "incorrectPath" || err.type === "incorrectCase") && err.file) {
          addItem(err.file, `Fix broken import '${err.target}': ${err.message || err.details || "incorrect path/casing"}`, 1);
        } else if (err.type === "missing" && err.path) {
          addItem(err.path, `Missing file required by '${err.file}': imported '${err.target}'`, 1);
        }
      }
    }

    const missingPages = [...(workspaceScan.missingPages || []), ...(dependencyGraph.missingDetails?.missingPages || [])];
    const missingComponents = [...(workspaceScan.missingComponents || []), ...(dependencyGraph.missingDetails?.missingComponents || [])];
    
    for (const p of new Set(missingPages)) {
      addItem(p, "Missing page component required by workspace imports", 1);
    }
    for (const c of new Set(missingComponents)) {
      addItem(c, "Missing source code component required by workspace imports", 1);
    }

    // Also check buildDiagnostics for MissingFile
    if (buildDiagnostics && buildDiagnostics.category === "MissingFile" && buildDiagnostics.summary) {
      const match = buildDiagnostics.summary.match(/(?:\.|\/|src\/)[^\s'"$,;]+/);
      if (match && match[0]) {
        let candidate = match[0].replace(/^["']|["']$/g, "").replace(/\\/g, "/");
        if (!path.posix.extname(candidate)) candidate += ".jsx";
        addItem(candidate, `Flagged by compiler: ${buildDiagnostics.summary}`, 1);
      }
    }

    // Priority 2: JSX errors & Syntax errors in existing source files
    if (buildDiagnostics && ["JSXError", "SyntaxError", "TypeScriptError", "BundlerError"].includes(buildDiagnostics.category)) {
      const match = (buildDiagnostics.summary || "").match(/([^/\s'"(]+\.(jsx?|tsx?))/i);
      const targetFile = match && match[1] ? "src/" + match[1].replace(/^.*[\/]/, "") : "src/App.jsx";
      addItem(targetFile, `Compiler detected ${buildDiagnostics.category}: ${buildDiagnostics.summary}`, 2);
    }

    // Priority 3: Missing CSS Stylesheets across WorkspaceScan and DependencyGraph
    const missingStylesheets = [...(workspaceScan.missingStylesheets || []), ...(dependencyGraph.missingDetails?.missingStylesheets || [])];
    for (const css of new Set(missingStylesheets)) {
      addItem(css, "Missing stylesheet required by component import statements", 3);
    }
    if (buildDiagnostics && buildDiagnostics.category === "CSSError" && buildDiagnostics.summary) {
      const match = buildDiagnostics.summary.match(/(?:\.|\/|src\/)?[^\s'"]+\.css/i);
      if (match && match[0]) {
        addItem(match[0], `Flagged by compiler: ${buildDiagnostics.summary}`, 3);
      }
    }

    // Priority 4: Missing Assets (SVG, PNG, JPG, GLB, JSON, etc.) across WorkspaceScan and DependencyGraph
    const missingAssets = [...(workspaceScan.missingAssets || []), ...(dependencyGraph.missingDetails?.missingAssets || [])];
    for (const ast of new Set(missingAssets)) {
      addItem(ast, "Missing visual asset file required by workspace imports", 4);
    }

    // Priority 5: Missing Imports / Packages / General Unresolved Files
    if (buildDiagnostics && ["MissingPackage", "MissingModule"].includes(buildDiagnostics.category)) {
      addItem("package.json", `Missing package or module dependency: ${buildDiagnostics.summary}`, 5);
    }

    const missingOther = [...(workspaceScan.missingImports || []), ...(dependencyGraph.missingDetails?.unresolvedRelativeImports || [])];
    for (const oth of new Set(missingOther)) {
      let cand = oth.replace(/\\/g, "/");
      if (cand.startsWith("./") || cand.startsWith("../")) {
        cand = "src/" + cand.replace(/^(\.\/|\.\.\/)+/, "");
      }
      if (!path.posix.extname(cand)) cand += ".jsx";
      if (!planMap.has(cand) && !planMap.has("src/" + cand) && !cand.startsWith("http")) {
        addItem(cand, "Unresolved import statement dependency", 5);
      }
    }

    // Any uncategorized missing files directly from dependency graph
    if (Array.isArray(dependencyGraph.missingFiles)) {
      for (const mf of dependencyGraph.missingFiles) {
        if (!planMap.has(mf)) {
          const ext = path.posix.extname(mf).toLowerCase();
          let prio = 1;
          if ([".css", ".scss", ".less"].includes(ext)) prio = 3;
          else if ([".svg", ".png", ".jpg", ".webp", ".glb", ".gltf"].includes(ext)) prio = 4;
          addItem(mf, "Discovered by complete import analysis audit", prio);
        }
      }
    }

    // Convert map to sorted array by priority then filepath
    const repairPlan = Array.from(planMap.values()).sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.path.localeCompare(b.path);
    });

    return { repairPlan };
  }

  plan(buildDiagnostics = {}, workspaceScan = {}, dependencyGraph = {}) {
    return RepairPlanner.plan(buildDiagnostics, workspaceScan, dependencyGraph);
  }
}
