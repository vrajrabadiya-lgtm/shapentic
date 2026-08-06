import { ValidationError } from './ValidationError.js';

export class PageRenderer {

    validate(page, bp) {
        if (!page.name) {
            throw new ValidationError('Page validation failed: page.name is missing.');
        }
    }

    render(page, bp) {
        this.validate(page, bp);

        const baseName = String(page.name).replace(/\s+/g, '');
        const compName = baseName.endsWith('Page') ? baseName : `${baseName}Page`;
        const normName = baseName.toLowerCase();

        if (normName === 'home' || compName === 'HomePage') {
            let importLines = `import React from 'react';
`;
            let jsxTags = ``;
            const importedComps = new Set();
            
            if (bp?.layout_plan && Array.isArray(bp.layout_plan.sections) && bp.layout_plan.sections.length > 0) {
                const ctaStrat = bp.layout_plan.ctaStrategy || {};
                bp.layout_plan.sections.forEach((sec) => {
                if (!sec || !sec.componentName) return;
                const cName = sec.componentName;
                if (!importedComps.has(cName)) {
                    importedComps.add(cName);
                    importLines += `import ${cName} from '../components/sections/${cName}';
`;
                }
                if (cName === 'CTASection' && (ctaStrat.title || ctaStrat.buttonText)) {
                    jsxTags += `      <${cName} title="${ctaStrat.title || 'Get Started'}" subtitle="${ctaStrat.subtitle || ''}" buttonText="${ctaStrat.buttonText || 'Explore'}" />
`;
                } else {
                    jsxTags += `      <${cName} />
`;
                }
                });
                importLines += `
`;
                return `${importLines}export default function HomePage() {
  return (
    <div className="page-home">
${jsxTags}    </div>
  );
}
`;
            }

            const bpSections = (bp && bp.sections) ?? (bp && bp.pages && bp.pages[0] ? bp.pages[0].sections : []) ?? [];
            importLines += `import HeroSection from '../components/sections/HeroSection';
`;
            jsxTags = `      <HeroSection />
`;

            const addedComps = new Set(['HeroSection', 'SampleSection', 'CTASection']);
            if (Array.isArray(bpSections)) {
            bpSections.forEach(sec => {
                if (!sec) return;
                const cName = sec.componentName || `${String(sec.name || sec.id || 'Custom').replace(/\s+/g, '')}Section`;
                if (!addedComps.has(cName)) {
                addedComps.add(cName);
                importLines += `import ${cName} from '../components/sections/${cName}';
`;
                jsxTags += `      <${cName} />
`;
                }
            });
            }

            importLines += `import SampleSection from '../components/sections/SampleSection';
`;
            importLines += `import CTASection from '../components/sections/CTASection';

`;
            jsxTags += `      <SampleSection />
`;
            jsxTags += `      <CTASection />
`;

            return `${importLines}export default function HomePage() {
  return (
    <div className="page-home">
${jsxTags}    </div>
  );
}
`;
        }

        if (normName === 'about' || compName === 'AboutPage') {
            if(!bp.about) {
                throw new ValidationError('About page validation failed: blueprint.about is missing.');
            }
            if(!bp.company_values) {
                throw new ValidationError('About page validation failed: blueprint.company_values is missing.');
            }
            const about = bp.about;
            const values = bp.company_values;

            return `import React from 'react';
import Section from '../components/layout/Section';
import Container from '../components/layout/Container';
import Grid from '../components/layout/Grid';
import Stack from '../components/layout/Stack';

export default function AboutPage() {
  const values = ${JSON.stringify(values, null, 2)};

  return (
    <div className="page-about">
      <Section spacing="lg">
        <Container size="lg">
          <Stack spacing="lg">
            <div className="border-b border-slate-800/80 pb-12">
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 block mb-3">Organizational Overview</span>
              <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-white">${about.title}</h1>
              <p className="text-2xl text-slate-300 font-medium mb-6 leading-relaxed max-w-3xl">${about.subtitle}</p>
              <p className="text-lg text-slate-400 leading-relaxed max-w-4xl">${about.intro}</p>
            </div>

            <Grid columns={2} gap="md">
              <div className="p-10 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl relative overflow-hidden">
                <div className="w-1.5 h-16 bg-indigo-500 rounded-full mb-6"></div>
                <h3 className="text-2xl font-bold mb-3 text-white">${about.missionTitle}</h3>
                <p className="text-slate-300 text-base leading-relaxed">${about.missionDesc}</p>
              </div>
              <div className="p-10 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl relative overflow-hidden">
                <div className="w-1.5 h-16 bg-cyan-500 rounded-full mb-6"></div>
                <h3 className="text-2xl font-bold mb-3 text-white">${about.visionTitle}</h3>
                <p className="text-slate-300 text-base leading-relaxed">${about.visionDesc}</p>
              </div>
            </Grid>

            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-white mb-3">Core Values &amp; Discipline</h2>
                <p className="text-slate-400 text-sm max-w-xl mx-auto">The unshakeable architectural principles guiding every project, partnership, and operational deployment.</p>
              </div>
              <Grid columns={3} gap="md">
                {values.map((v, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/60 hover:border-indigo-500/30 transition-colors">
                    <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-6 inline-block">0{i+1}</span>
                    <h4 className="text-xl font-bold text-white mb-3">{v.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </Grid>
            </div>
          </Stack>
        </Container>
      </Section>
    </div>
  );
}
`;
        }

        if (normName === 'pricing' || compName === 'PricingPage') {
            if(!bp.pricing) {
                throw new ValidationError('Pricing page validation failed: blueprint.pricing is missing.');
            }
            const tiers = bp.pricing;

            return `import React from 'react';
import Section from '../components/layout/Section';
import Container from '../components/layout/Container';
import Grid from '../components/layout/Grid';
import Stack from '../components/layout/Stack';
import PricingCard from '../components/ui/PricingCard';

export default function PricingPage() {
  const tiers = ${JSON.stringify(tiers, null, 2)};

  return (
    <div className="page-pricing">
      <Section spacing="lg">
        <Container size="xl">
          <Stack spacing="lg">
            <div className="text-center mb-6">
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-2 block">Transparent Investment</span>
              <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight text-white">Select Your Package</h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">Tailored pricing packages designed to match your operational scale with zero hidden fees.</p>
            </div>
            <Grid columns={3} gap="md" align="stretch">
              {tiers.map((tier, idx) => (
                <PricingCard key={idx} {...tier} />
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>
    </div>
  );
}
`;
        }

        if (normName === 'contact' || compName === 'ContactPage') {
            if(!bp.contact) {
                throw new ValidationError('Contact page validation failed: blueprint.contact is missing.');
            }
            const contact = bp.contact;

            return `import React from 'react';
import Section from '../components/layout/Section';
import Container from '../components/layout/Container';
import Stack from '../components/layout/Stack';
import Grid from '../components/layout/Grid';

export default function ContactPage() {
  return (
    <div className="page-contact">
      <Section spacing="lg">
        <Container size="md">
          <Stack spacing="lg">
            <div className="text-center mb-4">
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-2 block">Direct Engagement</span>
              <h1 className="text-5xl font-black mb-4 tracking-tight text-white">${contact.title}</h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">${contact.subtitle}</p>
            </div>
            <form className="space-y-6 bg-slate-900/60 p-8 md:p-12 rounded-3xl border border-slate-800/80 shadow-2xl" onSubmit={(e) => e.preventDefault()}>
              <Grid columns={2} gap="sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">First Name</label>
                  <input type="text" className="w-full px-5 py-3.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-white shadow-inner" placeholder="Alex" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">Last Name</label>
                  <input type="text" className="w-full px-5 py-3.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-white shadow-inner" placeholder="Taylor" />
                </div>
              </Grid>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">Email Address</label>
                <input type="email" className="w-full px-5 py-3.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-white shadow-inner" placeholder="${contact.emailPlaceholder}" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">Message &amp; Requirements</label>
                <textarea rows={5} className="w-full px-5 py-3.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-white shadow-inner" placeholder="Provide details regarding your desired timeline and organizational objectives..."></textarea>
              </div>
              <button type="submit" className="w-full py-4 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-extrabold text-lg transition shadow-lg shadow-indigo-600/30 text-white">${contact.btnText}</button>
            </form>
          </Stack>
        </Container>
      </Section>
    </div>
  );
}
`;
        }

        if(!bp.features && !bp.services) {
            throw new ValidationError('Page validation failed: blueprint.features or blueprint.services is missing.');
        }
        const items = bp.features || bp.services;

        return `import React from 'react';
import Section from '../components/layout/Section';
import Container from '../components/layout/Container';
import Grid from '../components/layout/Grid';
import Stack from '../components/layout/Stack';

export default function ${compName}() {
  const items = ${JSON.stringify(items, null, 2)};

  return (
    <div className="page-${normName}">
      <Section spacing="lg">
        <Container size="lg">
          <Stack spacing="lg">
            <div className="mb-6 border-b border-slate-800/80 pb-10">
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 block mb-3">Dedicated Domain Showcase</span>
              <h1 className="text-4xl md:text-5xl font-black mb-5 tracking-tight text-white">${baseName} Features</h1>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl">
                An interactive catalog of our specialized offerings, professional standards, and verified features within our ${baseName.toLowerCase()} division.
              </p>
            </div>
            <Grid columns={2} gap="md">
              {items.map((it, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 transition-all shadow-xl flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0">{it.icon || '✦'}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">{it.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">{it.desc}</p>
                  </div>
                </div>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>
    </div>
  );
}
`;
    }
}
