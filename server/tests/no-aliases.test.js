/**
 * Unit test — verify no path aliases remain in server/
 *
 * Validates: Requirements R5
 *
 * Reads every .js file under server/ recursively and asserts that none
 * contain the strings @lib/, @core/, or @templates/ which would indicate
 * unresolved path alias imports from the Next.js source.
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_DIR = path.resolve(__dirname, "..");

/** Recursively collect all .js file paths under a directory */
function collectJSFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== "tests") {
      files.push(...collectJSFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("No path aliases remain in server/", () => {
  const jsFiles = collectJSFiles(SERVER_DIR);
  const aliases = ["@lib/", "@core/", "@templates/"];

  it("should find at least some .js files in the server directory", () => {
    expect(jsFiles.length).toBeGreaterThan(0);
  });

  for (const file of jsFiles) {
    const relPath = path.relative(SERVER_DIR, file);
    const content = fs.readFileSync(file, "utf-8");

    for (const alias of aliases) {
      it(`${relPath} should not contain "${alias}"`, () => {
        const lines = content.split("\n");
        const offendingLines = lines
          .map((line, idx) => (line.includes(alias) ? idx + 1 : -1))
          .filter((idx) => idx !== -1);

        expect(
          offendingLines,
          `${relPath} contains "${alias}" on line(s): ${offendingLines.join(", ")}`
        ).toEqual([]);
      });
    }
  }
});
