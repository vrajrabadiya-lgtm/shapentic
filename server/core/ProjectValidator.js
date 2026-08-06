import fs from 'fs/promises';
import path from 'path';
// TODO: Conditionally import '@babel/parser' if user approves.

/**
 * ProjectValidator - Phase 5
 *
 * Validates the generated project files after the rendering process.
 * It checks for structural integrity, code correctness, and dependency issues.
 */
export class ProjectValidator {
  /**
   * Orchestrates the project validation process.
   * @param {string} projectPath The root path of the generated project.
   * @param {object} componentPlan The component plan from the blueprint, used as a source of truth for file structure.
   * @returns {Promise<{errors: string[], warnings: string[], score: number, summary: string}>}
   */
  static async validate(projectPath, componentPlan) {
    const errors = [];
    const warnings = [];

    // --- Run All Validation Checks ---
    const structureResult = await this.#validateFolderStructure(projectPath, componentPlan);
    errors.push(...structureResult.errors);
    warnings.push(...structureResult.warnings);

    const packageJsonResult = await this.#validatePackageJson(projectPath);
    errors.push(...packageJsonResult.errors);
    
    // This check depends on the user's choice.
    const codeIntegrityResult = await this.#validateCodeIntegrity(projectPath, componentPlan);
    errors.push(...codeIntegrityResult.errors);
    warnings.push(...codeIntegrityResult.warnings);

    // --- Calculate Score & Summary ---
    let score = 100;
    score -= errors.length * 5; // Project errors might be more numerous but less severe than blueprint errors
    score -= warnings.length * 1;
    score = Math.max(0, score);

    let summary = `Project validation complete. Score: ${score}.`;
    if (errors.length > 0) {
      summary += ` ${errors.length} error(s) found. Project may not build or run correctly.`;
    } else if (warnings.length > 0) {
      summary += ` ${warnings.length} warning(s) found. Project is likely functional but has issues.`;
    } else {
      summary += " Project appears to be valid and well-formed.";
    }

    return { errors, warnings, score, summary };
  }

  // ----------------------------------------------------
  // PRIVATE VALIDATION HELPERS
  // ----------------------------------------------------

  static async #validateFolderStructure(projectPath, componentPlan) {
    const errors = [];
    const warnings = [];
    const expectedFolders = new Set(componentPlan?.folders || []);
    const expectedFiles = new Set(componentPlan?.components?.map(c => c.file) || []);
    
    for (const folder of expectedFolders) {
        try {
            await fs.access(path.join(projectPath, folder));
        } catch {
            errors.push(`Missing required folder: "${folder}"`);
        }
    }

    for (const file of expectedFiles) {
        try {
            await fs.access(path.join(projectPath, file));
        } catch {
            errors.push(`Missing required file from component plan: "${file}"`);
        }
    }
    
    // Check for unexpected files (could be a warning)
    // STUB: This would require recursively listing all files and checking against the plan.
    
    return { errors, warnings };
  }

  static async #validatePackageJson(projectPath) {
    const errors = [];
    const packageJsonPath = path.join(projectPath, 'package.json');
    try {
        const content = await fs.readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(content);

        if (!packageJson.name) errors.push("`package.json` is missing the `name` field.");
        if (!packageJson.version) errors.push("`package.json` is missing the `version` field.");
        if (!packageJson.dependencies || Object.keys(packageJson.dependencies).length === 0) {
            errors.push("`package.json` has no dependencies listed.");
        }
    } catch (e) {
        if (e.code === 'ENOENT') {
            errors.push("`package.json` not found at project root.");
        } else if (e instanceof SyntaxError) {
            errors.push("`package.json` is not valid JSON.");
        } else {
            errors.push(`Failed to read or parse package.json: ${e.message}`);
        }
    }
    return { errors };
  }

  static async #validateCodeIntegrity(projectPath, componentPlan) {
    const errors = [];
    const warnings = [];

    // TODO: This implementation depends on the user's choice.
    // If approved, we would use '@babel/parser' here to traverse the AST of each .jsx/.tsx file.
    // Without it, we are limited to basic regex checks.
    warnings.push("Code integrity check is a STUB. Full implementation requires a parser dependency.");

    // Example of a check if a parser was available:
    // for (const component of componentPlan.components) {
    //   const filePath = path.join(projectPath, component.file);
    //   try {
    //     const code = await fs.readFile(filePath, 'utf-8');
    //     // const ast = babelParser.parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    //     // Traverse AST to check for undeclared variables, unused imports, invalid syntax...
    //   } catch (e) {
    //     errors.push(`Failed to parse or validate ${component.file}: ${e.message}`);
    //   }
    // }

    return { errors, warnings };
  }
}

export default ProjectValidator;