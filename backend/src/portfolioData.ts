/**
 * src/portfolioData.ts
 * Single source of truth for the Team Portfolio AI project.
 *
 * Architecture decisions:
 * - Exactly 3 team members (fixed tuple).
 * - Unlimited individual and team projects (readonly arrays).
 * - Local image paths under frontend/public/images/.
 * - All visitor-facing copy supports English and Thai.
 * - Sample data is explicitly marked and excluded from AI knowledge context.
 *
 * Backward compatibility:
 * - Existing fields used by current components are retained while the UI is
 *   migrated section by section.
 */

/* -------------------------------------------------------------------------- */
/* Shared primitives                                                           */
/* -------------------------------------------------------------------------- */

export type Language = 'en' | 'th';

export type MemberId = 'member-1' | 'member-2' | 'member-3';

/**
 * Store manually reviewed copy in both languages.
 * Empty strings are allowed while the team is still collecting information.
 */
export interface LocalizedText {
  readonly en: string;
  readonly th: string;
}

export interface ThemeColor {
  /** Main accent, e.g. for borders and glows. */
  readonly primary: string;
  /** Secondary accent, used in gradients. */
  readonly secondary: string;
  /** Soft glow color (rgba) for box-shadows. */
  readonly glow: string;
}

/** Legacy summary kept for the existing TeamHero component during migration. */
export interface ProjectSummary {
  readonly title: string;
  readonly description: string;
  readonly isPlaceholder?: boolean;
}

export interface ContactInfo {
  /** Legacy fields retained for TeamContact until it is migrated. */
  readonly githubUrl: string;
  readonly teamEmail: string;
  readonly linkedinUrl?: string;
  readonly websiteUrl?: string;
  readonly isPlaceholder?: boolean;
}

export interface MemberSocialLinks {
  readonly github?: string;
  readonly linkedin?: string;
  readonly portfolio?: string;
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                    */
/* -------------------------------------------------------------------------- */

export type ProjectStatus = 'planned' | 'in-progress' | 'completed';

/** Shared shape for both personal projects and collaborative team projects. */
export interface ProjectBase {
  readonly id: string;
  readonly title: LocalizedText;
  readonly description: LocalizedText;
  readonly projectType?: LocalizedText;
  readonly year?: number;
  readonly technologies: readonly string[];
  readonly role?: LocalizedText;
  readonly responsibilities?: readonly LocalizedText[];
  readonly features?: readonly LocalizedText[];
  readonly result?: LocalizedText;
  /** Path relative to frontend/public, e.g. /images/projects/member-1/project.webp */
  readonly coverImage?: string;
  /** Additional paths relative to frontend/public. */
  readonly gallery?: readonly string[];
  readonly repositoryUrl?: string;
  readonly demoUrl?: string;
  /** True means this is demonstration content, not a verified portfolio claim. */
  readonly isPlaceholder: boolean;
  /** Show this project in the "Selected work" section of the home page. */
  readonly isHighlighted?: boolean;
}

/** A project owned by an individual member. The array is intentionally unlimited. */
export type IndividualProject = ProjectBase;

/** A project built collaboratively by the team. */
export interface TeamProject extends ProjectBase {
  readonly contributors: readonly MemberId[];
  readonly status: ProjectStatus;
  readonly isFeatured: boolean;
}

/* -------------------------------------------------------------------------- */
/* Skill sets                                                                  */
/* -------------------------------------------------------------------------- */

/** Role-discriminated skill structures retained for existing MemberCard logic. */
export interface FrontendSkills {
  readonly core: readonly string[];
  readonly designAndAnimation: readonly string[];
  readonly tools: readonly string[];
}

export interface BackendSkills {
  readonly core: readonly string[];
  readonly toolsAndAI: readonly string[];
}

export interface DevOpsSkills {
  readonly core: readonly string[];
  readonly testing: readonly string[];
  readonly webServer: readonly string[];
}

/* -------------------------------------------------------------------------- */
/* Members                                                                     */
/* -------------------------------------------------------------------------- */

interface MemberBase {
  readonly id: MemberId;
  /** One line on what this member built for the team project (shown on the member card). */
  readonly mainContribution?: LocalizedText;
  /** Up to five skills shown as chips on the member card. */
  readonly highlightSkills?: readonly string[];
  readonly fullName: string;
  readonly nickname: string;
  readonly fullNameI18n?: LocalizedText;
  readonly nicknameI18n?: LocalizedText;
  /** Manually confirmed age, when the member chooses to publish it. */
  readonly age?: number;
  readonly isNameVerified?: boolean;
  /** Legacy English field retained for the existing MemberCard. */
  readonly roleName: string;
  /** New bilingual role field for the language-aware UI. */
  readonly roleNameI18n: LocalizedText;
  readonly introduction: LocalizedText;
  readonly biography: LocalizedText;
  /** Local path under frontend/public, e.g. /images/members/member-1.webp. */
  readonly avatar?: string;
  readonly socialLinks: MemberSocialLinks;
  readonly themeColor: ThemeColor;
  /** Legacy English field retained for the existing MemberCard. */
  readonly currentContributions: readonly string[];
  /** New bilingual equivalent for the upgraded UI and AI context. */
  readonly responsibilities: readonly LocalizedText[];
  /** Legacy single-project field retained during component migration. */
  readonly previousProject: ProjectSummary;
  /** New unlimited list of verified or clearly marked sample projects. */
  readonly projects: readonly IndividualProject[];
  /** Prevent unverified sample details from being presented as real facts. */
  readonly isPlaceholder: boolean;
}

export interface FrontendMember extends MemberBase {
  readonly roleKey: 'frontend';
  readonly skills: FrontendSkills;
}

export interface BackendMember extends MemberBase {
  readonly roleKey: 'backend';
  readonly skills: BackendSkills;
}

export interface DevOpsMember extends MemberBase {
  readonly roleKey: 'devops';
  readonly skills: DevOpsSkills;
}

/** Discriminated union: TypeScript narrows the skill structure through roleKey. */
export type Member = FrontendMember | BackendMember | DevOpsMember;

/* -------------------------------------------------------------------------- */
/* Group portfolio                                                             */
/* -------------------------------------------------------------------------- */

export interface GroupPortfolio {
  /** Legacy fields retained for current TeamHero and TeamContact components. */
  readonly teamName: string;
  readonly isNameVerified?: boolean;
  readonly isIntroductionVerified?: boolean;
  readonly isVisionVerified?: boolean;
  readonly showCoreStrengths?: boolean;
  readonly appName?: string;
  readonly appFullName?: string;
  readonly websiteTitle?: string;
  readonly logoConcept?: LocalizedText;
  readonly tagline: string;
  readonly coreStrengths: readonly [string, string, string, string];
  readonly jointProject: ProjectSummary;
  readonly contact: ContactInfo;

  /** New bilingual fields for the upgraded portfolio. */
  readonly teamNameI18n: LocalizedText;
  readonly taglineI18n: LocalizedText;
  readonly introductionLead?: LocalizedText;
  readonly introduction: LocalizedText;
  readonly visionLead?: LocalizedText;
  readonly vision: LocalizedText;
  readonly coreStrengthsI18n: readonly [
    LocalizedText,
    LocalizedText,
    LocalizedText,
    LocalizedText,
  ];

  /** Local paths relative to frontend/public. */
  readonly logo?: string;
  readonly coverImage?: string;
  /** True while the team's official identity/details have not been confirmed. */
  readonly isPlaceholder: boolean;
}

export interface PortfolioData {
  readonly group: GroupPortfolio;
  /** Exactly 3 members, as decided for this team. */
  readonly members: readonly [Member, Member, Member];
  /** Unlimited collaborative projects. */
  readonly teamProjects: readonly TeamProject[];
}

/* -------------------------------------------------------------------------- */
/* Sample data                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * IMPORTANT:
 * Alex, Blair, Casey, their biographies, skills and personal projects below
 * are demonstration placeholders from the initial UI prototype. Replace them
 * with member-approved facts before publishing the portfolio or using them as
 * AI knowledge. Placeholder content is filtered by buildPortfolioContext().
 */
export const portfolioData: PortfolioData = {
  group: {
    // Legacy English fields — retained for current components.
    teamName: 'KNOW US. ASK AI.',
    isNameVerified: true,
    isIntroductionVerified: true,
    isVisionVerified: true,
    showCoreStrengths: true,
    appName: 'KUAi',
    appFullName: 'KUAi — Know Us. Ask AI.',
    websiteTitle: 'KUAi | Team Portfolio & AI Chat',
    logoConcept: {
      en: 'KUAi lettering with purple as the primary color and blue highlighting AI.',
      th: 'ตัวอักษร KUAi ใช้สีม่วงเป็นสีหลักและสีฟ้าเน้นส่วน AI',
    },
    tagline:
      'We turn ideas into impact.',
    coreStrengths: [
      'Cross-functional collaboration with clear API contracts',
      'Agile delivery with short, review-driven iterations',
      'Quality-first mindset: automated testing and CI/CD',
      'User-centered design backed by measurable performance',
    ],
    jointProject: {
      title: 'Chat AI with Group Portfolio',
      description:
        'A team portfolio website where visitors ask an AI about our members, skills and projects in real time. React frontend, Express API, PostgreSQL chat history and Google Gemini, in Thai and English.',
      isPlaceholder: false,
    },
    contact: {
      // These are prototype values. Replace before public release.
      githubUrl: 'https://github.com/team-nexus-alpha',
      teamEmail: 'team.nexus.alpha@example.com',
      isPlaceholder: true,
    },

    // New bilingual fields.
    teamNameI18n: {
      en: 'KNOW US. ASK AI.',
      th: 'รู้จักเรา แล้วถาม AI',
    },
    taglineI18n: {
      en: 'We turn ideas into impact.',
      th: 'เราเปลี่ยนไอเดียให้กลายเป็นผลงานที่สร้างคุณค่า',
    },
    introductionLead: {
      en: 'We are KUAi (Know Us. Ask AI.)',
      th: 'เราคือทีม KUAi (Know Us. Ask AI.)',
    },
    introduction: {
      en: 'A team of Data Science & AI developers who believe traditional introductions are too boring. We turned an ordinary portfolio into an intelligent conversation space where you can get to know our work, skills, and who we are through real-time conversations with AI.',
      th: 'กลุ่มนักพัฒนาสาย Data Science & AI ที่เชื่อว่าการแนะนำตัวแบบเดิมๆ มันน่าเบื่อเกินไป เราจึงเปลี่ยนหน้า Portfolio ธรรมดาให้กลายเป็น "พื้นที่สนทนาอัจฉริยะ" ที่คุณสามารถเข้ามาทำความรู้จัก ผลงาน ทักษะ และตัวตนของพวกเราทุกคนได้ผ่านการถาม-ตอบกับ AI แบบเรียลไทม์',
    },
    visionLead: {
      en: 'Turn data into conversations and make technology accessible.',
      th: 'เปลี่ยนข้อมูลให้เป็นบทสนทนา และเปลี่ยนเทคโนโลยีให้เข้าถึงง่าย',
    },
    vision: {
      en: 'We strive to combine the power of artificial intelligence (AI) with seamless user experience (UX) design to create innovations that are not only smart at processing information, but also understand and communicate with people naturally.',
      th: 'เรามุ่งมั่นที่จะผสานพลังของปัญญาประดิษฐ์ (AI) เข้ากับการออกแบบประสบการณ์ผู้ใช้ (UX) ที่ลื่นไหล เพื่อสร้างสรรค์นวัตกรรมที่ไม่ได้แค่ "ฉลาด" ในการประมวลผล แต่ยัง "เข้าใจ" และสื่อสารกับผู้คนได้อย่างเป็นธรรมชาติ',
    },
    coreStrengthsI18n: [
      {
        en: 'Cross-functional collaboration with clear API contracts',
        th: 'การทำงานร่วมกันข้ามสายงานโดยกำหนด API Contract ให้ชัดเจน',
      },
      {
        en: 'Agile delivery with short, review-driven iterations',
        th: 'การพัฒนาแบบ Agile โดยแบ่งงานเป็นรอบสั้นและตรวจสอบอย่างต่อเนื่อง',
      },
      {
        en: 'Quality-first mindset: automated testing and CI/CD',
        th: 'ให้ความสำคัญกับคุณภาพผ่าน Automated Testing และ CI/CD',
      },
      {
        en: 'User-centered design backed by measurable performance',
        th: 'ออกแบบโดยยึดผู้ใช้งานเป็นศูนย์กลางและคำนึงถึงประสิทธิภาพที่วัดผลได้',
      },
    ],
    logo: undefined,
    coverImage: undefined,
    isPlaceholder: true,
  },

  members: [
    {
      id: 'member-1',
      roleKey: 'frontend',
      fullName: 'Warunee Kludpan',
      nickname: 'Ice',
      fullNameI18n: { en: 'Warunee Kludpan', th: 'วารุณี กลัดพันธ์' },
      nicknameI18n: { en: 'Ice', th: 'ไอซ์' },
      isNameVerified: true,
      roleName: 'Frontend Developer & UI/UX Designer',
      roleNameI18n: {
        en: 'Frontend Developer & UI/UX Designer',
        th: 'นักพัฒนา Frontend และนักออกแบบ UI/UX',
      },
      introduction: {
        en: 'Placeholder: Add a member-approved short introduction.',
        th: 'ข้อความตัวอย่าง: เพิ่มคำแนะนำตัวสั้น ๆ ที่สมาชิกยืนยันแล้ว',
      },
      biography: {
        en: 'Placeholder: Add the member biography and interests.',
        th: 'ข้อความตัวอย่าง: เพิ่มประวัติและความสนใจของสมาชิก',
      },
      avatar: '/images/projects/member-1/member-1.jpg',
      mainContribution: {
        en: 'Portfolio UI, chat UI and state management',
        th: 'Portfolio UI, Chat UI และ State Management',
      },
      highlightSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma', 'Framer Motion'],
      socialLinks: { 
        github: '', 
        linkedin: 'https://www.linkedin.com/in/warunee-kludpan-2a27663b0?utm_source=share_via&utm_content=profile&utm_medium=member_ios', 
        portfolio: '' },
      themeColor: {
        primary: '#22d3ee',
        secondary: '#6366f1',
        glow: 'rgba(34, 211, 238, 0.35)',
      },
      skills: {
        core: ['React', 'TypeScript', 'Tailwind CSS', 'JavaScript'],
        designAndAnimation: ['Figma', 'Framer Motion', 'Responsive UX'],
        tools: ['Vite', 'Git/GitHub', 'npm'],
      },
      currentContributions: [
        'Comprehensive UI/UX layout creation',
        'Architectural React component orchestration',
        'State management and component lifecycle design',
        'Real-time asynchronous API integration hooks',
      ],
      responsibilities: [
        {
          en: 'Comprehensive UI/UX layout creation',
          th: 'ออกแบบ Layout และประสบการณ์ผู้ใช้งาน (UI/UX)',
        },
        {
          en: 'Architectural React component orchestration',
          th: 'วางโครงสร้างและจัดการ React Components',
        },
        {
          en: 'State management and component lifecycle design',
          th: 'จัดการ State และออกแบบวงจรการทำงานของ Components',
        },
        {
          en: 'Real-time asynchronous API integration hooks',
          th: 'เชื่อมต่อ API แบบ Asynchronous',
        },
      ],
      previousProject: {
        title: 'E-Commerce Minimalist Dashboard',
        description:
          'A clean analytics dashboard for online store owners, featuring responsive charts, order tracking and a fast, accessible interface.',
        isPlaceholder: true,
      },
      projects: [
        {
          id: 'member-1-project-1',
          title: { en: 'Smart Lab Booking System', th: 'ระบบจองห้องปฏิบัติการอัจฉริยะ' },
          description: {
            en: 'Built a web-based real-time booking system for AIE Laboratory. Integrated camera-based object detection to monitor seat occupancy and booking status in real time. Designed the UX/UI for seamless online reservation.',
            th: 'พัฒนาระบบจองแบบเรียลไทม์บนเว็บสำหรับห้องปฏิบัติการ AIE ผสานการตรวจจับวัตถุจากกล้องเพื่อติดตามการใช้ที่นั่งและสถานะการจองแบบเรียลไทม์ พร้อมออกแบบ UX/UI เพื่อให้จองออนไลน์ได้อย่างราบรื่น',
          },
          technologies: ['UX/UI Design', 'Computer Vision'],
          coverImage: '/images/projects/member-1/smart-lab-booking.png',
          isPlaceholder: false,
          isHighlighted: true,
        },
        {
          id: 'member-1-project-2',
          title: {
            en: 'Wireless Camera Vision & Streaming System',
            th: 'ระบบกล้องไร้สายสำหรับ Computer Vision และสตรีมมิง',
          },
          description: {
            en: 'Engineered a low-latency wireless camera system to stream high-throughput video feeds across a local network, establishing resilient data pipelines for real-time remote monitoring. Optimized video compression and network streaming protocols to maintain stable frame rates, minimize packet loss, and prevent transmission delays under fluctuating bandwidth conditions. Overcame wireless latency constraints by configuring custom frame buffering and integrating multi-threaded frame processing to deliver seamless visual telemetry to external client interfaces.',
            th: 'พัฒนาระบบกล้องไร้สายที่มีความหน่วงต่ำสำหรับสตรีมวิดีโอปริมาณสูงผ่านเครือข่ายภายใน พร้อมวางระบบส่งต่อข้อมูลที่ทนทานเพื่อรองรับการตรวจสอบระยะไกลแบบเรียลไทม์ ปรับแต่งการบีบอัดวิดีโอและโปรโตคอลสตรีมมิงเครือข่ายเพื่อรักษาอัตราเฟรมให้สม่ำเสมอ ลดการสูญหายของแพ็กเก็ต และป้องกันความล่าช้าในการส่งข้อมูลเมื่อแบนด์วิดท์ผันผวน แก้ข้อจำกัดด้านความหน่วงของเครือข่ายไร้สายด้วยการกำหนดค่าบัฟเฟอร์เฟรมแบบเฉพาะและการประมวลผลเฟรมแบบมัลติเธรด เพื่อส่งข้อมูลภาพไปยังอินเทอร์เฟซของไคลเอนต์ภายนอกได้อย่างต่อเนื่อง',
          },
          technologies: ['Python', 'OpenCV', 'RTSP / WebSockets', 'Linux'],
          coverImage: undefined,
          isPlaceholder: false,
        },
        {
          id: 'member-1-project-3',
          title: {
            en: 'Survey-Driven Predictive AI System',
            th: 'ระบบ AI คาดการณ์ผลจากแบบสำรวจ',
          },
          description: {
            en: 'Architected an end-to-end machine learning pipeline that transforms custom web survey data into structured datasets to predict real-world user outcomes. Engineered feature extraction scripts to preprocess, clean, and encode raw survey variables (categorical and numerical), building a reliable ground-truth training dataset. Trained and tuned supervised learning models (XGBoost / Random Forest) to identify complex response patterns, delivering real-time outcome predictions via a REST API endpoint.',
            th: 'ออกแบบกระบวนการ Machine Learning แบบครบวงจรที่แปลงข้อมูลจากแบบสำรวจบนเว็บที่สร้างขึ้นเองให้เป็นชุดข้อมูลที่มีโครงสร้าง เพื่อใช้คาดการณ์ผลลัพธ์ของผู้ใช้ในสถานการณ์จริง พัฒนาสคริปต์สกัดคุณลักษณะเพื่อเตรียม ทำความสะอาด และเข้ารหัสตัวแปรจากแบบสำรวจทั้งแบบหมวดหมู่และตัวเลข จนได้ชุดข้อมูลฝึกสอนที่มีข้อมูลจริงอ้างอิงที่เชื่อถือได้ ฝึกและปรับแต่งโมเดล Supervised Learning (XGBoost / Random Forest) เพื่อค้นหารูปแบบคำตอบที่ซับซ้อน และให้บริการการคาดการณ์ผลแบบเรียลไทม์ผ่าน REST API endpoint',
          },
          technologies: ['Python', 'Scikit-Learn', 'XGBoost', 'Flask / REST API'],
          coverImage: undefined,
          isPlaceholder: false,
        },
      ],
      isPlaceholder: true,
    },
    {
      id: 'member-2',
      roleKey: 'backend',
      fullName: 'Thanakrit Archawabool',
      nickname: 'Phum',
      fullNameI18n: { en: 'Thanakrit Archawabool', th: 'ธนกฤต อาชะวะบูล' },
      nicknameI18n: { en: 'Phum', th: 'ภูมิ' },
      isNameVerified: true,
      roleName: 'Backend Developer & Database Engineer',
      roleNameI18n: {
        en: 'Backend Developer & Database Engineer',
        th: 'นักพัฒนา Backend และวิศวกรฐานข้อมูล',
      },
      introduction: {
        en: 'Placeholder: Add a member-approved short introduction.',
        th: 'ข้อความตัวอย่าง: เพิ่มคำแนะนำตัวสั้น ๆ ที่สมาชิกยืนยันแล้ว',
      },
      biography: {
        en: 'Placeholder: Add the member biography and interests.',
        th: 'ข้อความตัวอย่าง: เพิ่มประวัติและความสนใจของสมาชิก',
      },
      avatar: '/images/projects/member-2/member-2.jpeg',
      mainContribution: {
        en: 'Express API, PostgreSQL and AI context injection',
        th: 'Express API, PostgreSQL และ AI Context Injection',
      },
      highlightSkills: ['Node.js', 'Express', 'PostgreSQL', 'Prompt Engineering', 'Prisma ORM'],
      socialLinks: {
        github: 'https://github.com/phumthanakrit',
        linkedin: 'https://www.linkedin.com/in/thanakrit-archawabool-80aa563b0/',
        portfolio: '',
      },
      themeColor: {
        primary: '#a78bfa',
        secondary: '#ec4899',
        glow: 'rgba(167, 139, 250, 0.35)',
      },
      skills: {
        core: ['Node.js', 'Express', 'PostgreSQL', 'SQL'],
        toolsAndAI: [
          'Postman',
          'Prisma ORM',
          'CORS configuration',
          'OpenAI/Claude API SDK',
          'Prompt Engineering',
        ],
      },
      currentContributions: [
        'Developing secure RESTful APIs via Express',
        'Structuring relational database schemas for chat persistence',
        'Engineering system prompts for the AI assistant',
        'Building context-injection pipelines',
      ],
      responsibilities: [
        {
          en: 'Developing RESTful APIs via Express',
          th: 'พัฒนา RESTful API ด้วย Express',
        },
        {
          en: 'Structuring relational database schemas for chat persistence',
          th: 'ออกแบบโครงสร้างฐานข้อมูลเชิงสัมพันธ์สำหรับจัดเก็บประวัติการสนทนา',
        },
        {
          en: 'Engineering system prompts for the AI assistant',
          th: 'ออกแบบ System Prompts สำหรับ AI Assistant',
        },
        {
          en: 'Building context-injection pipelines',
          th: 'พัฒนากระบวนการส่งข้อมูลบริบทให้ AI',
        },
      ],
      previousProject: {
        title: 'Task Management API Service',
        description:
          'A RESTful service for projects, tasks and teams with JWT authentication, role-based access and a normalized PostgreSQL schema.',
        isPlaceholder: true,
      },
      projects: [
        {
          id: 'member-2-project-1',
          title: {
            en: 'Bangkok University School of Engineering Website',
            th: 'เว็บไซต์คณะวิศวกรรมศาสตร์ มหาวิทยาลัยกรุงเทพ',
          },
          description: {
            en: 'A multilingual website presenting ambassadors, committee members, news, and contact information for the School of Engineering, Bangkok University.',
            th: 'เว็บไซต์หลายภาษาที่นำเสนอข้อมูลแอมบาสเดอร์ คณะกรรมการ ข่าวสาร และช่องทางติดต่อของคณะวิศวกรรมศาสตร์ มหาวิทยาลัยกรุงเทพ',
          },
          technologies: [
            'JavaScript',
            'JSX',
            'HTML',
            'CSS',
            'Next.js',
            'React',
            'Node.js',
            'Cheerio',
            'Docker',
            'Nginx',
            'GitHub Actions',
          ],
          projectType: { en: 'Web', th: 'เว็บ' },
          isHighlighted: true,
          coverImage: '/images/projects/member-2/member-2-project-1.png',
          isPlaceholder: false,
        },
        {
          id: 'member-2-project-2',
          title: {
            en: 'ROS 2 Web Control Interface | 2026',
            th: 'เว็บอินเทอร์เฟซควบคุมระบบ ROS 2 | 2026',
          },
          description: {
            en: '• Developed a web-based interface for controlling a ROS 2 system.',
            th: '• พัฒนาเว็บอินเทอร์เฟซสำหรับควบคุมระบบ ROS 2',
          },
          technologies: ['ROS 2', 'HTML', 'CSS', 'JavaScript'],
          coverImage: undefined,
          isPlaceholder: false,
        },
        {
          id: 'member-2-project-3',
          title: {
            en: 'Calorie-Tracking Application Prototype | 2025',
            th: 'ต้นแบบแอปพลิเคชันติดตามแคลอรี | 2025',
          },
          description: {
            en: '• Created a prototype application for tracking calorie intake.',
            th: '• สร้างต้นแบบแอปพลิเคชันสำหรับติดตามปริมาณแคลอรีที่รับประทาน',
          },
          technologies: [],
          coverImage: undefined,
          isPlaceholder: false,
        },
      ],
      isPlaceholder: true,
    },
    {
      id: 'member-3',
      roleKey: 'devops',
      fullName: 'Thitiyaphorn Makcha-um',
      nickname: 'View',
      fullNameI18n: { en: 'Thitiyaporn Mekcha-um', th: 'ฐิติญาภรณ์ เมฆชะอุ้ม' },
      nicknameI18n: { en: 'View', th: 'วิว' },
      isNameVerified: true,
      roleName: 'DevOps & Full-Stack QA Engineer',
      roleNameI18n: {
        en: 'DevOps & Full-Stack QA Engineer',
        th: 'วิศวกร DevOps และการทดสอบระบบ Full-Stack',
      },
      introduction: {
        en: 'Placeholder: Add a member-approved short introduction.',
        th: 'ข้อความตัวอย่าง: เพิ่มคำแนะนำตัวสั้น ๆ ที่สมาชิกยืนยันแล้ว',
      },
      biography: {
        en: 'Placeholder: Add the member biography and interests.',
        th: 'ข้อความตัวอย่าง: เพิ่มประวัติและความสนใจของสมาชิก',
      },
      avatar: '/images/projects/member-3/member-3.jpg',
      mainContribution: {
        en: 'Docker, CI/CD and automated testing',
        th: 'Docker, CI/CD และ Automated Testing',
      },
      highlightSkills: ['Docker', 'GitHub Actions', 'Jest', 'Nginx', 'Linux Server'],
      socialLinks: { 
        github: 'https://github.com/view-ttyp', 
        linkedin: '', 
        portfolio: '' },
      themeColor: {
        primary: '#34d399',
        secondary: '#f59e0b',
        glow: 'rgba(52, 211, 153, 0.35)',
      },
      skills: {
        core: ['Docker', 'GitHub Actions', 'Linux Server'],
        testing: ['Jest', 'Supertest', 'React Testing Library'],
        webServer: ['Nginx', 'Docker Compose'],
      },
      currentContributions: [
        'Containerizing deployment environments',
        'Orchestrating automated CI/CD workflows',
        'Designing and executing core component integration and unit tests',
      ],
      responsibilities: [
        {
          en: 'Containerizing deployment environments',
          th: 'จัดเตรียมสภาพแวดล้อมสำหรับ Deployment ด้วย Container',
        },
        {
          en: 'Orchestrating automated CI/CD workflows',
          th: 'จัดการ Workflow สำหรับ CI/CD อัตโนมัติ',
        },
        {
          en: 'Designing and executing integration and unit tests',
          th: 'ออกแบบและดำเนินการทดสอบ Integration Tests และ Unit Tests',
        },
      ],
      previousProject: {
        title: 'Automated Cloud Deployment Script',
        description:
          'A scripted pipeline that provisions a Linux server, builds Docker images and performs zero-downtime releases behind Nginx.',
        isPlaceholder: true,
      },
      projects: [
        {
          id: 'member-3-project-1',
          title: { en: 'Engineering Open House', th: 'งาน Open House คณะวิศวกรรมศาสตร์' },
          description: {
            en: 'Staff member at the Pixie Box booth in 2024 and the KUKA booth in 2026.',
            th: 'เป็นสตาฟบูธ Pixie Box ในปี 2024 และบูธ KUKA ในปี 2026',
          },
          technologies: [],
          coverImage: undefined,
          isPlaceholder: false,
        },
        {
          id: 'member-3-project-2',
          title: { en: 'Robot Realm', th: 'Robot Realm' },
          description: {
            en: 'Organized a robotic arm booth at Robot Realm at Zeer Rangsit.',
            th: 'จัดบูธแขนกลหุ่นยนต์ในงาน Robot Realm ณ เซียร์รังสิต',
          },
          technologies: [],
          coverImage: undefined,
          isPlaceholder: false,
        },
        {
          id: 'member-3-project-3',
          title: { en: 'EPE Packaging AI Training', th: 'การอบรม AI สำหรับ EPE Packaging' },
          description: {
            en: 'Staff member for AI training for EPE Packaging employees.',
            th: 'เป็นสตาฟในการอบรมเกี่ยวกับ AI ให้กับบุคลากรของบริษัท EPE Packaging',
          },
          technologies: [],
          coverImage: undefined,
          isPlaceholder: false,
        },
      ],
      isPlaceholder: true,
    },
  ],

  teamProjects: [
    {
      id: 'chat-ai-with-group-portfolio',
      title: {
        en: 'Chat AI with Group Portfolio',
        th: 'แชต AI พร้อม Portfolio ของกลุ่ม',
      },
      description: {
        en: 'A team portfolio website where visitors ask an AI about our members, skills and projects in real time. React frontend, Express API, PostgreSQL chat history and Google Gemini, in Thai and English.',
        th: 'เว็บ Portfolio ของทีมที่ให้ผู้เข้าชมถาม AI เกี่ยวกับสมาชิก ทักษะ และผลงานได้แบบเรียลไทม์ ใช้ React, Express API, PostgreSQL เก็บประวัติแชต และ Google Gemini รองรับไทย/อังกฤษ',
      },
      projectType: {
        en: 'Web Application',
        th: 'เว็บแอปพลิเคชัน',
      },
      coverImage: '/images/projects/kuai.png',
      technologies: [
        'React',
        'TypeScript',
        'Express',
        'PostgreSQL',
        'Gemini API',
        'Tailwind CSS',
        'Vite',
        'Vitest',
      ],
      features: [
        {
          en: 'Bilingual-ready team portfolio architecture',
          th: 'โครงสร้าง Portfolio ที่เตรียมรองรับภาษาไทยและภาษาอังกฤษ',
        },
        {
          en: 'Interactive chat interface with loading and error states',
          th: 'หน้าสนทนาแบบโต้ตอบ พร้อมสถานะ Loading และ Error',
        },
        {
          en: 'Automated frontend tests and GitHub Actions CI',
          th: 'Automated Tests สำหรับ Frontend และ CI ด้วย GitHub Actions',
        },
      ],
      contributors: ['member-1', 'member-2', 'member-3'],
      status: 'in-progress',
      isFeatured: true,
      isPlaceholder: false,
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Builds a bilingual text context for a future backend context-injection step.
 * Placeholder group/member/personal-project data is deliberately excluded so
 * the AI cannot present fictional sample profiles as facts.
 */
export const buildPortfolioContext = (
  data: PortfolioData = portfolioData,
): string => {
  const lines: string[] = [
    'TEAM PORTFOLIO KNOWLEDGE',
    'The visitor may speak Thai or English. Detect the language of the latest user message and respond in that same language.',
    'Do not invent member identities, ages, skills, experience, links, or project claims.',
    `Team size: exactly ${data.members.length} members.`,
  ];

  if (!data.group.isPlaceholder || data.group.isNameVerified) {
    lines.push(`Group name: ${data.group.teamName}`);
  }
  if (data.group.appName) lines.push(`App and project name: ${data.group.appName}`);
  if (data.group.appFullName) lines.push(`App full name: ${data.group.appFullName}`);
  if (data.group.websiteTitle) lines.push(`Website title: ${data.group.websiteTitle}`);
  if (data.group.logoConcept) {
    lines.push(`Logo concept (EN): ${data.group.logoConcept.en}`);
    lines.push(`Logo concept (TH): ${data.group.logoConcept.th}`);
  }

  if (data.group.isPlaceholder) {
    const unverifiedFields = [
      ...(!data.group.isNameVerified ? ['team name'] : []),
      ...(!data.group.isIntroductionVerified ? ['introduction'] : []),
      ...(!data.group.isVisionVerified ? ['vision'] : []),
      'tagline', 'strengths', 'contact',
    ];
    lines.push(
      `Team profile: NOT YET VERIFIED. The current ${unverifiedFields.join(', ')} values are placeholders. Do not present them as verified facts.`,
    );
    if (data.group.isIntroductionVerified) {
      lines.push(`Introduction (EN): ${data.group.introductionLead?.en || ''} ${data.group.introduction.en}`.trim());
      lines.push(`Introduction (TH): ${data.group.introductionLead?.th || ''} ${data.group.introduction.th}`.trim());
    }
    if (data.group.isVisionVerified) {
      lines.push(`Vision (EN): ${data.group.visionLead?.en || ''} ${data.group.vision.en}`.trim());
      lines.push(`Vision (TH): ${data.group.visionLead?.th || ''} ${data.group.vision.th}`.trim());
    }
  } else {
    lines.push(`Team name (EN): ${data.group.teamNameI18n.en || data.group.teamName}`);
    lines.push(`Team name (TH): ${data.group.teamNameI18n.th || data.group.teamName}`);
    lines.push(`Tagline (EN): ${data.group.taglineI18n.en || data.group.tagline}`);
    lines.push(`Tagline (TH): ${data.group.taglineI18n.th || data.group.tagline}`);
    lines.push(`Introduction (EN): ${data.group.introduction.en || 'Not provided'}`);
    lines.push(`Introduction (TH): ${data.group.introduction.th || 'ยังไม่มีข้อมูล'}`);
    lines.push(`Vision (EN): ${data.group.vision.en || 'Not provided'}`);
    lines.push(`Vision (TH): ${data.group.vision.th || 'ยังไม่มีข้อมูล'}`);
    lines.push(
      `Core strengths: ${data.group.coreStrengthsI18n
        .map((item) => `${item.en || 'Not provided'} / ${item.th || 'ยังไม่มีข้อมูล'}`)
        .join('; ')}`,
    );
  }

  lines.push('', 'VERIFIED TEAM PROJECTS:');
  const verifiedTeamProjects = data.teamProjects.filter(
    (project) => !project.isPlaceholder,
  );

  if (verifiedTeamProjects.length === 0) {
    lines.push('No verified team projects have been provided yet.');
  } else {
    for (const project of verifiedTeamProjects) {
      lines.push(`- ${project.title.en} / ${project.title.th}`);
      lines.push(`  Description (EN): ${project.description.en || 'Not provided'}`);
      lines.push(`  Description (TH): ${project.description.th || 'ยังไม่มีข้อมูล'}`);
      lines.push(`  Status: ${project.status}`);
      lines.push(`  Technologies: ${project.technologies.join(', ') || 'Not provided'}`);
      if (project.features?.length) {
        lines.push(
          `  Features: ${project.features
            .map((feature) => `${feature.en} / ${feature.th}`)
            .join('; ')}`,
        );
      }
    }
  }

  lines.push('', 'TEAM MEMBERS:');
  for (const member of data.members) {
    const hasVerifiedName =
      !member.isPlaceholder || member.isNameVerified === true;
    const memberLabel = hasVerifiedName
      ? `${member.fullName} (${member.nickname})`
      : `${member.id} (name not verified)`;

    lines.push(`- ${memberLabel}`);
    lines.push(`  Member ID: ${member.id}`);

    if (hasVerifiedName && member.fullNameI18n?.th.trim()) {
      lines.push(`  Name (TH): ${member.fullNameI18n.th.trim()}`);
    }
    if (hasVerifiedName && member.nicknameI18n?.th.trim()) {
      lines.push(`  Nickname (TH): ${member.nicknameI18n.th.trim()}`);
    }

    if (member.age !== undefined) {
      lines.push(`  Age: ${member.age}`);
    }

    if (!hasVerifiedName) {
      lines.push(
        '  Role, biography, skills, responsibilities, and social links are not verified. Do not present them as facts.',
      );
    } else {
      // Introduction and biography may still hold "Placeholder:" sample text; never send that to the AI.
      const realText = (value: string, fallback: string): string =>
        value.trim() && !/^(placeholder|ข้อความตัวอย่าง)/i.test(value.trim())
          ? value.trim()
          : fallback;

      lines.push(`  Role (EN): ${member.roleNameI18n.en || member.roleName}`);
      lines.push(`  Role (TH): ${member.roleNameI18n.th || member.roleName}`);
      lines.push(`  Introduction (EN): ${realText(member.introduction.en, 'Not provided')}`);
      lines.push(`  Introduction (TH): ${realText(member.introduction.th, 'ยังไม่มีข้อมูล')}`);
      lines.push(`  Biography (EN): ${realText(member.biography.en, 'Not provided')}`);
      lines.push(`  Biography (TH): ${realText(member.biography.th, 'ยังไม่มีข้อมูล')}`);
      const links = Object.entries(member.socialLinks)
        .filter(([, url]) => typeof url === 'string' && /^https?:\/\//.test(url))
        .map(([name, url]) => `${name}: ${url}`);
      if (links.length > 0) {
        lines.push(`  Links: ${links.join(', ')}`);
      }

      const skills = [
        ...member.skills.core,
        ...(member.roleKey === 'frontend'
          ? [...member.skills.designAndAnimation, ...member.skills.tools]
          : member.roleKey === 'backend'
            ? member.skills.toolsAndAI
            : [...member.skills.testing, ...member.skills.webServer]),
      ];
      lines.push(`  Skills: ${skills.join(', ')}`);
      lines.push(
        `  Responsibilities: ${member.responsibilities
          .map((item) => `${item.en} / ${item.th}`)
          .join('; ')}`,
      );
    }

    const verifiedPersonalProjects = member.projects.filter(
      (project) =>
        !project.isPlaceholder &&
        Boolean(project.title.en.trim() || project.title.th.trim()),
    );
    if (verifiedPersonalProjects.length === 0) {
      lines.push(`  Verified individual projects for ${memberLabel}: None provided yet.`);
    } else {
      for (const project of verifiedPersonalProjects) {
        lines.push(`  Individual project: ${project.title.en} / ${project.title.th}`);
        lines.push(`    Description (EN): ${project.description.en || 'Not provided'}`);
        lines.push(`    Description (TH): ${project.description.th || 'ยังไม่มีข้อมูล'}`);
        lines.push(`    Technologies: ${project.technologies.join(', ')}`);
      }
    }
  }

  if (data.group.contact.isPlaceholder) {
    lines.push('', 'CONTACT: Team contact details are not verified. Do not share the sample contact values.');
  } else {
    lines.push('', `Team email: ${data.group.contact.teamEmail || 'Not provided'}`);
    lines.push(`Team GitHub: ${data.group.contact.githubUrl || 'Not provided'}`);
    if (data.group.contact.linkedinUrl) {
      lines.push(`Team LinkedIn: ${data.group.contact.linkedinUrl}`);
    }
    if (data.group.contact.websiteUrl) {
      lines.push(`Team website: ${data.group.contact.websiteUrl}`);
    }
  }

  return lines.join('\n');
};
