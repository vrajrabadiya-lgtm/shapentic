import { BuildDiagnostics } from './core/BuildDiagnostics.js';

const manualTests = [
  {
    name: 'Missing File',
    logs: `vite v5.4.21 building for production...
✓ 34 modules transformed.
x Build failed in 1.23s
error during build:
[vite]: Rollup failed to resolve import "./pages/ServicesPage.jsx" from "src/App.jsx".
This is most likely unintended because it can break your application at runtime.`
  },
  {
    name: 'Missing Package',
    logs: `vite v5.4.21 building for production...
[vite]: Rollup failed to resolve import "react-icons/fa" from "src/components/Footer.jsx".
Failed to resolve entry for package "react-icons". The package may have incorrect main/module/exports specified in its package.json.`
  },
  {
    name: 'Missing Module',
    logs: `Error: Cannot find module '@three/drei/core'
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:1145:15)`
  },
  {
    name: 'Syntax Error',
    logs: `SyntaxError: Unexpected token (10:5)
    at Object.parse (file:///project/node_modules/babel/index.js:5:10)`
  },
  {
    name: 'CSS Error',
    logs: `error during build:
Error: Cannot resolve CSS file 'src/styles/theme.css' referenced in index.html`
  },
  {
    name: 'JSX Error',
    logs: `Transform failed with 1 error:
src/components/HeroSection.jsx:15:20: ERROR: Unexpected JSX element <invalid-element>`
  },
  {
    name: 'TypeScript Error',
    logs: `src/types/scene.ts(12,5): error TS2304: Cannot find name 'Vector3'.
Type error: Cannot find type 'SceneProps'`
  },
  {
    name: 'Bundler Error',
    logs: `Rollup Error: Could not emit chunk for module "three/src/core/BufferGeometry.js"`
  },
  {
    name: 'Out Of Memory',
    logs: `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
Aborted (core dumped)`
  },
  {
    name: 'Node Crash',
    logs: `Segmentation fault (core dumped)
Node process crashed abruptly during asset processing.`
  },
  {
    name: 'Unknown Error',
    logs: `An inexplicable fatal error occurred in an external dependency build plugin.
Exit code 137.`
  }
];

console.log("==========================================");
console.log("   PHASE 5.1 MANUAL BUILD DIAGNOSTIC TESTS");
console.log("==========================================\n");

let passed = 0;
let failed = 0;

manualTests.forEach((test) => {
  const result = BuildDiagnostics.analyzeLogs(test.logs);
  console.log(`--- [TEST: ${test.name}] ---`);
  console.log("Result:", JSON.stringify(result, null, 2));
  
  // Verify recoverability matches expected specifications
  const unrecoverableCategories = ["OutOfMemory", "NodeCrash", "Unknown"];
  const isExpectedRecoverable = !unrecoverableCategories.includes(result.category);
  
  if (result.category !== "Unknown" || test.name === "Unknown Error") {
    if (result.recoverable === isExpectedRecoverable) {
      console.log("✓ Status: PASSED (Recoverability correctly flagged)\n");
      passed++;
      return;
    }
  }
  console.log("✗ Status: FAILED validation check\n");
  failed++;
});

console.log(`Total Tests Run: ${manualTests.length} | Passed: ${passed} | Failed: ${failed}`);
if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
