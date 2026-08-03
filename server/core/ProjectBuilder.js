import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { createWriteStream } from 'fs';
import { logger } from './logger.js';
import * as archiver from 'archiver';
import { WorkspaceValidator } from '../services/repair/WorkspaceValidator.js';

const execAsync = util.promisify(exec);

export class ProjectBuilder {
  constructor(projectId) {
    this.projectId = projectId.toString();
    this.baseDir = process.cwd();
    this.buildDir = path.join(this.baseDir, 'artifacts', 'build', this.projectId);
    this.zipDir = path.join(this.baseDir, 'artifacts', 'zips');
    this.zipPath = path.join(this.zipDir, `project-${this.projectId}.zip`);
  }

  async setupProject(project) {
    try {
      await fs.mkdir(this.buildDir, { recursive: true });
      const code = project?.generatedCode || {};
      const writtenFiles = new Set();

      const writeFileGeneric = async (relPath, content) => {
        if (!relPath || content === undefined || content === null) return;
        const targetPath = path.isAbsolute(relPath) ? relPath : path.join(this.buildDir, relPath);
        const normRel = path.relative(this.buildDir, targetPath).replace(/\\/g, '/');
        if (writtenFiles.has(normRel)) return;

        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        let dataStr;
        if (typeof content === 'string') {
          dataStr = content;
        } else if (typeof content === 'object' && typeof content.toString === 'function' && content.toString() !== '[object Object]') {
          dataStr = content.toString();
        } else if (typeof content === 'object' && content.content !== undefined) {
          dataStr = typeof content.content === 'string' ? content.content : JSON.stringify(content.content, null, 2);
        } else {
          dataStr = JSON.stringify(content, null, 2);
        }
        await fs.writeFile(targetPath, dataStr);
        writtenFiles.add(normRel);
        logger.info(`[ProjectBuilder] Wrote file: ${normRel}`);
      };

      const packageData = code.package || {
        name: `project-${this.projectId}`,
        private: true,
        version: "0.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview"
        },
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "react-router-dom": "^6.22.0",
          "framer-motion": "^11.0.3",
          "@react-three/fiber": "^8.15.14",
          "@react-three/drei": "^9.96.1",
          "@react-three/postprocessing": "^2.16.0",
          "three": "^0.160.0"
        },
        devDependencies: {
          "@types/react": "^18.2.43",
          "@types/react-dom": "^18.2.17",
          "@vitejs/plugin-react": "^4.2.1",
          "vite": "^5.0.8",
          "tailwindcss": "^3.4.1",
          "postcss": "^8.4.35",
          "autoprefixer": "^10.4.18"
        }
      };
      await writeFileGeneric('package.json', typeof packageData === 'string' ? packageData : JSON.stringify(packageData, null, 2));

      const collections = ['pages', 'components', 'sections', 'styles', 'assets'];
      for (const category of collections) {
        const items = code[category];
        if (items && typeof items === 'object') {
          for (const [key, val] of Object.entries(items)) {
            if (!val) continue;
            let targetPath = val.file || val.path;
            let content = val.content ?? val.code ?? (typeof val === 'string' ? val : (typeof val === 'object' ? (val.toString && typeof val.toString === 'function' && val.toString() !== '[object Object]' ? val.toString() : JSON.stringify(val, null, 2)) : String(val)));

            if (!targetPath && typeof key === 'string' && Number.isNaN(Number(key))) {
              if (category === 'pages') targetPath = `src/pages/${key}`;
              else if (category === 'components') targetPath = key.includes('Scene') ? `src/3d/${key}` : (key === 'App.jsx' ? `src/${key}` : `src/components/${key}`);
              else if (category === 'sections') targetPath = `src/components/sections/${key}`;
              else if (category === 'styles') targetPath = key === 'index.css' ? `src/${key}` : `src/styles/${key}`;
              else if (category === 'assets') targetPath = `src/assets/${key}`;
            }

            if (targetPath && content !== undefined) {
              await writeFileGeneric(targetPath, content);
            }
          }
        }
      }

      for (const [key, value] of Object.entries(code)) {
        if (key === 'package' || collections.includes(key) || ['fileTree', 'installCmd', 'envSetup'].includes(key)) {
          continue;
        }
        if (typeof value === 'string') {
          if (key.includes('/') || key.includes('\\') || key.includes('.')) {
            await writeFileGeneric(key, value);
          } else if (key === 'appJSX') {
            await writeFileGeneric('src/App.jsx', value);
          } else if (key === 'heroJSX') {
            await writeFileGeneric('src/components/sections/HeroSection.jsx', value);
          } else if (key === 'sampleSection') {
            await writeFileGeneric('src/components/sections/SampleSection.jsx', value);
          } else if (key === 'sceneJSX') {
            await writeFileGeneric('src/3d/Cinematic3DScene.jsx', value);
          }
        }
      }

      if (!writtenFiles.has('index.html')) {
        const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.title || '3D Website'}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
        await writeFileGeneric('index.html', indexHtml);
      }

      if (!writtenFiles.has('vite.config.js')) {
        const viteConfig = `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\n// https://vitejs.dev/config/\nexport default defineConfig({\n  plugins: [react()],\n})`;
        await writeFileGeneric('vite.config.js', viteConfig);
      }

      if (!writtenFiles.has('src/main.jsx')) {
        const mainJsx = `import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.jsx'\nimport './index.css'\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)`;
        await writeFileGeneric('src/main.jsx', mainJsx);
      }

      if (!writtenFiles.has('src/index.css')) {
        const indexCss = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody { margin: 0; padding: 0; background-color: #0a0a14; color: #ffffff; }`;
        await writeFileGeneric('src/index.css', indexCss);
      }

      if (!writtenFiles.has('tailwind.config.js')) {
        const tailwindConfig = `/** @type {import('tailwindcss').Config} */\nexport default {\n  content: [\n    "./index.html",\n    "./src/**/*.{js,ts,jsx,tsx}",\n  ],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}`;
        await writeFileGeneric('tailwind.config.js', tailwindConfig);
      }

      if (!writtenFiles.has('postcss.config.js')) {
        const postcssConfig = `export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}`;
        await writeFileGeneric('postcss.config.js', postcssConfig);
      }

      if (!writtenFiles.has('README.md')) {
        const readme = `# ${project.title || 'Modern 3D Experience Project'}\n\nGenerated by the 3D Website Builder.\n\n## Setup\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## Build\n\n\`\`\`bash\nnpm run build\n\`\`\`\n`;
        await writeFileGeneric('README.md', readme);
      }

      const summaryList = Array.from(writtenFiles);
      logger.info(`[ProjectBuilder] Setup complete. Wrote ${summaryList.length} file(s):\n - ${summaryList.join('\n - ')}`);

      return true;
    } catch (error) {
      logger.error(`Setup failed for project ${this.projectId}`, error);
      throw error;
    }
  }

  async verifyBuild(options = {}) {
    const startedAt = new Date();

    // Phase F5: Pre-build Workspace Validation
    const wsValReport = await WorkspaceValidator.validate(this.buildDir, options.patches || [], options.jobId || null, options.projectId || this.projectId);
    if (!wsValReport.passed) {
      logger.warn(`[ProjectBuilder] Skipping Build Verification due to Workspace Validation failure. Do NOT invoke Vite.`);
      if (options.jobId) {
        logger.job(options.jobId, options.projectId || this.projectId, "Build Verification Skipped", "Workspace validation detected missing files or unresolved imports before build; Vite build will NOT be invoked.");
      }
      const completedAt = new Date();

      let syntheticLogs = `--- PRE-BUILD WORKSPACE VALIDATION FAILED ---\n`;
      if (wsValReport.importErrors && wsValReport.importErrors.length > 0) {
        syntheticLogs += wsValReport.importErrors.map(err => {
          if (err.includes("Could not resolve") || err.includes("Cannot resolve") || err.includes("Cannot find module") || err.includes("failed to resolve")) {
            return err;
          }
          return `Could not resolve "${err}"`;
        }).join("\n") + "\n";
      }
      if (wsValReport.missing && wsValReport.missing.length > 0) {
        syntheticLogs += `Missing files list:\n` + wsValReport.missing.map(f => {
          const spec = f.startsWith('src/') ? `./${f.slice(4).replace(/\.jsx$|\.js$|\.tsx$|\.ts$/i, '')}` : `./${f}`;
          const ext = path.extname(f).toLowerCase();
          if (ext === ".css" || ext === ".scss" || ext === ".less") {
            return `Cannot resolve CSS file "${spec}" (missing physical file: ${f})`;
          }
          return `Could not resolve "${spec}" (missing physical file: ${f})`;
        }).join("\n") + "\n";
      }

      return {
        status: 'FAILED',
        skipped: true,
        reason: 'Workspace Validation Failed: Missing required files or unresolved imports before invoking Vite.',
        validationReport: wsValReport,
        missing: wsValReport.missing || [],
        missingStylesheets: wsValReport.missingStylesheets || [],
        missingAssets: wsValReport.missingAssets || [],
        missingComponents: wsValReport.missingComponents || [],
        importErrors: wsValReport.importErrors || [],
        error: wsValReport.error || "Workspace Validation Failed",
        logs: syntheticLogs,
        startedAt,
        completedAt,
        duration: completedAt.getTime() - startedAt.getTime()
      };
    }

    let buildStatus = 'FAILED';
    let buildLogs = '';
    let buildError = null;

    try {
      // Run npm install with increased buffer limits to prevent child_process deadlock on large warning outputs
      const { stdout: installOut, stderr: installErr } = await execAsync('npm install --no-audit --no-fund --quiet', { 
        cwd: this.buildDir,
        maxBuffer: 10 * 1024 * 1024
      });
      buildLogs += `--- NPM INSTALL ---\n${installOut}\n${installErr}\n`;
      
      // Run npm build with increased buffer limits
      const { stdout: buildOut, stderr: buildErr } = await execAsync('npm run build', { 
        cwd: this.buildDir,
        maxBuffer: 10 * 1024 * 1024
      });
      buildLogs += `\n--- NPM BUILD ---\n${buildOut}\n${buildErr}\n`;
      
      buildStatus = 'SUCCESS';
    } catch (error) {
      buildError = error.message;
      if (error.stdout) buildLogs += `\nSTDOUT:\n${error.stdout}`;
      if (error.stderr) buildLogs += `\nSTDERR:\n${error.stderr}`;
      if (error.stack) buildLogs += `\nSTACK TRACE:\n${error.stack}`;
    }

    const completedAt = new Date();
    
    return {
      status: buildStatus,
      logs: buildLogs,
      error: buildError,
      startedAt,
      completedAt,
      duration: completedAt.getTime() - startedAt.getTime()
    };
  }

  async generateZip() {
    await fs.mkdir(this.zipDir, { recursive: true });

    return new Promise((resolve, reject) => {
      const output = createWriteStream(this.zipPath);
      const archive = new archiver.ZipArchive({
        zlib: { level: 9 } // Maximum compression
      });

      output.on('close', async () => {
        const stats = await fs.stat(this.zipPath);
        resolve({
          zipPath: this.zipPath,
          zipFileName: path.basename(this.zipPath),
          zipSize: stats.size,
          generatedAt: new Date()
        });
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);
      // Append files from the build directory, but ignore node_modules
      archive.glob('**/*', {
        cwd: this.buildDir,
        ignore: ['node_modules/**', 'dist/**']
      });
      archive.finalize();
    });
  }

  async cleanup() {
    try {
      await fs.rm(this.buildDir, { recursive: true, force: true });
    } catch (error) {
      logger.warn(`Failed to cleanup build dir for ${this.projectId}: ${error.message}`);
    }
  }
}

