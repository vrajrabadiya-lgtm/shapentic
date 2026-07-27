export class BuildDiagnostics {
  /**
   * Analyzes raw build logs and returns structured diagnostics.
   * @param {string} logs - Raw stdout/stderr from npm install/build
   * @returns {Object} Structured diagnostics
   */
  static analyzeLogs(logs) {
    if (!logs) {
      return {
        status: "FAILED",
        category: "Unknown",
        summary: "No build logs provided.",
        recoverable: false,
        detectedAt: new Date()
      };
    }

    // Heuristics for different errors
    const heuristics = [
      {
        category: "OutOfMemory",
        regex: /(?:OOM|heap out of memory|ENOMEM|JavaScript heap out of memory)/i,
        recoverable: false,
        summary: () => "Node process failed due to out of memory (OOM)"
      },
      {
        category: "NodeCrash",
        regex: /(?:segmentation fault|node crash|fatal error in v8|abort trap|Segmentation fault \(core dumped\))/i,
        recoverable: false,
        summary: () => "Node process terminated unexpectedly (crash)"
      },
      {
        category: "CSSError",
        regex: /Cannot resolve CSS file[^'"]*['"]?([^\s'"]+\.css)['"]?/i,
        recoverable: true,
        summary: (match) => `CSS import error: ${match[1]}`
      },
      {
        category: "MissingModule",
        regex: /Cannot find module\s+['"]?([^'"\s]+)['"]?/i,
        recoverable: true,
        summary: (match) => `Missing module: ${match[1]}`
      },
      {
        category: "MissingFile",
        regex: /(?:Could not resolve|failed to resolve import)\s+['"]?(\.[^'"\s]+)['"]?/i,
        recoverable: true,
        summary: (match) => `Missing source file: ${match[1]}`
      },
      {
        category: "MissingPackage",
        regex: /(?:Cannot resolve|Failed to resolve entry for package|failed to resolve import)\s+['"]?([^.'"][^'"\s]*)['"]?/i,
        recoverable: true,
        summary: (match) => `Missing package: ${match[1]}`
      },
      {
        category: "JSXError",
        regex: /(?:Unexpected JSX|Invalid JSX|Transform failed with \d+ error).*?\n(.*)/i,
        recoverable: true,
        summary: (match) => `JSX parsing error: ${match[1] ? match[1].trim() : 'Invalid JSX'}`
      },
      {
        category: "TypeScriptError",
        regex: /(?:Cannot find type|Type error|TS\d{4}):\s*(.*)/i,
        recoverable: true,
        summary: (match) => `TypeScript error: ${match[1]}`
      },
      {
        category: "SyntaxError",
        regex: /(?:Unexpected token|Unexpected identifier|Missing semicolon|SyntaxError):\s*(.*)/i,
        recoverable: true,
        summary: (match) => `Syntax error: ${match[1]}`
      },
      {
        category: "BundlerError",
        regex: /(?:Rollup Error|Plugin Error):\s*(.*)/i,
        recoverable: true,
        summary: (match) => `Bundler error: ${match[1]}`
      }
    ];

    let category = "Unknown";
    let summary = "Unknown build failure. Check logs for details.";
    let recoverable = false; // Default to false for unknown errors

    for (const rule of heuristics) {
      const match = logs.match(rule.regex);
      if (match) {
        category = rule.category;
        summary = rule.summary(match);
        recoverable = rule.recoverable;
        break; // Stop at first matched category
      }
    }

    return {
      status: "FAILED",
      category,
      summary,
      recoverable,
      detectedAt: new Date()
    };
  }
}
