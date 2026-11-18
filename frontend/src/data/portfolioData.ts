/**
 * src/data/portfolioData.ts
 * Shared portfolio types and display helpers for the frontend.
 *
 * Architecture decisions:
 * - Exactly 3 team members (fixed tuple).
 * - Unlimited individual and team projects (readonly arrays).
 * - Local image paths under frontend/public/images/.
 * - All visitor-facing copy supports English and Thai.
 * - Portfolio data is loaded from the backend API.
 *
 * Backward compatibility:
 * - Existing fields used by current components are retained while the UI is
 *   migrated section by section.
 */

import { createContext, useContext } from 'react';

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

export const PortfolioDataContext = createContext<PortfolioData | null>(null);

export const usePortfolioData = (): PortfolioData => {
  const data = useContext(PortfolioDataContext);
  if (!data) throw new Error('Portfolio data is not available.');
  return data;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Returns the requested language when available, otherwise falls back to the
 * other language. Returns an empty string when neither language has content.
 */
export const getLocalizedText = (
  value: LocalizedText,
  language: Language,
): string => {
  const preferred = value[language].trim();
  if (preferred) return preferred;

  const fallbackLanguage: Language = language === 'en' ? 'th' : 'en';
  return value[fallbackLanguage].trim();
};

