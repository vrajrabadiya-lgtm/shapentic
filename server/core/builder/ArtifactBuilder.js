// d:/ornitech-sample/3d-website/server/core/builder/ArtifactBuilder.js
import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

class ArtifactBuilder {
    constructor(buildDir, projectId) {
        this.buildDir = buildDir;
        this.projectId = projectId;
        this.zipDir = path.join(process.cwd(), 'artifacts', 'zips');
        this.zipPath = path.join(this.zipDir, `project-${this.projectId}.zip`);
    }

    async generateZip() {
        await fs.mkdir(this.zipDir, { recursive: true });

        return new Promise((resolve, reject) => {
            const output = createWriteStream(this.zipPath);
            const archive = archiver('zip', {
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
            archive.glob('**/*', {
                cwd: this.buildDir,
                ignore: ['node_modules/**', 'dist/**']
            });
            archive.finalize();
        });
    }

    generateBuildReport() {
        // Implementation will go here
    }
}

export { ArtifactBuilder };
