/**
 * Static copy and openings for the Careers page.
 *
 * Apps Script endpoints live in env — see `getCareersGeneralScriptUrl` /
 * `getCareersJobScriptUrl` in `@/lib/env`.
 */

export const CAREERS_RESUME_MAX_BYTES = 5 * 1024 * 1024;

export const CAREERS_RESUME_ACCEPT =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const CAREERS_BANNER = {
  desktop: {
    src: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/Career_desktop_banner-9cbe8d3e.jpg',
    width: 7680,
    height: 3040,
    alt: 'Craft your career with Palmonas — join our family',
  },
  mobile: {
    src: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/Career_mobile_banner-308e8e93.jpg',
    width: 1440,
    height: 2244,
    alt: 'Craft your career with Palmonas — join our family',
  },
} as const;

export interface CareerStat {
  value: string;
  label: string;
}

export interface CareerBenefit {
  id: string;
  title: string;
  description: string;
  icon: 'sparkles' | 'growth' | 'wellness' | 'inclusive';
}

export interface CareerJobOpening {
  id: string;
  /** Identifier sent to the job applications Apps Script. */
  jobId: string;
  title: string;
  /** Display title used in the job applications payload. */
  applicationTitle: string;
  department: string;
  location: string;
  employmentType: string;
  /** When false, the card CTA is disabled (no published JD yet). */
  isOpen: boolean;
  about: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
}

export const careersAbout = {
  badge: 'About Us',
  heading: 'Creating Timeless Beauty',
  description:
    "We are a luxury jewellery brand dedicated to crafting extraordinary pieces that celebrate life's most precious moments. Our commitment to excellence, innovation, and artisanal craftsmanship sets us apart in the world of fine jewellery.",
} as const;

export const careersStats: CareerStat[] = [
  { value: '250+', label: 'Talented Team' },
  { value: '75+', label: 'Offline Stores' },
  { value: '10lakh+', label: 'Customer' },
];

export const careersWhyJoin = {
  badge: 'Why Join Us',
  heading: 'Where Passion Meets Purpose',
  description:
    'Join a team that values your unique talents and supports your growth every step of the way',
} as const;

export const careersBenefits: CareerBenefit[] = [
  {
    id: 'creative-freedom',
    title: 'Creative Freedom',
    description:
      'Express your artistry and bring innovative ideas to life in a supportive environment.',
    icon: 'sparkles',
  },
  {
    id: 'career-growth',
    title: 'Career Growth',
    description:
      'Continuous learning opportunities, mentorship programs, and clear advancement paths.',
    icon: 'growth',
  },
  {
    id: 'wellness',
    title: 'Wellness & Balance',
    description:
      'Comprehensive health benefits, structured schedules, and focus on work-life harmony.',
    icon: 'wellness',
  },
  {
    id: 'inclusive',
    title: 'Inclusive Culture',
    description:
      'Be part of a diverse, collaborative team that celebrates individuality and teamwork.',
    icon: 'inclusive',
  },
];

export const careersOpenings = {
  badge: 'Open Positions',
  heading: 'Find Your Perfect Role.',
  description: 'Explore opportunities across our organisation',
} as const;

export const careersGeneralForm = {
  badge: 'General Application',
  heading: "Don't See Your Role?",
  description: "Submit your resume and we'll keep you in mind for future opportunities",
  successMessage: 'Thank you — your application was submitted.',
} as const;

export const careerJobOpenings: CareerJobOpening[] = [
  {
    id: 'assistant-store-manager',
    jobId: '2',
    title: 'Assistant Store manager/Store manager',
    applicationTitle: 'ASSISTANT STORE MANAGER / STOREMANAGER',
    department: 'Retail',
    location: 'PAN INDIA',
    employmentType: 'Full-time',
    isOpen: true,
    about:
      'We are looking for an experienced and dynamic Store Supervisor (Jewellery) to join our retail team. This role is ideal for candidates with a strong background in jewellery retail who can lead store operations, drive sales, and ensure an exceptional customer experience. You will play a key role in managing daily store activities, supporting the team, and maintaining brand standards while contributing to overall business growth.',
    responsibilities: [
      'Assist in recruiting, training, and mentoring store staff to maintain high performance and professionalism.',
      'Ensure high standards of customer service to create a welcoming shopping experience.',
      'Actively engage with customers, understand their needs, and assist in purchase decisions.',
      'Handle customer queries, complaints, and feedback professionally and efficiently.',
      'Oversee daily store operations, including opening and closing procedures.',
      'Ensure accurate and secure cash handling and billing processes.',
      'Supervise daily activities of team members, ensuring adherence to company policies and procedures.',
      'Foster a positive and motivating work environment to enhance team productivity and morale.',
      'Track store sales, team performance, and operational metrics.',
      'Analyze sales trends and customer preferences to provide actionable insights.',
      'Support implementation of sales initiatives and promotional campaigns.',
    ],
    requirements: [
      'Strong understanding of jewellery products, customer preferences, and sales techniques.',
      'Proven ability to drive sales and meet targets.',
      'Experience in team supervision, training, and performance management.',
      'Maintain compliance with company policies, safety regulations, and operational standards.',
    ],
    niceToHave: [
      'Prior experience in a supervisory or assistant store manager role in jewellery retail.',
      'Familiarity with retail KPIs, sales tracking, and reporting tools.',
    ],
  },
  {
    id: 'senior-sales-executive',
    jobId: '3',
    title: 'Senior Sales Executive/ Sales Executive',
    applicationTitle: 'SENIOR SALES EXECUTIVE / SALES EXECUTIVE',
    department: 'Retail',
    location: 'PAN INDIA',
    employmentType: 'Full-time',
    isOpen: true,
    about:
      'We are looking for a passionate and customer-focused Jewellery Sales Associate to join our retail team. This role is ideal for individuals with a strong interest in jewellery and retail sales, who can deliver exceptional customer experiences while driving sales performance. You will be responsible for assisting customers, showcasing products, and contributing to overall store success.',
    responsibilities: [
      'Understand customer needs and provide suitable product recommendations based on preferences and budget.',
      'Assist customers in selecting jewellery by explaining product details, materials, and design features.',
      'Drive sales by promoting products and identifying opportunities for upselling and cross-selling.',
      'Build and maintain strong customer relationships through excellent service and follow-up communication.',
      'Maintain in-depth knowledge of jewellery collections, including gemstones, precious metals, designs, and trends.',
      'Effectively showcase products, providing detailed and accurate information to customers.',
      'Ensure proper handling and care of jewellery so items remain in excellent condition for display and trials.',
      'Process customer transactions efficiently, including cash, card payments, and financing options where applicable.',
      'Use CRM tools to track customer preferences and maintain a database of repeat clients.',
      'Leverage customer data to enhance engagement and drive repeat business.',
    ],
    requirements: [
      'Basic to strong understanding of jewellery products, materials, and trends.',
      'Previous experience in jewellery or retail sales is preferred.',
      'Proven ability to achieve sales targets and drive conversions.',
      'Strong upselling and cross-selling capabilities.',
      'Excellent communication and interpersonal skills.',
      'Ability to build rapport and provide personalized service.',
    ],
    niceToHave: [
      'Prior experience in jewellery retail or luxury retail sales.',
      'Familiarity with CRM tools and retail billing systems.',
      'Passion for fashion, jewellery, and customer service.',
    ],
  },
  {
    id: 'pr-sourcing-executive',
    jobId: '4',
    title: 'PR Sourcing Executive',
    applicationTitle: 'PR SOURCING EXECUTIVE',
    department: 'Marketing',
    location: 'PUNE, IND',
    employmentType: 'Full-time',
    isOpen: true,
    about:
      'We are looking for a proactive and well-connected PR Sourcing Executive to join our team in Pune. This role is ideal for someone with strong industry relationships and a keen understanding of fashion, celebrity styling, and media placements. You will play a key role in driving brand visibility by securing jewellery placements with celebrities, influencers, and leading publications.',
    responsibilities: [
      'Reach out to celebrity stylists for jewellery sourcing and placements across shoots, red carpets, promotions, and events.',
      'Build connections with fashion and lifestyle publication stylists for editorial and digital placement opportunities.',
      'Identify and map relevant celebrities, influencers, and KOLs to maximize brand exposure.',
      'Develop and maintain strong relationships with CAT-A stylists, celebrity managers, influencer agencies, and publication stylists.',
      'Act as the primary point of contact for all sourcing and placement collaborations.',
      'Manage end-to-end sample logistics including dispatch, pickups, fittings, tracking, and safe returns.',
      'Maintain accurate records of inventory movement related to PR activities.',
      'Track all deliverables including social media posts, videos, event appearances, credits, and endorsements.',
      'Monitor brand mentions, tags, and media coverage across digital and social platforms.',
      'Execute media outreach for secured placements and ensure proper coverage documentation.',
      'Prepare performance reports including reach, impressions, engagement, and overall placement impact.',
      'Maintain daily trackers for placements and campaign performance.',
      'Build and maintain a calendar of key events, red carpets, festivals, and shoots for proactive placement planning.',
    ],
    requirements: [
      'Experience in PR, celebrity sourcing, influencer marketing, or fashion/luxury brand collaborations.',
      'Strong understanding of the fashion, media, and entertainment ecosystem.',
      'Excellent networking skills with the ability to build and maintain industry relationships.',
      'Strong verbal and written communication skills for outreach and coordination.',
      'Experience in managing logistics, tracking deliverables, and handling multiple collaborations simultaneously.',
      'High attention to detail in tracking placements and inventory.',
    ],
    niceToHave: [
      'Prior experience working with stylists, influencers, or media agencies.',
      'Familiarity with PR tools, social media tracking, and reporting metrics.',
      'Passion for fashion, jewellery, and celebrity culture.',
    ],
  },
  {
    id: 'studio-manager',
    jobId: '5',
    title: 'Studio Manager/ Creative Producer',
    applicationTitle: 'STUDIO MANAGER / CREATIVE PRODUCER',
    department: 'Creative',
    location: 'PUNE, IND',
    employmentType: 'Full-time',
    isOpen: true,
    about:
      "We're looking for a Production Manager to lead the planning and execution of all creative production across catalog shoots, campaign shoots, and large-scale brand initiatives. If you enjoy building systems, working closely with creative teams, and making complex productions feel seamless, this role is for you.",
    responsibilities: [
      'Oversee end-to-end production for catalog and campaign shoots.',
      'Create monthly production plans in advance with clear timelines.',
      'Coordinate shoot schedules, studios, vendors, models, stylists, and post-production.',
      'Ensure deliverables are completed within agreed timelines.',
      'Log and manage all production tasks on Monday.com.',
      'Assign owners, set deadlines, and track progress transparently.',
      'Share weekly production status updates with stakeholders.',
      'Proactively identify risks and adjust plans when required.',
      'Plan and allocate shoot days, post-production bandwidth, and vendor timelines efficiently.',
      'Monitor team capacity and prevent scheduling conflicts.',
      'Maintain clear SOPs for catalog shoot workflows, shoot schedules, vendor coordination, and sample movement tracking.',
      'Act as the coordination point between Creative, Marketing, Vendors, and Leadership.',
    ],
    requirements: [
      '3–5 years of experience in creative production, campaign execution, or shoot management in an agency, production house, or in-house environment.',
      'Strong planning and organizational skills.',
      'Experience working with multiple stakeholders in a fast-paced environment.',
      'Comfort with project management tools (Monday.com preferred).',
      'Clear communicator who stays calm under pressure.',
      'Detail-oriented with a problem-solving mindset.',
    ],
    niceToHave: [
      'Experience building production systems that support ambitious, high-quality creative work.',
    ],
  },
  {
    id: 'software-developer',
    jobId: '1',
    title: 'Software Developer Engineer',
    applicationTitle: 'SOFTWARE DEVELOPMENT ENGINEER',
    department: 'Tech',
    location: 'PUNE, IND',
    employmentType: 'Full-time',
    isOpen: true,
    about:
      'We are looking for a highly skilled Software Engineer (Full Stack / Backend) to join our growing technology team. You will be responsible for building scalable, reliable, high-performance applications and contributing to core product development. This role is ideal for engineers who love solving complex problems, writing clean code, and working in a fast-paced product environment.',
    responsibilities: [
      'Design, develop, and maintain backend services, APIs, and microservices.',
      'Build highly scalable, secure, and fault-tolerant systems.',
      'Integrate with internal and external systems using RESTful APIs.',
      'Participate in code reviews and ensure adherence to best practices.',
      'Implement database schemas, queries, and optimizations for high availability.',
    ],
    requirements: [
      'Strong understanding of Python / Go (choose based on your stack).',
      'Experience building RESTful APIs and microservices.',
      'Hands-on experience with SQL (PostgreSQL, MongoDB, etc.).',
      'Solid understanding of data structures, algorithms, and OOP concepts.',
      'Experience with caching, queuing systems, and authentication frameworks.',
      'Proficiency in React / Next.js / React Native.',
      'Strong knowledge of HTML, CSS, JavaScript, and browser fundamentals.',
      'Understanding of modern front-end build tools and workflows.',
      'Experience with Git, CI/CD pipelines, Docker, cloud (AWS).',
      'Familiarity with containerized application deployment is a plus.',
    ],
    niceToHave: [
      'Experience working in a startup or product-based company.',
      'Exposure to distributed systems and event-driven architectures.',
      'Knowledge of system design and scalability principles.',
      'Contribution to open-source projects.',
    ],
  },
  {
    id: 'finance-erp',
    jobId: '7',
    title: 'Finance X ERP Next',
    applicationTitle: 'Finance X ERP Next',
    department: 'Finance',
    location: 'PUNE, IND',
    employmentType: 'Full Time',
    isOpen: true,
    about:
      'We are hiring for a Finance role focused on transitioning from Tally to an ERP environment (ERPNext). The role will involve driving data migration, setting up masters and business workflows, ensuring a clean and controlled implementation, and supporting ongoing finance operations post go-live.',
    responsibilities: [
      'Drive data migration and master setup for the ERPNext implementation.',
      'Structure business workflows with strong finance and accounting fundamentals.',
      'Collaborate closely with finance and tech teams through go-live and beyond.',
    ],
    requirements: [
      'Hands-on with technology, with interest and experience in ERP systems (ERPNext preferred).',
      'Strong MS Excel skills.',
    ],
    niceToHave: [],
  },
  {
    id: '3d-visualisation',
    jobId: '6',
    title: '3D Visualisation Specialist- Manager',
    applicationTitle: '3D Visualisation Specialist',
    department: 'Creative',
    location: 'PUNE, IND',
    employmentType: 'Full-time',
    isOpen: true,
    about:
      'We are looking for a creative and detail-oriented 3D Visualisation Specialist to join our team. This role is ideal for someone who can bring concepts to life through high-quality 3D renders, particularly in the jewellery and luxury space. You will be responsible for creating realistic product visualizations, enhancing brand storytelling, and supporting marketing, design, and product teams with compelling visual content.',
    responsibilities: [
      'Lead and manage the end-to-end 3D visualisation catalog process, from CAD to final render, for all product categories.',
      'Translate design concepts, CADs, and sketches into high-quality, photorealistic renders aligned with brand aesthetics.',
      'Oversee the creation of visual catalogues, campaign assets, and e-commerce imagery.',
      'Ensure consistency in lighting, textures, materials, and overall visual language across all outputs.',
      'Collaborate closely with design, creative, and product teams to meet creative and business objectives.',
      'Establish and maintain rendering standards, workflows, and quality benchmarks.',
      'Optimize rendering processes for efficiency without compromising quality.',
      'Stay updated with the latest tools, technologies, and trends in 3D visualisation and jewellery rendering.',
    ],
    requirements: [
      'Experience in jewellery rendering (stones, metal finishes, reflections).',
      'Strong understanding of luxury/premium visual aesthetics.',
      'Hands-on expertise in tools like Blender, KeyShot, Rhino, Matrix, or similar.',
      '3+ years of relevant experience.',
    ],
    niceToHave: [],
  },
];

/**
 * Builds a plain-text job description for Apps Script payloads.
 *
 * @param job - Open position with structured JD sections.
 * @returns Multi-line description including about, responsibilities, and requirements.
 */
export function buildJobDescriptionText(job: CareerJobOpening): string {
  const sections: string[] = [];

  if (job.about) {
    sections.push(`About the role\n${job.about}`);
  }

  if (job.responsibilities.length > 0) {
    sections.push(
      `Responsibilities\n${job.responsibilities.map((item) => `- ${item}`).join('\n')}`,
    );
  }

  if (job.requirements.length > 0) {
    sections.push(`Requirements\n${job.requirements.map((item) => `- ${item}`).join('\n')}`);
  }

  if (job.niceToHave.length > 0) {
    sections.push(`Nice to Have\n${job.niceToHave.map((item) => `- ${item}`).join('\n')}`);
  }

  return sections.join('\n\n');
}
