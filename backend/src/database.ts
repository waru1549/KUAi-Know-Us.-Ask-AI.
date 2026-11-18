import 'dotenv/config'

import { Pool, type QueryResultRow } from 'pg'
import {
  portfolioData,
  type IndividualProject,
  type LocalizedText,
  type Member,
  type MemberId,
  type PortfolioData,
  type TeamProject,
} from './portfolioData.ts'

const databaseUrl = process.env.DATABASE_URL?.trim()

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required.')
}

export const pool = new Pool({
  connectionString: databaseUrl,
})

interface ConversationMessageRow extends QueryResultRow {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: Date
}

interface TeamInfoRow extends QueryResultRow {
  team_name: string
  tagline: string | null
  description: string
  team_projects: unknown
  contact_info: unknown
}

interface TeamMemberRow extends QueryResultRow {
  slug: string
  full_name: string
  role: string
  skills: string[] | null
  projects: unknown
  bio: string | null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function readText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function readStringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : null
}

function readLocalizedText(value: unknown): LocalizedText | null {
  const record = asRecord(value)
  if (!record || typeof record.en !== 'string' || typeof record.th !== 'string') {
    return null
  }
  return { en: record.en, th: record.th }
}

function readLocalizedArray(value: unknown): LocalizedText[] | null {
  if (!Array.isArray(value)) return null
  const items = value.map(readLocalizedText)
  return items.every((item) => item !== null)
    ? items as LocalizedText[]
    : null
}

function readDescriptionSection(
  description: string,
  section: 'Introduction' | 'Vision',
  fallback: LocalizedText,
): { value: LocalizedText; found: boolean } {
  const lines = description.split(/\r?\n/)
  const englishPrefix = `${section} (EN):`
  const thaiPrefix = `${section} (TH):`
  const englishLine = lines.find((line) => line.startsWith(englishPrefix))
  const thaiLine = lines.find((line) => line.startsWith(thaiPrefix))
  const english = englishLine?.slice(englishPrefix.length).trim()
  const thai = thaiLine?.slice(thaiPrefix.length).trim()

  if (english || thai) {
    return {
      value: { en: english || fallback.en, th: thai || fallback.th },
      found: true,
    }
  }

  if (section === 'Introduction' && description.trim()) {
    return {
      value: { en: description.trim(), th: description.trim() },
      found: true,
    }
  }

  return { value: fallback, found: false }
}

function isMemberId(value: string): value is MemberId {
  return portfolioData.members.some((member) => member.id === value)
}

function readMemberIds(value: unknown): MemberId[] | null {
  const values = readStringArray(value)
  return values?.every(isMemberId) ? values : null
}

function mapIndividualProjects(
  value: unknown,
  fallback: readonly IndividualProject[],
): readonly IndividualProject[] {
  if (!Array.isArray(value)) return fallback

  return value.flatMap((item): IndividualProject[] => {
    const record = asRecord(item)
    const id = readText(record?.id)
    const title = readLocalizedText(record?.title)
    const description = readLocalizedText(record?.description)
    if (!id || !title || !description || !title.en.trim() && !title.th.trim()) {
      return []
    }

    const project: IndividualProject = {
      id,
      title,
      description,
      technologies: readStringArray(record?.technologies) ?? [],
      isPlaceholder: false,
      ...(readLocalizedText(record?.projectType)
        ? { projectType: readLocalizedText(record?.projectType) ?? undefined }
        : {}),
      ...(typeof record?.year === 'number' ? { year: record.year } : {}),
      ...(readLocalizedText(record?.role)
        ? { role: readLocalizedText(record?.role) ?? undefined }
        : {}),
      ...(readLocalizedArray(record?.responsibilities)
        ? { responsibilities: readLocalizedArray(record?.responsibilities) ?? undefined }
        : {}),
      ...(readLocalizedArray(record?.features)
        ? { features: readLocalizedArray(record?.features) ?? undefined }
        : {}),
      ...(readLocalizedText(record?.result)
        ? { result: readLocalizedText(record?.result) ?? undefined }
        : {}),
      ...(readText(record?.coverImage)
        ? { coverImage: readText(record?.coverImage) ?? undefined }
        : {}),
      ...(readStringArray(record?.gallery)
        ? { gallery: readStringArray(record?.gallery) ?? undefined }
        : {}),
      ...(readText(record?.repositoryUrl)
        ? { repositoryUrl: readText(record?.repositoryUrl) ?? undefined }
        : {}),
      ...(readText(record?.demoUrl)
        ? { demoUrl: readText(record?.demoUrl) ?? undefined }
        : {}),
    }

    return [project]
  })
}

function mapTeamProject(
  value: unknown,
  fallback?: TeamProject,
): TeamProject | null {
  const record = asRecord(value)
  if (!record) return null

  const id = readText(record.id) ?? fallback?.id
  const title = readLocalizedText(record.title) ?? fallback?.title
  const description = readLocalizedText(record.description) ?? fallback?.description
  const technologies = readStringArray(record.technologies) ?? fallback?.technologies
  const contributors = readMemberIds(record.contributors) ?? fallback?.contributors
  const statusValue = record.status
  const status = statusValue === 'planned' || statusValue === 'in-progress' || statusValue === 'completed'
    ? statusValue
    : fallback?.status
  const isFeatured = typeof record.isFeatured === 'boolean'
    ? record.isFeatured
    : fallback?.isFeatured

  if (
    !id || !title || !description || !technologies || !contributors ||
    !status || isFeatured === undefined
  ) {
    return null
  }

  return {
    ...(fallback ?? {} as TeamProject),
    id,
    title,
    description,
    technologies,
    contributors,
    status,
    isFeatured,
    isPlaceholder: false,
    ...(readLocalizedText(record.projectType)
      ? { projectType: readLocalizedText(record.projectType) ?? undefined }
      : {}),
    ...(typeof record.year === 'number' ? { year: record.year } : {}),
    ...(readLocalizedText(record.role)
      ? { role: readLocalizedText(record.role) ?? undefined }
      : {}),
    ...(readLocalizedArray(record.responsibilities)
      ? { responsibilities: readLocalizedArray(record.responsibilities) ?? undefined }
      : {}),
    ...(readLocalizedArray(record.features)
      ? { features: readLocalizedArray(record.features) ?? undefined }
      : {}),
    ...(readLocalizedText(record.result)
      ? { result: readLocalizedText(record.result) ?? undefined }
      : {}),
    ...(readText(record.coverImage)
      ? { coverImage: readText(record.coverImage) ?? undefined }
      : {}),
    ...(readStringArray(record.gallery)
      ? { gallery: readStringArray(record.gallery) ?? undefined }
      : {}),
    ...(readText(record.repositoryUrl)
      ? { repositoryUrl: readText(record.repositoryUrl) ?? undefined }
      : {}),
    ...(readText(record.demoUrl)
      ? { demoUrl: readText(record.demoUrl) ?? undefined }
      : {}),
  }
}

function mapTeamProjects(
  value: unknown,
  fallback: readonly TeamProject[],
): readonly TeamProject[] {
  if (!Array.isArray(value)) return fallback

  return value.flatMap((item, index) => {
    const record = asRecord(item)
    if (!record) return []
    const id = readText(record.id)
    const base = (id ? fallback.find((project) => project.id === id) : undefined) ?? fallback[index]
    const project = mapTeamProject(record, base)
    return project ? [project] : []
  })
}

function mapDatabaseMember(row: TeamMemberRow, fallback: Member): Member {
  const fullName = readText(row.full_name) ?? fallback.fullName
  const localizedName = fullName === fallback.fullName
    ? fallback.fullNameI18n
    : { en: fullName, th: fullName }
  const role = readText(row.role) ?? ''
  const roleIsVerified = Boolean(
    role && !['ยังไม่ยืนยัน', 'not verified', 'unverified'].includes(role.toLowerCase()),
  )
  const roleName = roleIsVerified ? role : fallback.roleName
  const localizedRole = roleName === fallback.roleName
    ? fallback.roleNameI18n
    : { en: roleName, th: roleName }
  const skills = roleIsVerified ? row.skills ?? [] : []
  const bio = roleIsVerified ? readText(row.bio) ?? '' : ''
  const localizedBio = { en: bio, th: bio }
  const common = {
    ...fallback,
    fullName,
    fullNameI18n: localizedName,
    roleName,
    roleNameI18n: localizedRole,
    introduction: localizedBio,
    biography: localizedBio,
    avatar: undefined,
    socialLinks: {},
    currentContributions: [],
    responsibilities: [],
    projects: mapIndividualProjects(row.projects, fallback.projects),
    isPlaceholder: !roleIsVerified,
  }

  switch (fallback.roleKey) {
    case 'frontend':
      return {
        ...common,
        roleKey: 'frontend',
        skills: { core: skills, designAndAnimation: [], tools: [] },
      }
    case 'backend':
      return {
        ...common,
        roleKey: 'backend',
        skills: { core: skills, toolsAndAI: [] },
      }
    case 'devops':
      return {
        ...common,
        roleKey: 'devops',
        skills: { core: skills, testing: [], webServer: [] },
      }
  }
}

function mapDatabaseGroup(row: TeamInfoRow): PortfolioData['group'] {
  const fallback = portfolioData.group
  const teamName = readText(row.team_name) ?? fallback.teamName
  const tagline = readText(row.tagline) ?? fallback.tagline
  const introduction = readDescriptionSection(row.description, 'Introduction', fallback.introduction)
  const vision = readDescriptionSection(row.description, 'Vision', fallback.vision)
  const contactInfo = asRecord(row.contact_info) ?? {}
  const githubUrl = readText(contactInfo.githubUrl) ?? ''
  const teamEmail = readText(contactInfo.teamEmail) ?? ''
  const linkedinUrl = readText(contactInfo.linkedinUrl) ?? undefined
  const websiteUrl = readText(contactInfo.websiteUrl) ?? undefined

  return {
    ...fallback,
    teamName,
    teamNameI18n: teamName === fallback.teamName
      ? fallback.teamNameI18n
      : { en: teamName, th: teamName },
    isNameVerified: true,
    tagline,
    taglineI18n: tagline === fallback.tagline
      ? fallback.taglineI18n
      : { en: tagline, th: tagline },
    introduction: introduction.value,
    isIntroductionVerified: introduction.found || fallback.isIntroductionVerified,
    vision: vision.value,
    isVisionVerified: vision.found || fallback.isVisionVerified,
    contact: {
      ...fallback.contact,
      githubUrl,
      teamEmail,
      linkedinUrl,
      websiteUrl,
      isPlaceholder: !githubUrl && !teamEmail && !linkedinUrl && !websiteUrl,
    },
  }
}

export interface StoredChatMessage {
  readonly id: string
  readonly role: 'user' | 'assistant'
  readonly content: string
  readonly createdAt: string
}

export async function getConversationMessages(
  conversationId: string,
  limit?: number,
): Promise<StoredChatMessage[]> {
  const result = limit === undefined
    ? await pool.query<ConversationMessageRow>(`
        SELECT id::text AS id,
          CASE WHEN sender = 'ai' THEN 'assistant' ELSE 'user' END AS role,
          message AS content,
          created_at
        FROM public.chat_messages
        WHERE session_id = $1
        ORDER BY created_at ASC, id ASC
      `, [conversationId])
    : await pool.query<ConversationMessageRow>(`
        SELECT id::text AS id,
          CASE WHEN sender = 'ai' THEN 'assistant' ELSE 'user' END AS role,
          message AS content,
          created_at
        FROM (
          SELECT id, sender, message, created_at
          FROM public.chat_messages
          WHERE session_id = $1
          ORDER BY created_at DESC, id DESC
          LIMIT $2
        ) AS recent_messages
        ORDER BY created_at ASC, id ASC
      `, [conversationId, limit])

  return result.rows.map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at.toISOString(),
  }))
}

export async function saveConversationTurn(
  conversationId: string,
  userMessage: string,
  assistantMessage: string,
  maxMessages: number,
): Promise<void> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await client.query(`
      INSERT INTO public.chat_messages (session_id, sender, message)
      VALUES ($1, 'user', $2), ($1, 'ai', $3)
    `, [conversationId, userMessage, assistantMessage])
    await client.query(`
      DELETE FROM public.chat_messages
      WHERE session_id = $1
        AND id NOT IN (
          SELECT id
          FROM public.chat_messages
          WHERE session_id = $1
          ORDER BY created_at DESC, id DESC
          LIMIT $2
        )
    `, [conversationId, maxMessages])
    await client.query('COMMIT')
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch (rollbackError) {
      throw new AggregateError(
        [error, rollbackError],
        'Failed to save conversation and roll back its transaction.',
      )
    }
    throw error
  } finally {
    client.release()
  }
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM public.chat_messages WHERE session_id = $1 RETURNING id',
    [conversationId],
  )
  return result.rows.length > 0
}

export async function getDatabasePortfolioContext(): Promise<string> {
  const [teamResult, memberResult] = await Promise.all([
    pool.query<TeamInfoRow>(`
      SELECT team_name, tagline, description, team_projects, contact_info
      FROM public.team_info
      ORDER BY updated_at DESC, id DESC
      LIMIT 1
    `),
    pool.query<TeamMemberRow>(`
      SELECT slug, full_name, role, skills, projects, bio
      FROM public.team_members
      ORDER BY slug ASC
    `),
  ])

  const sections: string[] = []
  const team = teamResult.rows[0]

  if (team) {
    sections.push(
      'TEAM PROFILE:',
      `Team name: ${team.team_name}`,
      `Tagline: ${team.tagline || 'Not provided'}`,
      `Description: ${team.description}`,
      `Team projects: ${JSON.stringify(team.team_projects ?? [])}`,
      `Contact information: ${JSON.stringify(team.contact_info ?? {})}`,
    )
  }

  if (memberResult.rows.length > 0) {
    sections.push('TEAM MEMBERS:')
    for (const member of memberResult.rows) {
      sections.push(
        `- ${member.full_name} (${member.slug})`,
        `  Role: ${member.role}`,
        `  Skills: ${(member.skills ?? []).join(', ') || 'Not provided'}`,
        `  Biography: ${member.bio || 'Not provided'}`,
        `  Projects: ${JSON.stringify(member.projects ?? [])}`,
      )
    }
  }

  return sections.join('\n')
}

export async function getDatabasePortfolioData(): Promise<PortfolioData> {
  const [teamResult, memberResult] = await Promise.all([
    pool.query<TeamInfoRow>(`
      SELECT team_name, tagline, description, team_projects, contact_info
      FROM public.team_info
      ORDER BY updated_at DESC, id DESC
      LIMIT 1
    `),
    pool.query<TeamMemberRow>(`
      SELECT slug, full_name, role, skills, projects, bio
      FROM public.team_members
      ORDER BY slug ASC
    `),
  ])

  const team = teamResult.rows[0]
  const membersBySlug = new Map(
    memberResult.rows.map((member) => [member.slug, member]),
  )
  const mapMember = (member: Member): Member => {
    const databaseMember = membersBySlug.get(member.id)
    return databaseMember
      ? mapDatabaseMember(databaseMember, member)
      : member
  }
  const members: PortfolioData['members'] = [
    mapMember(portfolioData.members[0]),
    mapMember(portfolioData.members[1]),
    mapMember(portfolioData.members[2]),
  ]

  return {
    ...portfolioData,
    group: team ? mapDatabaseGroup(team) : portfolioData.group,
    members,
    teamProjects: team
      ? mapTeamProjects(team.team_projects, portfolioData.teamProjects)
      : portfolioData.teamProjects,
  }
}

export async function initializeDatabase(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.chat_messages (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      sender VARCHAR(50) NOT NULL CHECK (sender IN ('user', 'ai')),
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id
      ON public.chat_messages (session_id, created_at ASC, id ASC);

    CREATE TABLE IF NOT EXISTS public.team_info (
      id SERIAL PRIMARY KEY,
      team_name VARCHAR(255) NOT NULL,
      tagline TEXT,
      description TEXT NOT NULL,
      team_projects JSONB NOT NULL DEFAULT '[]'::jsonb,
      contact_info JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.team_members (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      skills TEXT[] NOT NULL DEFAULT '{}',
      projects JSONB NOT NULL DEFAULT '[]'::jsonb,
      bio TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.team_info ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

    REVOKE ALL ON TABLE public.chat_messages, public.team_info, public.team_members
      FROM anon, authenticated;
    REVOKE ALL ON SEQUENCE public.chat_messages_id_seq, public.team_info_id_seq, public.team_members_id_seq
      FROM anon, authenticated;
  `)
}