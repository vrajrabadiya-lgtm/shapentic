import { BaseSectionRenderer } from "./BaseSectionRenderer.js";

// ==========================================
// INDIVIDUAL COMPONENT RENDERERS
// ==========================================

class FeaturesRenderer extends BaseSectionRenderer {
  constructor() {
    super("features");
  }

  getImports(sec, bp) {
    return `import FeatureCard from '../ui/FeatureCard';\nimport Grid from '../layout/Grid';`;
  }

  renderContent(sec, bp) {
    const items = sec.content?.items || [];
    return `
          <Grid columns={2} gap="md">
            {${JSON.stringify(items)}.map((f, idx) => (
              <FeatureCard key={idx} icon={f.icon || '⚡'} title={f.title || 'Feature'} description={f.desc || ''} animation={{ delay: idx * 0.1 }} />
            ))}
          </Grid>`;
  }
}

class TestimonialsRenderer extends BaseSectionRenderer {
  constructor() {
    super("testimonials");
  }

  getImports(sec, bp) {
    return `import TestimonialCard from '../ui/TestimonialCard';\nimport Grid from '../layout/Grid';`;
  }

  renderContent(sec, bp) {
    const items = (sec.content?.items || []).map(t => ({
      quote: t.quote || t.desc || "Outstanding results.",
      author: t.author || "Client",
      role: t.role || "Director",
      company: t.company || ""
    }));
    return `
          <Grid columns={3} gap="md">
            {${JSON.stringify(items)}.map((t, idx) => (
              <TestimonialCard key={idx} {...t} />
            ))}
          </Grid>`;
  }
}

class PricingRenderer extends BaseSectionRenderer {
  constructor() {
    super("pricing");
  }

  getImports(sec, bp) {
    return `import PricingCard from '../ui/PricingCard';\nimport Grid from '../layout/Grid';`;
  }

  renderContent(sec, bp) {
    const items = (sec.content?.items || []).map(t => ({
      title: t.title || t.name || "Plan",
      price: t.price || "$0",
      period: t.period || "",
      features: Array.isArray(t.features) ? t.features : [],
      highlight: t.highlight || t.highlighted || false,
      button: t.button || t.btnText || "Select Package"
    }));
    return `
          <Grid columns={3} gap="md" align="stretch">
            {${JSON.stringify(items)}.map((tier, idx) => (
              <PricingCard key={idx} {...tier} />
            ))}
          </Grid>`;
  }
}

class FAQRenderer extends BaseSectionRenderer {
  constructor() {
    super("faq");
  }

  getImports(sec, bp) {
    return `import FAQAccordion from '../ui/FAQAccordion';`;
  }

  renderContent(sec, bp) {
    const items = (sec.content?.items || []).map(f => ({
      q: f.title || f.q || f.question || "Query?",
      a: f.desc || f.a || f.answer || "Detail."
    }));
    return `
          <div className="max-w-3xl mx-auto w-full">
            <FAQAccordion items={${JSON.stringify(items)}} />
          </div>`;
  }
}

class ContactRenderer extends BaseSectionRenderer {
  constructor() {
    super("contact");
  }

  getImports(sec, bp) {
    return `import Grid from '../layout/Grid';`;
  }

  renderContent(sec, bp) {
    const btnText = sec.content?.button || sec.content?.btnText || "Send Message";
    return `
          <form className="space-y-6 bg-slate-900/60 p-8 md:p-12 rounded-3xl border border-slate-800/80 shadow-2xl" onSubmit={(e) => e.preventDefault()}>
            <Grid columns={2} gap="sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">First Name</label>
                <input type="text" className="w-full px-5 py-3.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-white" placeholder="First Name" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">Last Name</label>
                <input type="text" className="w-full px-5 py-3.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-white" placeholder="Last Name" />
              </div>
            </Grid>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">Email Address</label>
              <input type="email" className="w-full px-5 py-3.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-white" placeholder="your-email@example.com" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">Message</label>
              <textarea rows={5} className="w-full px-5 py-3.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-white" placeholder="Your requirements..."></textarea>
            </div>
            <button type="submit" className="w-full py-4 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-extrabold text-lg transition text-white">${btnText}</button>
          </form>`;
  }
}

class GalleryRenderer extends BaseSectionRenderer {
  constructor() {
    super("gallery");
  }

  getImports(sec, bp) {
    return `import Grid from '../layout/Grid';`;
  }

  renderContent(sec, bp) {
    const items = sec.content?.items || [];
    return `
          <Grid columns={3} gap="md">
            {${JSON.stringify(items)}.map((img, idx) => (
              <div key={idx} className="aspect-video rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 relative group">
                <img src={img.image || img.url || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80"} alt={img.title || "Gallery"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                {img.title && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <h4 className="text-lg font-bold text-white">{img.title}</h4>
                  </div>
                )}
              </div>
            ))}
          </Grid>`;
  }
}

class ServicesRenderer extends BaseSectionRenderer {
  constructor() {
    super("services");
  }

  getImports(sec, bp) {
    return `import FeatureCard from '../ui/FeatureCard';\nimport Grid from '../layout/Grid';`;
  }

  renderContent(sec, bp) {
    const items = sec.content?.items || [];
    return `
          <Grid columns={2} gap="md">
            {${JSON.stringify(items)}.map((s, idx) => (
              <FeatureCard key={idx} icon={s.icon || '💼'} title={s.title || 'Service'} description={s.desc || ''} animation={{ delay: idx * 0.1 }} />
            ))}
          </Grid>`;
  }
}

class StatsRenderer extends BaseSectionRenderer {
  constructor() {
    super("stats");
  }

  getImports(sec, bp) {
    return `import StatCard from '../ui/StatCard';\nimport Grid from '../layout/Grid';`;
  }

  renderContent(sec, bp) {
    const items = (sec.content?.items || []).map(s => ({
      val: s.val || s.price || "100%",
      label: s.title || s.label || "Value",
      desc: s.desc || s.description || ""
    }));
    return `
          <Grid columns={4} gap="md">
            {${JSON.stringify(items)}.map((s, idx) => (
              <StatCard key={idx} val={s.val} label={s.label} desc={s.desc} />
            ))}
          </Grid>`;
  }
}

class FallbackRenderer extends BaseSectionRenderer {
  constructor() {
    super("fallback");
  }

  getImports(sec, bp) {
    return `import Grid from '../layout/Grid';`;
  }

  renderContent(sec, bp) {
    const items = sec.content?.items || [];
    const columns = items.length > 1 ? 2 : 1;
    return `
          <Grid columns={${columns}} gap="md">
            {${JSON.stringify(items)}.map((it, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all shadow-xl flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0">{it.icon || '✦'}</div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">{it.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{it.desc}</p>
                </div>
              </div>
            ))}
          </Grid>`;
  }
}

// ==========================================
// COMPONENT REGISTRY CLASS
// ==========================================

class Registry {
  constructor() {
    this.renderers = {};
    
    // Auto-register standard default renderers
    this.register("features", new FeaturesRenderer());
    this.register("testimonials", new TestimonialsRenderer());
    this.register("reviews", new TestimonialsRenderer());
    this.register("pricing", new PricingRenderer());
    this.register("faq", new FAQRenderer());
    this.register("contact", new ContactRenderer());
    this.register("gallery", new GalleryRenderer());
    this.register("services", new ServicesRenderer());
    
    // Fallback/Legacy redirects
    this.register("skills", new FeaturesRenderer());
    this.register("projects", new FeaturesRenderer());
    this.register("experience", new FeaturesRenderer());
    this.register("achievements", new StatsRenderer());
    this.register("stats", new StatsRenderer());
    this.register("doctors", new ServicesRenderer());
    
    this.fallback = new FallbackRenderer();
  }

  /**
   * Register a custom renderer for a section type.
   */
  register(type, renderer) {
    this.renderers[type.toLowerCase()] = renderer;
  }

  /**
   * Resolve renderer matching the type.
   */
  get(type) {
    if (!type) return this.fallback;
    const resolved = this.renderers[type.toLowerCase()];
    return resolved || this.fallback;
  }
}

export const ComponentRegistry = new Registry();
export default ComponentRegistry;
