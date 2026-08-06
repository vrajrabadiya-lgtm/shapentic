/**
 * RepairAnalytics - Phase 5
 * 
 * A simple in-memory store for capturing validation and repair analytics.
 */
export class RepairAnalytics {
  static timings = new Map();
  static repairs = [];
  static validationDurations = [];
  static repairDurations = [];

  /**
   * Starts a timer for a given process.
   * @param {string} id A unique identifier for the timer.
   */
  static startTimer(id) {
    this.timings.set(id, process.hrtime());
  }

  /**
   * Ends a timer and records the duration.
   * @param {string} id The unique identifier for the timer to end.
   * @param {'validation' | 'repair'} type The type of duration being recorded.
   */
  static endTimer(id, type) {
    const startTime = this.timings.get(id);
    if (startTime) {
      const diff = process.hrtime(startTime);
      const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6;
      
      if (type === 'validation') {
        this.validationDurations.push(durationMs);
      } else if (type === 'repair') {
        this.repairDurations.push(durationMs);
      }
      this.timings.delete(id);
      return durationMs;
    }
    return 0;
  }

  /**
   * Logs the result of a repair attempt.
   * @param {object} repairResult The result from RepairEngine.executeRepairPlan.
   */
  static logRepair(repairResult) {
    this.repairs.push({
      timestamp: new Date().toISOString(),
      successful_count: repairResult.successful.length,
      failed_count: repairResult.failed.length,
      repairs: repairResult,
    });
  }

  /**
   * Retrieves all collected analytics data.
   */
  static getReport() {
    return {
      total_repair_cycles: this.repairs.length,
      total_validation_cycles: this.validationDurations.length,
      avg_validation_duration_ms: this.validationDurations.reduce((a, b) => a + b, 0) / (this.validationDurations.length || 1),
      avg_repair_duration_ms: this.repairDurations.reduce((a, b) => a + b, 0) / (this.repairDurations.length || 1),
      repair_attempts: this.repairs,
    };
  }

  /**
   * Resets all analytics data.
   */
  static reset() {
    this.timings.clear();
    this.repairs = [];
    this.validationDurations = [];
    this.repairDurations = [];
  }
}

export default RepairAnalytics;