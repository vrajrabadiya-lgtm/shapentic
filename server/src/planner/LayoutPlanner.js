/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PHASE 9.5 – AI LAYOUT PLANNING ENGINE
 *  Dynamically composes structurally unique page schemas based on prompt intent,
 *  industry profile, target audience, conversion goals, and theme tokens.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─── SECTION REGISTRY ─────────────────────────────────────────────────────────
export const SECTION_REGISTRY = {
  HeroSection: {
    id: 'hero',
    purpose: 'Initial brand impression, core value proposition, and primary 3D visual showcase',
    supportedIndustries: ['all'],
    priority: 1,
    dependencies: ['Cinematic3DScene', 'HeroLayout', 'Button'],
    variants: ['split', 'centered', 'image_left', 'image_right', 'fullscreen', 'minimal', '3d', 'video'],
    estimatedHeight: '100vh'
  },
  FeaturesSection: {
    id: 'features',
    purpose: 'Detailed breakdown of core software, platform, or service advantages',
    supportedIndustries: ['SaaS', 'Startup', 'Technology', 'Finance', 'Fintech Payment', 'Education'],
    priority: 2,
    dependencies: ['FeatureCard', 'Grid', 'Section', 'Container'],
    variants: ['grid_2', 'grid_3', 'cards', 'timeline', 'icons', 'comparison_table'],
    estimatedHeight: '800px'
  },
  ProjectsSection: {
    id: 'projects',
    purpose: 'Showcase award-winning creative portfolio works, architectural landmarks, or agency case studies',
    supportedIndustries: ['Portfolio', 'Developer Portfolio', 'Agency', 'Real Estate', 'Photography', 'Architecture'],
    priority: 2,
    dependencies: ['FeatureCard', 'Grid', 'Section'],
    variants: ['bento_grid', 'masonry', 'carousel', 'split_preview', 'minimal'],
    estimatedHeight: '900px'
  },
  ServicesSection: {
    id: 'services',
    purpose: 'Categorized catalog of professional practices, medical specialties, or advisory modules',
    supportedIndustries: ['Agency', 'Healthcare', 'Healthcare Clinic', 'Education', 'Law', 'Law Firm', 'Consulting', 'Non-profit', 'Fitness', 'Architecture', 'Real Estate', 'Travel'],
    priority: 2,
    dependencies: ['FeatureCard', 'Grid', 'Section'],
    variants: ['modular_cards', 'accordion_list', 'icon_columns', 'horizontal_scroll'],
    estimatedHeight: '750px'
  },
  FeaturedDishesSection: {
    id: 'menu',
    purpose: 'Gourmet culinary presentation featuring seasonal tasting dishes and tasting notes',
    supportedIndustries: ['Restaurant', 'Fine Restaurant'],
    priority: 2,
    dependencies: ['FeatureCard', 'Grid', 'Section'],
    variants: ['menu_grid', 'tasting_menu', 'split_image', 'luxury_list'],
    estimatedHeight: '850px'
  },
  ChefSection: {
    id: 'chef',
    purpose: 'Executive chef biography, culinary heritage, and gastronomic philosophy',
    supportedIndustries: ['Restaurant', 'Fine Restaurant'],
    priority: 3,
    dependencies: ['Section', 'Container', 'Stack'],
    variants: ['editorial_split', 'portrait_left', 'centered_quote'],
    estimatedHeight: '650px'
  },
  GallerySection: {
    id: 'gallery',
    purpose: 'High-resolution visual showcase of private estates, travel sanctuaries, or fine art collections',
    supportedIndustries: ['Restaurant', 'Fine Restaurant', 'Real Estate', 'Travel', 'Photography', 'Architecture', 'E-commerce', 'Fashion Store'],
    priority: 3,
    dependencies: ['Grid', 'Section', 'Container'],
    variants: ['masonry_grid', 'fullscreen_slider', 'filmstrip', 'asymmetrical_grid'],
    estimatedHeight: '900px'
  },
  PricingSection: {
    id: 'pricing',
    purpose: 'Transparent investment tiers, SaaS subscription plans, or membership packages',
    supportedIndustries: ['SaaS', 'Startup', 'Finance', 'Fintech Payment', 'Fitness', 'Gym', 'E-commerce', 'Fashion Store', 'Photography'],
    priority: 3,
    dependencies: ['PricingCard', 'Grid', 'Section'],
    variants: ['horizontal', 'vertical', 'enterprise', 'cards', 'comparison'],
    estimatedHeight: '800px'
  },
  TestimonialsSection: {
    id: 'testimonials',
    purpose: 'Social proof featuring authentic quotes from valued clients, patients, or enterprise executives',
    supportedIndustries: ['all'],
    priority: 4,
    dependencies: ['TestimonialCard', 'Grid', 'Section'],
    variants: ['cards_grid', 'carousel', 'minimal_quote', 'video_spotlight'],
    estimatedHeight: '650px'
  },
  FAQSection: {
    id: 'faq',
    purpose: 'Answer common patient questions, subscription policy details, or architectural process steps',
    supportedIndustries: ['SaaS', 'Startup', 'Healthcare', 'Healthcare Clinic', 'Finance', 'Fintech Payment', 'Education', 'Law', 'Law Firm', 'Fitness', 'Travel', 'Consulting', 'Real Estate', 'Non-profit'],
    priority: 5,
    dependencies: ['FAQAccordion', 'Stack', 'Section'],
    variants: ['accordion', 'two_column', 'categorized', 'minimal_list'],
    estimatedHeight: '700px'
  },
  AchievementsSection: {
    id: 'stats',
    purpose: 'Empirical milestone metrics, transaction volumes, global presence, or patient success statistics',
    supportedIndustries: ['SaaS', 'Startup', 'Finance', 'Fintech Payment', 'Agency', 'Healthcare', 'Healthcare Clinic', 'Education', 'Non-profit', 'Consulting', 'Technology', 'Fitness'],
    priority: 3,
    dependencies: ['StatCard', 'Grid', 'Section'],
    variants: ['counter_grid', 'highlight_strip', 'minimal_row', 'cards_overlay'],
    estimatedHeight: '500px'
  },
  SkillsSection: {
    id: 'skills',
    purpose: 'Technical engineering proficiencies, shader architectures, and full-stack features',
    supportedIndustries: ['Portfolio', 'Developer Portfolio', 'Technology'],
    priority: 2,
    dependencies: ['Grid', 'Section', 'Container'],
    variants: ['bento_badges', 'radar_grid', 'minimal_bars', 'interactive_pills'],
    estimatedHeight: '600px'
  },
  ExperienceSection: {
    id: 'experience',
    purpose: 'Professional career timeline, senior law corporate representation, or engineering leadership history',
    supportedIndustries: ['Portfolio', 'Developer Portfolio', 'Law', 'Law Firm', 'Consulting'],
    priority: 4,
    dependencies: ['Stack', 'Section', 'Container'],
    variants: ['vertical_timeline', 'minimal_list', 'cards_stack'],
    estimatedHeight: '750px'
  },
  ProcessSection: {
    id: 'process',
    purpose: 'Step-by-step organizational protocol, agile sprint methodology, or architectural commission roadmap',
    supportedIndustries: ['Agency', 'Architecture', 'Consulting', 'Technology'],
    priority: 4,
    dependencies: ['Grid', 'Section', 'Container'],
    variants: ['numbered_steps', 'horizontal_flow', 'timeline_cards'],
    estimatedHeight: '700px'
  },
  FeaturedProductsSection: {
    id: 'products',
    purpose: 'Showcase boutique organic merchandise, sustainable clothing, or luxury hardware items',
    supportedIndustries: ['E-commerce', 'Fashion Store', 'Fashion'],
    priority: 2,
    dependencies: ['FeatureCard', 'Grid', 'Section'],
    variants: ['product_grid', 'lookbook', 'carousel_cards'],
    estimatedHeight: '850px'
  },
  CollectionsSection: {
    id: 'collections',
    purpose: 'Curated fashion seasons, luxury watch collections, or home goods categories',
    supportedIndustries: ['E-commerce', 'Fashion Store', 'Fashion'],
    priority: 3,
    dependencies: ['Grid', 'Section', 'Container'],
    variants: ['editorial_masonry', 'split_banners', 'grid_showcase'],
    estimatedHeight: '800px'
  },
  DoctorsSection: {
    id: 'doctors',
    purpose: 'Medical specialists, clinical directors, and orthopedic practitioners presentation',
    supportedIndustries: ['Healthcare', 'Healthcare Clinic'],
    priority: 3,
    dependencies: ['Grid', 'Section', 'Container'],
    variants: ['profile_cards', 'team_grid', 'editorial_bios'],
    estimatedHeight: '750px'
  },
  ReservationSection: {
    id: 'reservations',
    purpose: 'Table booking system for gastronomy guests or consultation scheduling',
    supportedIndustries: ['Restaurant', 'Fine Restaurant'],
    priority: 5,
    dependencies: ['Section', 'Container', 'Stack', 'Button'],
    variants: ['interactive_form', 'card_embed', 'minimal_split'],
    estimatedHeight: '650px'
  },
  AppointmentSection: {
    id: 'appointment',
    purpose: 'Online clinical scheduling form for diagnostic evaluation and patient intake',
    supportedIndustries: ['Healthcare', 'Healthcare Clinic'],
    priority: 5,
    dependencies: ['Section', 'Container', 'Stack', 'Button'],
    variants: ['medical_portal_form', 'minimal_step_form', 'split_card'],
    estimatedHeight: '650px'
  },
  NewsletterSection: {
    id: 'newsletter',
    purpose: 'Community subscription input for editorial publications, non-profits, or fashion brands',
    supportedIndustries: ['E-commerce', 'Fashion Store', 'Non-profit', 'Editorial'],
    priority: 5,
    dependencies: ['Section', 'Container', 'Button'],
    variants: ['minimal_strip', 'card_box', 'split_banner'],
    estimatedHeight: '400px'
  },
  ContactSection: {
    id: 'contact',
    purpose: 'Direct outreach, corporate headquarters location, and client communication channels',
    supportedIndustries: ['all'],
    priority: 6,
    dependencies: ['Section', 'Container', 'Grid', 'Button'],
    variants: ['split_info_form', 'centered_minimal', 'map_overlay', 'cards_contact'],
    estimatedHeight: '750px'
  },
  CTASection: {
    id: 'cta',
    purpose: 'High-converting strategic call to action tailored to business conversion goals',
    supportedIndustries: ['all'],
    priority: 4,
    dependencies: ['Section', 'Container', 'Button'],
    variants: ['gradient_banner', 'glow_box', 'minimal_split', 'floating_panel'],
    estimatedHeight: '500px'
  },
  SampleSection: {
    id: 'sample',
    purpose: 'Interactive live demo module and 3D parameter controller',
    supportedIndustries: ['all'],
    priority: 5,
    dependencies: ['Section', 'Container'],
    variants: ['interactive_panel', 'minimal_showcase'],
    estimatedHeight: '600px'
  }
};

// ─── INDUSTRY PROFILES ────────────────────────────────────────────────────────
export const INDUSTRY_PROFILES = {
  "Developer Portfolio": {
    name: "Developer Portfolio",
    requiredSections: ["HeroSection", "ProjectsSection", "ContactSection"],
    optionalSections: ["SkillsSection", "ExperienceSection", "TestimonialsSection", "SampleSection"],
    preferredOrdering: ["HeroSection", "SkillsSection", "ProjectsSection", "CTASection", "ExperienceSection", "TestimonialsSection", "SampleSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "ProjectsSection",
      title: "Ready to Build Your Next Paradigm?",
      subtitle: "Collaborate with an award-winning engineer on cutting-edge interactive digital experiences and shader architectures.",
      buttonText: "Hire Me",
      route: "/contact"
    }
  },
  "Portfolio": {
    name: "Portfolio",
    requiredSections: ["HeroSection", "ProjectsSection", "ContactSection"],
    optionalSections: ["SkillsSection", "ExperienceSection", "TestimonialsSection", "SampleSection"],
    preferredOrdering: ["HeroSection", "SkillsSection", "ProjectsSection", "CTASection", "ExperienceSection", "TestimonialsSection", "SampleSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "FAQSection",
      title: "Begin Your Educational Journey",
      subtitle: "Join our vibrant academic community and pioneer the next era of discovery.",
      buttonText: "Request Admissions Info",
      route: "/admissions"
    }
  },
  "Automotive": {
    name: "Automotive",
    requiredSections: ["HeroSection", "FeaturesSection", "GallerySection", "ContactSection"],
    optionalSections: ["PricingSection", "TestimonialsSection", "FAQSection", "SampleSection"],
    preferredOrdering: ["HeroSection", "FeaturesSection", "GallerySection", "SampleSection", "TestimonialsSection", "PricingSection", "FAQSection", "CTASection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "GallerySection",
      title: "Experience the Future of Driving",
      subtitle: "Configure your vehicle or schedule an exclusive test drive today.",
      buttonText: "Book Test Drive",
      route: "/contact"
    }
  },
  "Architecture": {
    name: "Architecture",
    requiredSections: ["HeroSection", "ProjectsSection", "GallerySection", "ContactSection"],
    optionalSections: ["ServicesSection", "TestimonialsSection", "SampleSection"],
    preferredOrdering: ["HeroSection", "ProjectsSection", "GallerySection", "ServicesSection", "SampleSection", "TestimonialsSection", "CTASection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "ProjectsSection",
      title: "Realize Your Architectural Vision",
      subtitle: "Partner with our studio to design spaces that inspire and endure.",
      buttonText: "Start a Project",
      route: "/contact"
    }
  },
  "Hospitality": {
    name: "Hospitality",
    requiredSections: ["HeroSection", "GallerySection", "FeaturesSection", "ContactSection"],
    optionalSections: ["PricingSection", "TestimonialsSection", "FAQSection", "SampleSection"],
    preferredOrdering: ["HeroSection", "GallerySection", "FeaturesSection", "PricingSection", "TestimonialsSection", "SampleSection", "FAQSection", "CTASection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "GallerySection",
      title: "Reserve Your Ultimate Escape",
      subtitle: "Experience unmatched luxury, comfort, and service.",
      buttonText: "Book Now",
      route: "/contact"
    }
  },
  "Restaurant": {
    name: "Restaurant",
    requiredSections: ["HeroSection", "FeaturedDishesSection", "ReservationSection"],
    optionalSections: ["ChefSection", "GallerySection", "TestimonialsSection", "ContactSection"],
    preferredOrdering: ["HeroSection", "FeaturedDishesSection", "CTASection", "ChefSection", "GallerySection", "TestimonialsSection", "ReservationSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "FeaturedDishesSection",
      title: "An Unforgettable Culinary Journey Awaits",
      subtitle: "Secure your table in our celebrated main gastronomy room or private wine cellar terrace today.",
      buttonText: "Reserve Table",
      route: "/contact"
    }
  },
  "Fine Restaurant": {
    name: "Fine Restaurant",
    requiredSections: ["HeroSection", "FeaturedDishesSection", "ReservationSection"],
    optionalSections: ["ChefSection", "GallerySection", "TestimonialsSection", "ContactSection"],
    preferredOrdering: ["HeroSection", "FeaturedDishesSection", "CTASection", "ChefSection", "GallerySection", "TestimonialsSection", "ReservationSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "FeaturedDishesSection",
      title: "An Unforgettable Culinary Journey Awaits",
      subtitle: "Secure your private table in our celebrated main gastronomy room or exclusive wine terrace today.",
      buttonText: "Reserve Table",
      route: "/contact"
    }
  },
  "Healthcare": {
    name: "Healthcare",
    requiredSections: ["HeroSection", "ServicesSection", "DoctorsSection", "AppointmentSection"],
    optionalSections: ["TestimonialsSection", "FAQSection", "ContactSection", "AchievementsSection"],
    preferredOrdering: ["HeroSection", "ServicesSection", "CTASection", "DoctorsSection", "AchievementsSection", "TestimonialsSection", "FAQSection", "AppointmentSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "ServicesSection",
      title: "Comprehensive Medical Excellence",
      subtitle: "Prioritize your long-term wellness with our leading diagnostic evaluation and specialized clinical care.",
      buttonText: "Book Consultation",
      route: "/contact"
    }
  },
  "Healthcare Clinic": {
    name: "Healthcare Clinic",
    requiredSections: ["HeroSection", "ServicesSection", "DoctorsSection", "AppointmentSection"],
    optionalSections: ["TestimonialsSection", "FAQSection", "ContactSection", "AchievementsSection"],
    preferredOrdering: ["HeroSection", "ServicesSection", "CTASection", "DoctorsSection", "AchievementsSection", "TestimonialsSection", "FAQSection", "AppointmentSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "ServicesSection",
      title: "Comprehensive Medical Excellence",
      subtitle: "Prioritize your long-term wellness with specialized diagnostic evaluation.",
      buttonText: "Book Consultation",
      route: "/contact"
    }
  },
  "Agency": {
    name: "Agency",
    requiredSections: ["HeroSection", "ProjectsSection", "ServicesSection", "ContactSection"],
    optionalSections: ["TestimonialsSection", "ProcessSection", "AchievementsSection", "SampleSection"],
    preferredOrdering: ["HeroSection", "ProjectsSection", "ServicesSection", "TestimonialsSection", "ProcessSection", "AchievementsSection", "CTASection", "SampleSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "ProcessSection",
      title: "Transform Your Brand Architecture",
      subtitle: "Partner with our creative direction group to craft market-defining platforms and high-velocity digital experiences.",
      buttonText: "Start a Project",
      route: "/contact"
    }
  },
  "SaaS": {
    name: "SaaS",
    requiredSections: ["HeroSection", "FeaturesSection", "PricingSection", "CTASection"],
    optionalSections: ["AchievementsSection", "TestimonialsSection", "FAQSection", "SampleSection"],
    preferredOrdering: ["HeroSection", "FeaturesSection", "AchievementsSection", "PricingSection", "FAQSection", "TestimonialsSection", "CTASection", "SampleSection"],
    ctaStrategy: {
      targetAfter: "FeaturesSection",
      title: "Experience Supercharged Productivity",
      subtitle: "Join thousands of high-growth modern teams utilizing automated intelligence and real-time cloud analytics.",
      buttonText: "Start Free Trial",
      route: "/pricing"
    }
  },
  "Startup": {
    name: "Startup",
    requiredSections: ["HeroSection", "FeaturesSection", "PricingSection", "CTASection"],
    optionalSections: ["AchievementsSection", "TestimonialsSection", "FAQSection", "SampleSection"],
    preferredOrdering: ["HeroSection", "FeaturesSection", "AchievementsSection", "PricingSection", "FAQSection", "TestimonialsSection", "CTASection", "SampleSection"],
    ctaStrategy: {
      targetAfter: "FeaturesSection",
      title: "Experience Supercharged Productivity",
      subtitle: "Join thousands of high-growth teams utilizing automated intelligence today.",
      buttonText: "Start Free Trial",
      route: "/pricing"
    }
  },
  "Law Firm": {
    name: "Law Firm",
    requiredSections: ["HeroSection", "ServicesSection", "ExperienceSection", "ContactSection"],
    optionalSections: ["FAQSection", "TestimonialsSection", "AchievementsSection"],
    preferredOrdering: ["HeroSection", "ServicesSection", "ExperienceSection", "AchievementsSection", "FAQSection", "CTASection", "TestimonialsSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "FAQSection",
      title: "Unwavering Legal Guidance & Defense",
      subtitle: "Connect with our senior litigation partners for confidential strategic corporate defense and advocacy.",
      buttonText: "Schedule Case Review",
      route: "/contact"
    }
  },
  "Law": {
    name: "Law",
    requiredSections: ["HeroSection", "ServicesSection", "ExperienceSection", "ContactSection"],
    optionalSections: ["FAQSection", "TestimonialsSection", "AchievementsSection"],
    preferredOrdering: ["HeroSection", "ServicesSection", "ExperienceSection", "AchievementsSection", "FAQSection", "CTASection", "TestimonialsSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "FAQSection",
      title: "Unwavering Legal Guidance & Defense",
      subtitle: "Connect with senior litigation partners for confidential strategic corporate advocacy.",
      buttonText: "Schedule Case Review",
      route: "/contact"
    }
  },
  "Photography": {
    name: "Photography",
    requiredSections: ["HeroSection", "GallerySection", "ProjectsSection", "ContactSection"],
    optionalSections: ["TestimonialsSection", "PricingSection"],
    preferredOrdering: ["HeroSection", "GallerySection", "ProjectsSection", "CTASection", "TestimonialsSection", "PricingSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "ProjectsSection",
      title: "Capture Timeless Editorial Stories",
      subtitle: "Available for international fashion editorials, fine art commissions, and high-profile commercial studio production.",
      buttonText: "Book Shoot",
      route: "/contact"
    }
  },
  "Fitness": {
    name: "Fitness",
    requiredSections: ["HeroSection", "ServicesSection", "PricingSection", "ContactSection"],
    optionalSections: ["TestimonialsSection", "FAQSection", "AchievementsSection"],
    preferredOrdering: ["HeroSection", "ServicesSection", "PricingSection", "CTASection", "AchievementsSection", "TestimonialsSection", "FAQSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "PricingSection",
      title: "Unleash Your Maximum Physical Potential",
      subtitle: "Access elite biometric performance coaching, state-of-the-art strength labs, and holistic recovery suites.",
      buttonText: "Claim Free Pass",
      route: "/pricing"
    }
  },
  "Gym": {
    name: "Gym",
    requiredSections: ["HeroSection", "ServicesSection", "PricingSection", "ContactSection"],
    optionalSections: ["TestimonialsSection", "FAQSection", "AchievementsSection"],
    preferredOrdering: ["HeroSection", "ServicesSection", "PricingSection", "CTASection", "AchievementsSection", "TestimonialsSection", "FAQSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "PricingSection",
      title: "Unleash Your Maximum Physical Potential",
      subtitle: "Access elite biometric coaching, strength labs, and holistic recovery suites.",
      buttonText: "Claim Free Pass",
      route: "/pricing"
    }
  },
  "Travel": {
    name: "Travel",
    requiredSections: ["HeroSection", "GallerySection", "ServicesSection", "ContactSection"],
    optionalSections: ["TestimonialsSection", "FAQSection", "PricingSection"],
    preferredOrdering: ["HeroSection", "GallerySection", "ServicesSection", "TestimonialsSection", "FAQSection", "CTASection", "PricingSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "ServicesSection",
      title: "Curate Your Next Sanctuary Escape",
      subtitle: "Let our executive travel itinerary designers design your effortless luxury exploration to uncharted destinations.",
      buttonText: "Book Expedition",
      route: "/contact"
    }
  },
  "Education": {
    name: "Education",
    requiredSections: ["HeroSection", "ServicesSection", "FeaturesSection", "ContactSection"],
    optionalSections: ["AchievementsSection", "TestimonialsSection", "FAQSection"],
    preferredOrdering: ["HeroSection", "ServicesSection", "FeaturesSection", "AchievementsSection", "CTASection", "FAQSection", "TestimonialsSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "AchievementsSection",
      title: "Empower Your Academic & Career Horizon",
      subtitle: "Enroll in accelerated immersive degree curriculums mentored directly by global domain leaders.",
      buttonText: "Enroll Now",
      route: "/contact"
    }
  },
  "Real Estate": {
    name: "Real Estate",
    requiredSections: ["HeroSection", "ProjectsSection", "ServicesSection", "ContactSection"],
    optionalSections: ["GallerySection", "TestimonialsSection", "FAQSection"],
    preferredOrdering: ["HeroSection", "ProjectsSection", "ServicesSection", "GallerySection", "CTASection", "TestimonialsSection", "FAQSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "GallerySection",
      title: "Discover Private Architectural Splendor",
      subtitle: "Schedule a private confidential tour of our landmark penthouse residences and private estates.",
      buttonText: "Request Private Tour",
      route: "/contact"
    }
  },
  "Finance": {
    name: "Finance",
    requiredSections: ["HeroSection", "FeaturesSection", "PricingSection", "ContactSection"],
    optionalSections: ["AchievementsSection", "FAQSection", "TestimonialsSection"],
    preferredOrdering: ["HeroSection", "FeaturesSection", "AchievementsSection", "CTASection", "PricingSection", "FAQSection", "TestimonialsSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "AchievementsSection",
      title: "Global Instant Payment Rails",
      subtitle: "Integrate institutional transaction APIs with fault-tolerant sub-millisecond execution.",
      buttonText: "Access Sandbox",
      route: "/contact"
    }
  },
  "Fintech Payment": {
    name: "Fintech Payment",
    requiredSections: ["HeroSection", "FeaturesSection", "PricingSection", "ContactSection"],
    optionalSections: ["AchievementsSection", "FAQSection", "TestimonialsSection"],
    preferredOrdering: ["HeroSection", "FeaturesSection", "AchievementsSection", "CTASection", "PricingSection", "FAQSection", "TestimonialsSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "AchievementsSection",
      title: "Global Instant Payment Rails",
      subtitle: "Integrate institutional transaction APIs with fault-tolerant sub-millisecond execution.",
      buttonText: "Access Sandbox",
      route: "/contact"
    }
  },
  "E-commerce": {
    name: "E-commerce",
    requiredSections: ["HeroSection", "FeaturedProductsSection", "CollectionsSection"],
    optionalSections: ["PricingSection", "GallerySection", "NewsletterSection", "TestimonialsSection"],
    preferredOrdering: ["HeroSection", "FeaturedProductsSection", "CollectionsSection", "CTASection", "GallerySection", "PricingSection", "TestimonialsSection", "NewsletterSection"],
    ctaStrategy: {
      targetAfter: "CollectionsSection",
      title: "Bespoke Sustainable Luxury Collection",
      subtitle: "Explore hand-tailored garments woven from ethically harvested organic cashmere and Italian organic silk.",
      buttonText: "Explore Lookbook",
      route: "/pricing"
    }
  },
  "Fashion Store": {
    name: "Fashion Store",
    requiredSections: ["HeroSection", "FeaturedProductsSection", "CollectionsSection"],
    optionalSections: ["PricingSection", "GallerySection", "NewsletterSection", "TestimonialsSection"],
    preferredOrdering: ["HeroSection", "FeaturedProductsSection", "CollectionsSection", "CTASection", "GallerySection", "PricingSection", "TestimonialsSection", "NewsletterSection"],
    ctaStrategy: {
      targetAfter: "CollectionsSection",
      title: "Bespoke Sustainable Luxury Collection",
      subtitle: "Explore hand-tailored garments woven from ethically harvested organic cashmere and Italian organic silk.",
      buttonText: "Explore Lookbook",
      route: "/pricing"
    }
  },
  "Fashion": {
    name: "Fashion",
    requiredSections: ["HeroSection", "FeaturedProductsSection", "CollectionsSection"],
    optionalSections: ["PricingSection", "GallerySection", "NewsletterSection", "TestimonialsSection"],
    preferredOrdering: ["HeroSection", "FeaturedProductsSection", "CollectionsSection", "CTASection", "GallerySection", "PricingSection", "TestimonialsSection", "NewsletterSection"],
    ctaStrategy: {
      targetAfter: "CollectionsSection",
      title: "Bespoke Sustainable Luxury Collection",
      subtitle: "Explore hand-tailored garments woven from ethically harvested organic cashmere and Italian organic silk.",
      buttonText: "Explore Lookbook",
      route: "/pricing"
    }
  },
  "Architecture": {
    name: "Architecture",
    requiredSections: ["HeroSection", "ProjectsSection", "ServicesSection", "ContactSection"],
    optionalSections: ["GallerySection", "ProcessSection", "TestimonialsSection"],
    preferredOrdering: ["HeroSection", "ProjectsSection", "ServicesSection", "ProcessSection", "CTASection", "GallerySection", "TestimonialsSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "ProcessSection",
      title: "Architectural Brutalism & Environmental Harmony",
      subtitle: "Commission enduring structural concepts engineered with sustainable monolithic materials and timeless proportion.",
      buttonText: "Initiate Commission",
      route: "/contact"
    }
  },
  "Non-profit": {
    name: "Non-profit",
    requiredSections: ["HeroSection", "ServicesSection", "AchievementsSection", "ContactSection"],
    optionalSections: ["ProjectsSection", "TestimonialsSection", "FAQSection", "NewsletterSection"],
    preferredOrdering: ["HeroSection", "ServicesSection", "AchievementsSection", "CTASection", "ProjectsSection", "FAQSection", "NewsletterSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "AchievementsSection",
      title: "Drive Enduring Humanitarian Impact",
      subtitle: "Partner with our global philanthropic initiatives to empower underrepresented communities with lasting infrastructure.",
      buttonText: "Support Our Mission",
      route: "/contact"
    }
  },
  "Consulting": {
    name: "Consulting",
    requiredSections: ["HeroSection", "ServicesSection", "AchievementsSection", "ContactSection"],
    optionalSections: ["ProcessSection", "TestimonialsSection", "FAQSection"],
    preferredOrdering: ["HeroSection", "ServicesSection", "AchievementsSection", "ProcessSection", "CTASection", "TestimonialsSection", "FAQSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "ProcessSection",
      title: "Strategic Enterprise Transformation",
      subtitle: "Accelerate institutional market valuation and operational throughput through empirical organizational engineering.",
      buttonText: "Engage Advisors",
      route: "/contact"
    }
  },
  "Automotive": {
    name: "Automotive",
    requiredSections: ["HeroSection", "FeaturesSection", "GallerySection", "ContactSection"],
    optionalSections: ["PricingSection", "TestimonialsSection", "FAQSection", "SampleSection"],
    preferredOrdering: ["HeroSection", "FeaturesSection", "GallerySection", "SampleSection", "TestimonialsSection", "PricingSection", "FAQSection", "CTASection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "GallerySection",
      title: "Experience the Future of Driving",
      subtitle: "Configure your vehicle or schedule an exclusive test drive today.",
      buttonText: "Book Test Drive",
      route: "/contact"
    }
  },
  "Hospitality": {
    name: "Hospitality",
    requiredSections: ["HeroSection", "GallerySection", "FeaturesSection", "ContactSection"],
    optionalSections: ["PricingSection", "TestimonialsSection", "FAQSection", "SampleSection"],
    preferredOrdering: ["HeroSection", "GallerySection", "FeaturesSection", "PricingSection", "TestimonialsSection", "SampleSection", "FAQSection", "CTASection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "GallerySection",
      title: "Reserve Your Ultimate Escape",
      subtitle: "Experience unmatched luxury, comfort, and service.",
      buttonText: "Book Now",
      route: "/contact"
    }
  },
  "Cybersecurity": {
    name: "Cybersecurity",
    requiredSections: ["HeroSection", "FeaturesSection", "ServicesSection", "ContactSection"],
    optionalSections: ["AchievementsSection", "TestimonialsSection", "FAQSection", "PricingSection"],
    preferredOrdering: ["HeroSection", "FeaturesSection", "ServicesSection", "AchievementsSection", "CTASection", "TestimonialsSection", "FAQSection", "PricingSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "AchievementsSection",
      title: "Secure Your Enterprise Today",
      subtitle: "Partner with our cyber defense team to deploy zero-trust protection and real-time threat intelligence.",
      buttonText: "Request Security Audit",
      route: "/contact"
    }
  },
  "Technology": {
    name: "Technology",
    requiredSections: ["HeroSection", "FeaturesSection", "ServicesSection", "ContactSection"],
    optionalSections: ["AchievementsSection", "TestimonialsSection", "FAQSection", "PricingSection", "SampleSection"],
    preferredOrdering: ["HeroSection", "FeaturesSection", "ServicesSection", "AchievementsSection", "CTASection", "TestimonialsSection", "FAQSection", "PricingSection", "SampleSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "AchievementsSection",
      title: "Build the Next Quantum Paradigm",
      subtitle: "Harness resilient cloud computing infrastructure, generative neural models, and world-scale edge acceleration.",
      buttonText: "Get Started",
      route: "/contact"
    }
  },
  "Education": {
    name: "Education",
    requiredSections: ["HeroSection", "ServicesSection", "DoctorsSection", "AppointmentSection"],
    optionalSections: ["FeaturesSection", "TestimonialsSection", "FAQSection", "PricingSection"],
    preferredOrdering: ["HeroSection", "ServicesSection", "DoctorsSection", "FeaturesSection", "CTASection", "TestimonialsSection", "FAQSection", "AppointmentSection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "FeaturesSection",
      title: "Begin Your Academic Journey & Future Career",
      subtitle: "Join an inspiring worldwide community of innovators, researchers, and bold leaders shaping the digital future.",
      buttonText: "Apply Now",
      route: "/admissions"
    }
  },
  "Space": {
    name: "Space",
    requiredSections: ["HeroSection", "FeaturesSection", "ServicesSection", "ContactSection"],
    optionalSections: ["PricingSection", "AchievementsSection", "ExperienceSection"],
    preferredOrdering: ["HeroSection", "FeaturesSection", "ServicesSection", "ExperienceSection", "PricingSection", "AchievementsSection", "CTASection", "ContactSection"],
    ctaStrategy: {
      targetAfter: "ServicesSection",
      title: "Secure Your Orbit Launch Manifest",
      subtitle: "Launch your payloads into custom inclinations and deep space transfer trajectories.",
      buttonText: "Book Launch Manifest",
      route: "/contact"
    }
  }
};

// ─── HELPER METHODS ───────────────────────────────────────────────────────────
function resolveProfile(industry, prompt = "") {
  const norm = String(industry).trim();
  if (INDUSTRY_PROFILES[norm]) return INDUSTRY_PROFILES[norm];

  const pLower = (prompt + " " + norm).toLowerCase();
  
  // Define strict positive keyword signals for matching profiles
  const signals = {
    "Automotive": /\b(car|automotive|auto|vehicle|hypercar|supercar|motors)\b/i,
    "Cybersecurity": /\b(cybersecurity|security|cyber|defense|threat|infosec|soc)\b/i,
    "Architecture": {
      test: (text) => {
        if (/\b(architecture|architect|building|construction)\b/i.test(text)) {
          return !/\b(software|system|cloud|data|network|technical)\s+architect/i.test(text);
        }
        return false;
      }
    },
    "Hospitality": /\b(hotel|motel|resort|hospitality|accommodation)\b/i,
    "Restaurant": /\b(restaurant|food|dining|cafe|coffee|bistro|kitchen|bakery)\b/i,
    "Healthcare": /\b(health|medical|wellness|care|clinic|hospital|doctor|patient)\b/i,
    "Gaming": /\b(game|gaming|esport|tournament|streamer|twitch)\b/i,
    "FinTech": /\b(finance|fintech|payment|bank|crypto|web3|wallet|invest|trading)\b/i,
    "Law Firm": /\b(law|legal|attorney|lawyer|counsel|litigation)\b/i,
    "Gym": /\b(gym|fitness|workout|athletic|training|crossfit)\b/i,
    "E-Commerce": /\b(ecommerce|e-commerce|shop|store|retail|merch)\b/i,
    "Portfolio": /\b(portfolio|developer|freelance|resume|personal|bio|cv)\b/i,
    "Agency": /\b(agency|studio|creative|marketing|advertising|consultancy)\b/i,
    "Space": /\b(space|cosmos|nasa|orbital|aerospace|astrophysics|satellite|rocket|galaxy)\b/i,
    "SaaS": /\b(saas|workflow|automate|platform|software|app|cloud|enterprise)\b/i,
    "Education": /\b(education|edu|school|college|university|academy|campus|learning)\b/i
  };

  for (const [key, testable] of Object.entries(signals)) {
    const passed = typeof testable.test === 'function' ? testable.test(pLower) : testable.test(pLower);
    if (passed && INDUSTRY_PROFILES[key]) {
      // Prioritize checking if the prompt explicitly excludes this domain
      // e.g. "not a portfolio" or "no restaurant"
      const excludeRx = new RegExp(`\\b(not|no|don't|never|without)\\s+(a\\s+)?${key.toLowerCase()}\\b`, 'i');
      if (!excludeRx.test(pLower)) {
        return INDUSTRY_PROFILES[key];
      }
    }
  }

  for (const [key, prof] of Object.entries(INDUSTRY_PROFILES)) {
    if (pLower.includes(key.toLowerCase())) {
      const excludeRx = new RegExp(`\\b(not|no|don't|never|without)\\s+(a\\s+)?${key.toLowerCase()}\\b`, 'i');
      if (!excludeRx.test(pLower)) {
        return prof;
      }
    }
  }
  return INDUSTRY_PROFILES["Technology"];
}

function resolveDensity(prompt = "", profileName = "") {
  const text = (prompt + " " + profileName).toLowerCase();
  if (text.includes("landing") || text.includes("simple") || text.includes("minimal") || text.includes("quick")) {
    return { level: "simple", targetCount: 4, spacing: "xl" };
  }
  if (text.includes("enterprise") || text.includes("platform") || text.includes("comprehensive") || text.includes("corporate")) {
    return { level: "complex", targetCount: 8, spacing: "md" };
  }
  if (text.includes("portfolio") || text.includes("showcase") || text.includes("creative") || text.includes("agency")) {
    return { level: "large", targetCount: 7, spacing: "lg" };
  }
  return { level: "medium", targetCount: 6, spacing: "lg" };
}

function resolveVariant(compName, theme = "modernDark", idx = 0) {
  const reg = SECTION_REGISTRY[compName] || {};
  const variants = reg.variants || ["default"];
  if (compName === "HeroSection") {
    if (theme === "apple") return "minimal";
    if (theme === "vercel") return "split";
    if (theme === "linear") return "3d";
    if (theme === "stripe") return "centered";
    if (theme === "framer") return "fullscreen";
    if (theme === "notion") return "minimal";
    return variants[idx % variants.length] || "3d";
  }
  if (compName === "FeaturesSection" || compName === "ServicesSection") {
    if (theme === "linear" || theme === "apple") return "grid_3";
    if (theme === "vercel") return "cards";
    return variants[0] || "cards";
  }
  if (compName === "PricingSection") {
    if (theme === "stripe") return "comparison";
    return "cards";
  }
  return variants[0] || "default";
}

// ─── MAIN LAYOUT PLANNER GENERATION ───────────────────────────────────────────
export function generateLayoutPlan(bp, prompt = "", industryParam = "", themeParam = "") {
  const industry = industryParam || bp?.industry || "Technology";
  const theme = themeParam || bp?.theme || bp?.themeName || "modernDark";
  const pText = prompt || bp?.meta?.prompt || "";

  const profile = resolveProfile(industry, pText);
  const density = resolveDensity(pText, profile.name);

  // 1. Gather candidate sections from Blueprint if present, else initialize with required & optional pool
  const bpSections = (bp && bp.sections) ? bp.sections : [];
  const candidateMap = {};

  bpSections.forEach(s => {
    if (!s) return;
    const cName = s.componentName || `${String(s.name || s.id || 'Custom').replace(/\s+/g, '')}Section`;
    candidateMap[cName] = s;
  });

  // Ensure mandatory Hero Section exists in candidate Map
  if (!candidateMap["HeroSection"]) {
    candidateMap["HeroSection"] = { componentName: "HeroSection", name: "Hero", id: "hero" };
  }

  // Add required profile sections if missing from candidateMap
  profile.requiredSections.forEach(cName => {
    if (!candidateMap[cName] && cName !== "CTASection") {
      candidateMap[cName] = {
        componentName: cName,
        name: cName.replace("Section", ""),
        id: (SECTION_REGISTRY[cName]?.id || cName.replace("Section", "").toLowerCase())
      };
    }
  });

  // Add optional sections until we reach target density count
  let currentKeys = Object.keys(candidateMap);
  for (const optName of profile.optionalSections) {
    if (currentKeys.length >= density.targetCount) break;
    if (!candidateMap[optName] && optName !== "CTASection") {
      candidateMap[optName] = {
        componentName: optName,
        name: optName.replace("Section", ""),
        id: (SECTION_REGISTRY[optName]?.id || optName.replace("Section", "").toLowerCase())
      };
      currentKeys.push(optName);
    }
  }

  // Always retain SampleSection for interactive demo showcase if present in pool or standard check
  if (!candidateMap["SampleSection"] && (density.level === "large" || profile.name === "Developer Portfolio" || profile.name === "SaaS")) {
    candidateMap["SampleSection"] = { componentName: "SampleSection", name: "Interactive Demo", id: "sample" };
  }

  // 2. Sort components strictly according to Preferred Ordering from profile
  const sortedNames = Object.keys(candidateMap).sort((a, b) => {
    const idxA = profile.preferredOrdering.indexOf(a);
    const idxB = profile.preferredOrdering.indexOf(b);
    const posA = idxA === -1 ? 999 : idxA;
    const posB = idxB === -1 ? 999 : idxB;
    return posA - posB;
  });

  // 3. Apply Context-Aware CTA Strategy insertion
  const ctaStrategy = profile.ctaStrategy || {
    targetAfter: "FeaturesSection",
    title: "Accelerate Your Growth Today",
    subtitle: "Join top performers utilizing next-generation digital tools and real-time intelligence.",
    buttonText: "Get Started",
    route: "/contact"
  };

  const finalOrderedNames = [];
  let ctaInserted = false;
  for (const cName of sortedNames) {
    if (cName === "CTASection") continue; // We position CTA via strategy below
    finalOrderedNames.push(cName);
    if (cName === ctaStrategy.targetAfter && !ctaInserted) {
      finalOrderedNames.push("CTASection");
      ctaInserted = true;
    }
  }
  if (!ctaInserted) {
    // If targetAfter section wasn't in sequence, place CTA immediately before ContactSection or at end
    const contactIdx = finalOrderedNames.indexOf("ContactSection");
    if (contactIdx !== -1) {
      finalOrderedNames.splice(contactIdx, 0, "CTASection");
    } else {
      finalOrderedNames.push("CTASection");
    }
  }

  // 4. Build navigation links from present sections and standard pages
  const navLinks = ["Home"];
  finalOrderedNames.forEach(cName => {
    if (cName === "HeroSection" || cName === "CTASection" || cName === "SampleSection") return;
    let navLabel = cName.replace("Section", "");
    if (navLabel === "FeaturedDishes") navLabel = "Menu";
    if (navLabel === "FeaturedProducts") navLabel = "Collection";
    if (navLabel === "Achievements") navLabel = "Stats";
    if (navLabel === "Reservation" || navLabel === "Appointment") navLabel = "Book";
    if (navLabel === "Doctors") navLabel = "Team";
    if (navLabel === "Services") navLabel = "Programs";
    if (navLabel === "Contact") navLabel = "Contact";
    if (!navLinks.includes(navLabel) && navLinks.length < 7) {
      navLinks.push(navLabel);
    }
  });

  // 5. Assemble structured page layout schema
  const schemaSections = finalOrderedNames.map((cName, index) => {
    const origSec = candidateMap[cName] || {};
    const reg = SECTION_REGISTRY[cName] || {};
    const varSelected = resolveVariant(cName, theme, index);

    return {
      id: reg.id || origSec.id || cName.replace("Section", "").toLowerCase(),
      type: cName.replace("Section", "").toLowerCase(),
      componentName: cName,
      variant: varSelected,
      priority: index + 1,
      estimatedHeight: reg.estimatedHeight || "700px",
      content: origSec.content || {},
      threeObject: origSec.threeObject || "Floating Sphere"
    };
  });

  return {
    theme: theme,
    pageType: profile.name.toLowerCase(),
    complexity: density.level,
    spacingDensity: density.spacing,
    navLinks: navLinks,
    ctaStrategy: ctaStrategy,
    sections: schemaSections
  };
}

export default {
  SECTION_REGISTRY,
  INDUSTRY_PROFILES,
  generateLayoutPlan
};
