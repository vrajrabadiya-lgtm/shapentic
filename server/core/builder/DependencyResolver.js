// d:/ornitech-sample/3d-website/server/core/builder/DependencyResolver.js
import { logger } from '../logger.js';

class DependencyResolver {
    constructor(blueprint) {
        this.blueprint = blueprint;
    }

    resolve() {
        logger.info('[DependencyResolver] Resolving dependencies...');

        const baseDependencies = {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
        };

        const baseDevDependencies = {
            "@types/react": "^18.2.43",
            "@types/react-dom": "^18.2.17",
            "@vitejs/plugin-react": "^4.2.1",
            "vite": "^5.0.8",
        };

        const frameworkDependencies = this._getFrameworkDependencies();
        const stylingDependencies = this._getStylingDependencies();
        const animationDependencies = this._getAnimationDependencies();
        const threeJsDependencies = this._getThreeJsDependencies();
        const routingDependencies = this._getRoutingDependencies();
        const additionalDependencies = this.blueprint.dependencies || {};

        const allDependencies = {
            ...baseDependencies,
            ...frameworkDependencies.dependencies,
            ...stylingDependencies.dependencies,
            ...animationDependencies.dependencies,
            ...threeJsDependencies.dependencies,
            ...routingDependencies.dependencies,
            ...additionalDependencies.dependencies
        };

        const allDevDependencies = {
            ...baseDevDependencies,
            ...frameworkDependencies.devDependencies,
            ...stylingDependencies.devDependencies,
            ...animationDependencies.devDependencies,
            ...threeJsDependencies.devDependencies,
            ...routingDependencies.devDependencies,
            ...additionalDependencies.devDependencies
        };
        
        logger.info('[DependencyResolver] Dependencies resolved.');
        return {
            dependencies: allDependencies,
            devDependencies: allDevDependencies,
        };
    }

    _getFrameworkDependencies() {
        const deps = { dependencies: {}, devDependencies: {} };
        if (this.blueprint.framework === 'next') {
            deps.dependencies['next'] = '^14.0.0';
            // Next.js handles this itself
            // deps.dependencies['react'] = '^18'; 
            // deps.dependencies['react-dom'] = '^18';
        }
        return deps;
    }

    _getStylingDependencies() {
        const deps = { dependencies: {}, devDependencies: {} };
        const styling = this.blueprint.styling;
        if (styling?.library === 'tailwindcss') {
            deps.devDependencies['tailwindcss'] = '^3.4.1';
            deps.devDependencies['postcss'] = '^8.4.35';
            deps.devDependencies['autoprefixer'] = '^10.4.18';
        } else if (styling?.library === 'emotion') {
            deps.dependencies['@emotion/react'] = '^11.11.4';
            deps.dependencies['@emotion/styled'] = '^11.11.5';
        }
        return deps;
    }

    _getAnimationDependencies() {
        const deps = { dependencies: {}, devDependencies: {} };
        if (this.blueprint.animation?.library === 'framer-motion') {
            deps.dependencies['framer-motion'] = '^11.0.3';
        }
        return deps;
    }

    _getThreeJsDependencies() {
        const deps = { dependencies: {}, devDependencies: {} };
        if (this.blueprint.threeJs) {
            deps.dependencies['three'] = '^0.160.0';
            deps.dependencies['@react-three/fiber'] = '^8.15.14';
            deps.dependencies['@react-three/drei'] = '^9.96.1';
            if (this.blueprint.threeJs.postprocessing) {
                deps.dependencies['@react-three/postprocessing'] = '^2.16.0';
            }
        }
        return deps;
    }

    _getRoutingDependencies() {
        const deps = { dependencies: {}, devDependencies: {} };
        if (this.blueprint.routing?.library === 'react-router-dom') {
            deps.dependencies['react-router-dom'] = '^6.22.0';
        }
        return deps;
    }
}

export { DependencyResolver };
