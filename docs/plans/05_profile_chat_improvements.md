# Feature Plan: Profile & Chat Improvements

## Overview

Enhance the company profile to display vacancies in a tabbed interface, and improve the chat view to show the related vacancy information.

---

## Company Profile - Vacancies Tab

### Tab Structure

| Tab | Content |
|-----|---------|
| About | Company info (name, description, website, etc.) |
| Vacancies | List of company's job postings |

### About Tab (Existing Content)
- Company name
- Website URL
- Description
- Any other existing profile fields

### Vacancies Tab
- List of all vacancies posted by this company
- Each vacancy shown as a card with:
  - Title
  - Role
  - Salary range
  - Posted date
  - Brief description (truncated)
- Click vacancy card → Navigate to vacancy detail page
- No direct "Apply" button (must go to vacancy page to apply)

### Empty State
If company has no vacancies:
```
No open positions

This company hasn't posted any vacancies yet.
Check back later for new opportunities.
```

### Who Can See Vacancies Tab
- Job seekers viewing any company profile
- Companies viewing their own profile
- Companies viewing other company profiles (competitor research)
- Public (if profiles are public - depends on existing auth)

---

## Chat View - Vacancy Information

### Chat Header Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Avatar] Alice Johnson                    [⋮] [▼ Expand]   │
│           Senior Frontend Developer at TechCorp             │
├─────────────────────────────────────────────────────────────┤
│  ▼ Vacancy Details (expandable section)                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Title: Senior Frontend Developer                        ││
│  │ Salary: $120k - $150k                                   ││
│  │ Role: Frontend                                          ││
│  │                                                         ││
│  │ Description:                                            ││
│  │ We are looking for a Senior Frontend Developer to       ││
│  │ join our product team. You will be responsible for...   ││
│  │ [View Full Vacancy →]                                   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
│                                                             │
│  [Chat messages area...]                                    │
│                                                             │
```

### Header Elements (Always Visible)

| Element | Description | Clickable? |
|---------|-------------|------------|
| Avatar | Other party's avatar/initials | Yes → Profile |
| Name | Other party's name | Yes → Profile |
| Vacancy Title | "Senior Frontend Developer at TechCorp" | Yes → Vacancy page |
| Menu (⋮) | Three-dot settings menu | Yes → Opens menu |
| Expand (▼) | Toggle vacancy details | Yes → Expands/collapses |

### Expanded Vacancy Section

**Content (full details):**
- Title
- Salary Range
- Role/Category
- Full Job Description
- "View Full Vacancy" link to vacancy page

**Default state:** Collapsed (shows just header)
**Toggle:** Click expand arrow to show/hide
**Persistence:** Remember expand state in session (optional)

### Different Views

**Job Seeker sees:**
- Company name/avatar (clickable → company profile)
- Vacancy title (clickable → vacancy page)
- Vacancy details when expanded

**Company sees:**
- Job seeker name/avatar (clickable → job seeker profile)
- Their own vacancy title (clickable → vacancy page)
- Vacancy details when expanded

---

## UI Components

### Company Profile
- `CompanyProfileTabs` - Tab container (About / Vacancies)
- `CompanyAboutTab` - Existing profile info content
- `CompanyVacanciesTab` - List of vacancy cards
- `VacancyCard` - Individual vacancy preview card (reusable)

### Chat Header
- `ChatHeader` - Updated header component
- `ChatPartyInfo` - Name + avatar (clickable)
- `ChatVacancyBadge` - Vacancy title display
- `ExpandableVacancyDetails` - Collapsible vacancy info section

---

## API Changes

### Company Profile with Vacancies
Update existing company profile endpoint or create new:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/companies/:id` | Get company profile (already exists) |
| GET | `/companies/:id/vacancies` | Get company's vacancies (may exist) |

Or include vacancies in company profile response:
```json
{
  "id": 1,
  "companyName": "TechCorp",
  "description": "...",
  "websiteUrl": "...",
  "vacancies": [
    { "id": 1, "title": "...", "salary": "...", ... },
    { "id": 2, "title": "...", "salary": "...", ... }
  ]
}
```

### Chat/Application Details
Ensure application endpoint returns vacancy details:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/applications/:id` | Should include full vacancy object |

```json
{
  "id": 1,
  "status": "ACCEPTED",
  "vacancy": {
    "id": 1,
    "title": "Senior Frontend Developer",
    "salaryRange": "$120k - $150k",
    "role": "Frontend",
    "jobDescription": "Full description...",
    "company": {
      "id": 1,
      "companyName": "TechCorp"
    }
  },
  "jobSeeker": {
    "id": 1,
    "fullName": "Alice Johnson",
    "userId": "..."
  }
}
```

---

## Implementation Order

1. Update company profile API to include vacancies
2. Build tab components for company profile
3. Build VacancyCard component (reusable)
4. Implement CompanyVacanciesTab
5. Update application/messages API to include full vacancy
6. Build ExpandableVacancyDetails component
7. Update ChatHeader with new elements
8. Add click handlers for name/vacancy links
9. Test all navigation paths

---

## File Structure

```
apps/frontend/
├── app/
│   └── profiles/
│       └── company/
│           └── [id]/
│               └── page.tsx (update with tabs)
├── components/
│   ├── profiles/
│   │   ├── CompanyProfileTabs.tsx
│   │   ├── CompanyAboutTab.tsx
│   │   └── CompanyVacanciesTab.tsx
│   ├── vacancies/
│   │   └── VacancyCard.tsx
│   └── messages/
│       ├── ChatHeader.tsx (update)
│       └── ExpandableVacancyDetails.tsx

apps/backend/
├── src/
│   └── companies/
│       ├── companies.controller.ts (update)
│       └── companies.service.ts (update)
```

---

## Navigation Paths

### From Company Profile
- Click vacancy card → `/vacancies/:id`
- Click "About" tab → Shows company info
- Click "Vacancies" tab → Shows vacancy list

### From Chat
- Click other party name → `/profiles/[type]/:id`
- Click vacancy title → `/vacancies/:id`
- Click "View Full Vacancy" → `/vacancies/:id`

---

## Mobile Considerations

### Company Profile Tabs
- Tabs should be horizontally scrollable or stacked
- Vacancy cards full-width on mobile

### Chat Header
- Expandable section should work well on mobile
- Consider making it a bottom sheet on mobile (optional enhancement)
- Vacancy title may truncate on small screens

---

## Notes

- Company vacancies should only show active/open positions (not closed ones)
- Chat header shows vacancy even if vacancy is later closed/deleted (reference only)
- If vacancy is deleted, show "This vacancy is no longer available" in expanded section
- Profile links should open in same tab (standard navigation)
- Consider lazy loading vacancies tab if company has many postings
