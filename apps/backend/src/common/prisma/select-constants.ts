/**
 * Shared Prisma select constants to avoid duplication across repositories.
 * Use these when you need to select specific fields consistently.
 */

/**
 * Basic job seeker fields for listing/references
 */
export const JOB_SEEKER_BASIC_SELECT = {
  id: true,
  userId: true,
  fullName: true,
} as const;

/**
 * Full job seeker profile fields
 */
export const JOB_SEEKER_PROFILE_SELECT = {
  id: true,
  fullName: true,
  portfolioUrl: true,
  experienceSummary: true,
} as const;

/**
 * Basic company fields for listing/references
 */
export const COMPANY_BASIC_SELECT = {
  id: true,
  userId: true,
  companyName: true,
} as const;

/**
 * Full company profile fields
 */
export const COMPANY_PROFILE_SELECT = {
  id: true,
  companyName: true,
  websiteUrl: true,
  description: true,
} as const;

/**
 * User basic fields for messages/references
 */
export const USER_BASIC_SELECT = {
  id: true,
  email: true,
  role: true,
} as const;

/**
 * Vacancy basic fields for listing
 */
export const VACANCY_BASIC_SELECT = {
  id: true,
  title: true,
  salaryRange: true,
  role: true,
  jobDescription: true,
  createdAt: true,
} as const;
