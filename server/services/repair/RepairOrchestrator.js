import ProjectValidator from '../../core/ProjectValidator.js';
import RepairEngine from './RepairEngine.js';
import RepairAnalytics from './RepairAnalytics.js';
import { logger } from '../../core/logger.js';

const MAX_RETRIES = 3;

/**
 * RepairOrchestrator - Phase 5
 * 
 * Manages the iterative validation-repair-revalidation loop for a generated project.
 */
export class RepairOrchestrator {

  /**
   * Orchestrates the full validation and repair cycle for a generated project.
   * @param {string} projectPath The root path of the generated project.
   * @param {object} blueprint The blueprint used for generation, needed for context.
   * @returns {Promise<object>} A final report summarizing the entire process.
   */
  static async validateAndRepairProject(projectPath, blueprint) {
    logger.info(`[RepairOrchestrator] Starting validation and repair for project at: ${projectPath}`);
    RepairAnalytics.reset();
    
    let attempts = 0;
    let lastValidationReport = null;
    const repairHistory = [];

    while (attempts < MAX_RETRIES) {
      attempts++;
      logger.info(`[RepairOrchestrator] Validation attempt #${attempts}`);

      const validationTimerId = `validation-${attempts}`;
      RepairAnalytics.startTimer(validationTimerId);
      
      const componentPlan = blueprint.phases?.componentPlanner || {};
      lastValidationReport = await ProjectValidator.validate(projectPath, componentPlan);
      
      RepairAnalytics.endTimer(validationTimerId, 'validation');
      logger.info(`[RepairOrchestrator] Validation completed. Score: ${lastValidationReport.score}. Errors: ${lastValidationReport.errors.length}`);

      // If validation is successful, we're done.
      if (lastValidationReport.errors.length === 0) {
        logger.info('[RepairOrchestrator] Project validation successful. No repairs needed.');
        return this.#createFinalReport(true, 'Validation successful.', repairHistory);
      }

      logger.warn(`[RepairOrchestrator] Validation failed. Attempting to generate a repair plan.`);
      const repairPlan = RepairEngine.createRepairPlan(lastValidationReport);

      // If there are errors but no repair plan can be generated, we must stop.
      if (repairPlan.length === 0) {
        logger.error('[RepairOrchestrator] Cannot create a repair plan for the found issues. Halting.');
        return this.#createFinalReport(false, 'Validation failed, and no automatic repairs could be planned.', repairHistory, lastValidationReport);
      }
      
      logger.info(`[RepairOrchestrator] Repair plan created with ${repairPlan.length} action(s). Executing...`);
      const repairTimerId = `repair-${attempts}`;
      RepairAnalytics.startTimer(repairTimerId);

      const repairResult = await RepairEngine.executeRepairPlan(repairPlan, projectPath);
      
      RepairAnalytics.endTimer(repairTimerId, 'repair');
      RepairAnalytics.logRepair(repairResult);
      repairHistory.push(repairResult);
      
      logger.info(`[RepairOrchestrator] Repair attempt #${attempts} complete. Success: ${repairResult.successful.length}, Failed: ${repairResult.failed.length}`);

      if (repairResult.failed.length > 0) {
        logger.error('[RepairOrchestrator] Not all repairs were successful. Halting.');
        return this.#createFinalReport(false, 'Repair process failed to execute all actions.', repairHistory, lastValidationReport);
      }
    }

    logger.error(`[RepairOrchestrator] Maximum retries (${MAX_RETRIES}) reached. Project could not be fully repaired.`);
    return this.#createFinalReport(false, 'Maximum retries reached.', repairHistory, lastValidationReport);
  }

  /**
   * Compiles the final report.
   * @private
   */
  static #createFinalReport(success, message, repairHistory, lastValidationReport) {
    const analyticsReport = RepairAnalytics.getReport();
    return {
      success,
      message,
      analytics: analyticsReport,
      repair_history: repairHistory,
      last_validation_report: lastValidationReport
    };
  }
}

export default RepairOrchestrator;