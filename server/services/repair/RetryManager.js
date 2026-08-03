/**
 * RetryManager Service (Phase 7.1 Production Hardening)
 * 
 * Single Responsibility Principle (SRP):
 * Responsible ONLY for managing repair attempt counters, thresholds, backoff schedules, and retry decision rules.
 * 
 * Responsibilities:
 * - Allow retries ONLY for recoverable compiler errors, missing files, missing assets, and missing stylesheets.
 * - Abort immediately on unrecoverable failures: Invalid AI JSON, Empty AI response, Invalid patch schema, and filesystem corruption.
 */
export class RetryManager {
  /**
   * Initializes the RetryManager with configurable attempt thresholds and exponential backoff timing.
   * 
   * @param {Object} [options={}] - Retry manager configuration options
   * @param {number} [options.maxRetries=2] - Maximum allowed automated repair attempts before aborting
   * @param {number} [options.baseDelayMs=1000] - Base delay for exponential backoff scheduling
   */
  constructor(options = { maxRetries: 2, baseDelayMs: 1000 }) {
    this.maxRetries = options.maxRetries !== undefined ? options.maxRetries : 2;
    this.baseDelayMs = options.baseDelayMs !== undefined ? options.baseDelayMs : 1000;
  }

  /**
   * Determines whether the given project is eligible for another automated repair attempt.
   * Enforces immediate terminal stopping on malformed AI output or filesystem corruption.
   * 
   * @param {Object} project - Project state containing buildDiagnostics and attempt tracking
   * @param {string} [reason=""] - Optional retry validation context or error classification
   * @returns {boolean} True if attempts remain under maxRetries and error is recoverable
   */
  canRetry(project, reason = "") {
    if (!project || !project.buildDiagnostics) {
      return false;
    }
    // Stop immediately on unrecoverable diagnostic errors or terminal repair failures
    if (project.buildDiagnostics.recoverable === false) {
      return false;
    }

    const terminalReasons = [
      "UNRECOVERABLE",
      "ROLLBACK_FAILURE",
      "INVALID_JSON",
      "MALFORMED_JSON",
      "EMPTY_RESPONSE",
      "INVALID_SCHEMA",
      "INVALID_PATCH",
      "FILESYSTEM_CORRUPTION",
      "PATH_TRAVERSAL",
      "SECURITY_VIOLATION",
      "DIRECTORY_VALIDATION_FAILED"
    ];

    if (reason && typeof reason === "string") {
      const upperReason = reason.toUpperCase();
      if (terminalReasons.some(tr => upperReason.includes(tr))) {
        return false;
      }
    }

    const currentAttempts = project.repair?.totalAttempts || 0;
    return currentAttempts < this.maxRetries;
  }

  /**
   * Calculates the exponential backoff delay in milliseconds for the current recovery attempt.
   * 
   * @param {Object} project - Project state containing totalAttempts
   * @returns {number} Backoff delay duration in milliseconds (max capped at 10000ms)
   */
  getBackoffDelay(project) {
    const attempts = project?.repair?.totalAttempts || 0;
    const delay = this.baseDelayMs * Math.pow(2, attempts);
    return Math.min(10000, delay);
  }

  /**
   * Schedules backoff delay and records the retry event in project retry history.
   * 
   * @param {Object} project - Project execution document or metadata state
   * @param {string} [reason="Build recovery retry"] - Reason why retry cycle was triggered
   * @returns {Promise<number>} Resolves to the backoff delay applied
   */
  async scheduleBackoff(project, reason = "Build recovery retry") {
    const delayMs = this.getBackoffDelay(project);
    this.recordRetryEvent(project, reason, delayMs);

    // Skip timer sleep during automated test execution for maximum performance
    if (delayMs > 0 && process.env.NODE_ENV !== "test" && this.baseDelayMs > 10) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    return delayMs;
  }

  /**
   * Records a structured retry event inside the project's repair history.
   */
  recordRetryEvent(project, reason, backoffMs) {
    if (!project.repair) {
      project.repair = { attempts: [], retryHistory: [], totalAttempts: 0, success: false };
    }
    if (!project.repair.retryHistory) {
      project.repair.retryHistory = [];
    }
    project.repair.retryHistory.push({
      attempt: (project.repair.totalAttempts || 0) + 1,
      reason: reason || project.buildDiagnostics?.category || "Automated retry",
      backoffMs,
      timestamp: new Date()
    });
  }

  /**
   * Increments the repair attempt counter for the project and records attempt intent.
   * 
   * @param {Object} project - Project execution document or metadata state
   * @param {string} [reason="Attempt increment"] - Reason for attempt execution
   * @returns {number} The updated attempt count
   */
  increment(project, reason = "Attempt increment") {
    if (!project.repair) {
      project.repair = { attempts: [], retryHistory: [], totalAttempts: 0, success: false };
    }
    project.repair.totalAttempts = (project.repair.totalAttempts || 0) + 1;
    return project.repair.totalAttempts;
  }

  /**
   * Retrieves structural status regarding current retry attempts, remaining capacity, and historical backoffs.
   * 
   * @param {Object} project - Project execution document or metadata state
   * @returns {Object} Comprehensive retry status summary
   */
  getStatus(project) {
    const totalAttempts = project?.repair?.totalAttempts || 0;
    const remaining = Math.max(0, this.maxRetries - totalAttempts);
    const isUnrecoverable = project?.buildDiagnostics?.recoverable === false;
    
    let reason = "Eligible for automated retry";
    if (isUnrecoverable) {
      reason = "Stopped immediately: Diagnostic failure identified as unrecoverable";
    } else if (remaining === 0) {
      reason = `Exhausted maximum retry attempts threshold (${this.maxRetries})`;
    }

    return {
      totalAttempts,
      maxRetries: this.maxRetries,
      remaining,
      canRetry: this.canRetry(project),
      recoverable: !isUnrecoverable,
      reason,
      retryHistory: project?.repair?.retryHistory || [],
      nextBackoffMs: this.canRetry(project) ? this.getBackoffDelay(project) : 0,
      success: project?.repair?.success || false
    };
  }
}
