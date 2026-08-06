import { run_shell_command } from '...'; // Correct path needed
import { replace } from '...'; // Correct path needed
import { AIProvider } from '../../core/AIProvider.js';

/**
 * RepairEngine - Phase 5
 * 
 * Analyzes validation reports and attempts to automatically fix issues.
 */
export class RepairEngine {

  /**
   * Creates a structured repair plan from a validation report.
   * @param {{errors: string[], warnings: string[]}} validationReport
   * @returns {object[]} A list of repair action objects.
   */
  static createRepairPlan(validationReport) {
    const plan = [];
    const allIssues = [...validationReport.errors, ...validationReport.warnings];

    for (const issue of allIssues) {
      let repairAction = null;
      
      // --- Heuristics to determine the repair category ---
      if (issue.includes("Missing required file")) {
        repairAction = this.#planCreateMissingFile(issue);
      } else if (issue.includes("has no dependencies")) {
        repairAction = this.#planInstallDependencies(issue);
      } else if (issue.includes("is not valid JSON")) {
        repairAction = this.#planFixCorruptedJson(issue);
      }
      // Add more heuristics here for other issue types...

      if (repairAction) {
        plan.push(repairAction);
      }
    }

    return plan;
  }

  /**
   * Executes a repair plan.
   * @param {object[]} plan The repair plan created by createRepairPlan.
   * @param {string} projectPath The root path of the project to repair.
   * @returns {Promise<{successful: object[], failed: object[]}>}
   */
  static async executeRepairPlan(plan, projectPath) {
    const successful = [];
    const failed = [];

    for (const action of plan) {
      try {
        switch (action.category) {
          case 'DEPENDENCY':
            await this.#addMissingDependency(action, projectPath);
            break;
          // Add other cases here
          default:
            throw new Error(`Unknown repair category: ${action.category}`);
        }
        successful.push(action);
      } catch (error) {
        action.error = error.message;
        failed.push(action);
      }
    }
    return { successful, failed };
  }


  // ----------------------------------------------------
  // PRIVATE PLANNING & REPAIR HELPERS
  // ----------------------------------------------------

  static #planCreateMissingFile(issue) {
    const match = issue.match(/Missing required file: "([^"]+)"/);
    if (!match) return null;
    
    return {
      id: `create-file-${Date.now()}`,
      category: 'FILE_STRUCTURE',
      severity: 'high',
      reason: issue,
      affected_files: [match[1]],
      recommended_fix: {
        type: 'automatic',
        description: `Create a placeholder file for the missing component.`
      }
    };
  }

  static #planInstallDependencies(issue) {
    return {
      id: `install-deps-${Date.now()}`,
      category: 'DEPENDENCY',
      severity: 'high',
      reason: 'The package.json is missing dependencies.',
      affected_files: ['package.json'],
      recommended_fix: {
        type: 'automatic',
        description: 'Run `npm install` to populate the node_modules directory.'
      }
    };
  }
  
  static #planFixCorruptedJson(issue) {
      return {
          id: `fix-json-${Date.now()}`,
          category: 'FILE_CONTENT',
          severity: 'high',
          reason: issue,
          affected_files: ['package.json'], // Assuming package.json for now
          recommended_fix: {
              type: 'manual', // JSON syntax can be tricky to fix automatically
              description: 'Manually review and correct the syntax of the specified JSON file.'
          }
      };
  }

  // --- Actual Repair Methods ---

  static async #addMissingDependency(action, projectPath) {
    // In a real scenario, we might parse the file to see WHICH dependency is missing.
    // For now, we assume a simple `npm install` is sufficient.
    const { stdout, stderr, exitCode } = await run_shell_command({
        command: 'npm install',
        dir_path: projectPath,
        description: 'Installing project dependencies.'
    });

    if (exitCode !== 0) {
      throw new Error(`'npm install' failed with exit code ${exitCode}: ${stderr}`);
    }
  }
  
  /**
   * STUB for fixing a missing import statement.
   */
  static async #fixMissingImport(action, projectPath) {
    // const filePath = path.join(projectPath, action.affected_files[0]);
    // const content = await fs.readFile(filePath, 'utf-8');
    // const newContent = action.details.importStatement + '\n' + content;
    // await fs.writeFile(filePath, newContent);
    console.log("Stub: #fixMissingImport");
  }

  /**
   * STUB for fixing broken JSX using an AI call.
   */
  static async #fixBrokenJsx(action, projectPath) {
    // const filePath = path.join(projectPath, action.affected_files[0]);
    // const code = await fs.readFile(filePath, 'utf-8');
    // const systemPrompt = "You are a React expert. Fix the following JSX code snippet to be syntactically correct. Return only the corrected code.";
    // const correctedCode = await AIProvider.generateText(systemPrompt, code);
    // await fs.writeFile(filePath, correctedCode);
    console.log("Stub: #fixBrokenJsx");
  }
}

export default RepairEngine;