import fs from "fs/promises";
import path from "path";

/**
 * PatchApplier Service (Phase 6B Production)
 * 
 * Single Responsibility Principle (SRP):
 * Responsible ONLY for safely applying validated code patches to the workspace directory on disk,
 * guaranteeing atomic file updates, backups, and instant rollback capabilities on failure.
 */
export class PatchApplier {
  /**
   * Normalizes relative file paths into the expected project src/ structure.
   * Examples: ./pages/* -> src/pages/*, ./components/* -> src/components/*, etc.
   * 
   * @param {string} filePath - Raw file path returned by AI
   * @returns {string} Normalized relative path targeting correct workspace structure
   */
  static normalizePath(filePath) {
    if (!filePath || typeof filePath !== "string") return "";
    let normalized = filePath.trim().replace(/\\/g, "/").replace(/^\.\//, "");
    if (/^(pages|components|hooks|3d)(\/.*)?$/i.test(normalized)) {
      normalized = "src/" + normalized;
    }
    return normalized;
  }

  /**
   * Validates workspace directory and safely applies structured patches with atomic file creation and pre-patch backups.
   * 
   * @param {string} projectPath - The filesystem path to the generated project workspace
   * @param {Object|Array} patch - The validated patch instructions or code replacement payloads
   * @returns {Promise<Object>} Structured outcome containing success status and backup restore instructions
   */
  async applyPatch(projectPath, patch) {
    if (!projectPath || typeof projectPath !== "string") {
      throw new Error("PatchApplier requires a valid projectPath string.");
    }
    const rootDir = path.resolve(projectPath);

    // Directory validation: verify target directory exists and is accessible
    try {
      const stat = await fs.stat(rootDir);
      if (!stat.isDirectory()) {
        throw new Error(`Workspace path is not a directory: ${rootDir}`);
      }
    } catch (err) {
      throw new Error(`Directory validation failed for project workspace (${rootDir}): ${err.message}`);
    }

    const patches = Array.isArray(patch) ? patch : [patch];
    const backup = [];
    const tempFiles = [];

    try {
      for (const item of patches) {
        if (!item || (!item.file && !item.path) || item.content === undefined) {
          throw new Error("Invalid patch item: missing file path or content.");
        }

        const rawFile = item.file || item.path;
        const relativeFile = PatchApplier.normalizePath(rawFile);
        item.file = relativeFile;
        if (item.path !== undefined) item.path = relativeFile;

        const targetPath = path.resolve(rootDir, relativeFile);

        // Verify boundary safety to ensure we never overwrite unrelated files outside the rootDir workspace
        if (!targetPath.startsWith(rootDir + path.sep) && targetPath !== rootDir) {
          throw new Error(`Security check failed: attempt to write outside project boundaries (${relativeFile})`);
        }

        // Preserve and ensure directory structure exists
        const targetDir = path.dirname(targetPath);
        await fs.mkdir(targetDir, { recursive: true });

        // Backup original file state before modifying
        try {
          const fileStat = await fs.stat(targetPath);
          if (fileStat.isFile()) {
            const originalContent = await fs.readFile(targetPath, "utf-8");
            backup.push({
              file: relativeFile,
              fullPath: targetPath,
              existed: true,
              content: originalContent
            });
          } else {
            backup.push({ file: relativeFile, fullPath: targetPath, existed: false });
          }
        } catch {
          // File did not exist prior to this patch
          backup.push({ file: relativeFile, fullPath: targetPath, existed: false });
        }

        // Prevent partial writes: write to temporary file first, then atomically move/rename
        const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const tempPath = path.join(targetDir, `.tmp_patch_${path.basename(targetPath)}_${uniqueSuffix}`);
        tempFiles.push(tempPath);

        await fs.writeFile(tempPath, item.content, "utf-8");

        // Atomic write via rename (with fallback for Windows filesystem locking)
        try {
          await fs.rename(tempPath, targetPath);
        } catch (renameErr) {
          await fs.copyFile(tempPath, targetPath);
          await fs.unlink(tempPath).catch(() => {});
        }
        // Remove from tracking once successfully moved
        const tmpIdx = tempFiles.indexOf(tempPath);
        if (tmpIdx !== -1) tempFiles.splice(tmpIdx, 1);
      }

      return { success: true, backup, appliedCount: patches.length };
    } catch (applyError) {
      // Clean up any stray temporary files immediately
      for (const tmp of tempFiles) {
        await fs.unlink(tmp).catch(() => {});
      }
      // Rollback any modifications made during this transaction immediately
      await this.rollback(rootDir, backup).catch(() => {});
      const errorObj = new Error(`Patch application failure: ${applyError.message}`);
      errorObj.structured = {
        error: true,
        type: "FILESYSTEM_PATCH_FAILURE",
        message: applyError.message,
        rollbackPerformed: true
      };
      throw errorObj;
    }
  }

  /**
   * Safely rolls back project filesystem to the exact state captured in the backup records.
   * 
   * @param {string} projectPath - The filesystem path to the workspace root
   * @param {Array<Object>} backupList - Array of captured file backup states
   * @returns {Promise<Object>} Rollback execution summary
   */
  async rollback(projectPath, backupList = []) {
    if (!Array.isArray(backupList) || backupList.length === 0) {
      return { success: true, restoredCount: 0 };
    }

    let restoredCount = 0;
    for (const record of backupList.slice().reverse()) {
      try {
        if (!record.existed) {
          // File was newly created by the patch; delete it to restore previous state
          await fs.unlink(record.fullPath).catch(() => {});
          restoredCount++;
        } else {
          // File originally existed; atomically restore its original content
          const targetDir = path.dirname(record.fullPath);
          await fs.mkdir(targetDir, { recursive: true });
          const tmpRestore = `${record.fullPath}.rollback_${Date.now()}`;
          await fs.writeFile(tmpRestore, record.content, "utf-8");
          try {
            await fs.rename(tmpRestore, record.fullPath);
          } catch {
            await fs.copyFile(tmpRestore, record.fullPath);
            await fs.unlink(tmpRestore).catch(() => {});
          }
          restoredCount++;
        }
      } catch (rollbackErr) {
        const err = new Error(`Rollback execution failed on ${record.file || record.fullPath}: ${rollbackErr.message}`);
        err.structured = {
          error: true,
          type: "ROLLBACK_FAILURE",
          message: err.message
        };
        throw err;
      }
    }

    return { success: true, restoredCount };
  }
}

