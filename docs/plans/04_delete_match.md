# Feature Plan: Delete Match Feature

## Overview

Allow both job seekers and companies to delete a match (accepted application with chat). Deleting a match removes the application and all messages, archives the data, notifies the other party, and allows the job seeker to reapply.

---

## Who Can Delete

- **Job Seeker:** Can delete any of their accepted applications/chats
- **Company:** Can delete any accepted application/chat for their vacancies

Both parties have equal ability to end the match.

---

## What Gets Deleted

When a match is deleted:
1. All messages in the conversation
2. The application record
3. (The vacancy remains - only the application is deleted)

---

## Delete Match Flow

### 1. Access Delete Option
- Location: Three-dot menu (⋮) in the chat header
- Menu options: "Delete Match" (red text)

### 2. Confirmation Modal

**Content:**
```
Delete this match?

This action will:
• Delete the entire conversation history
• Remove the application from your records
• Notify [other party name] that the match was ended
• Allow [job seeker name] to reapply to this position

This cannot be undone.

[Cancel] [Delete Match]
```

**For Job Seeker viewing:**
- "[Company Name] will be notified"
- "You can reapply to this position"

**For Company viewing:**
- "[Job Seeker Name] will be notified"
- "They can reapply to this position"

### 3. Backend Processing
1. Verify user has permission (owns the application or vacancy)
2. Archive application and messages
3. Create notification for other party
4. Delete application (cascades to messages)
5. Return success

### 4. Post-Delete
- Redirect to Messages list
- Show success toast: "Match deleted successfully"
- Other party sees notification on next page load

---

## Notification to Other Party

**Job Seeker deletes → Company receives:**
```
Title: "Match Ended"
Message: "[Job Seeker Name] has ended the conversation about [Vacancy Title]"
```

**Company deletes → Job Seeker receives:**
```
Title: "Match Ended"
Message: "[Company Name] has ended the conversation about [Vacancy Title]"
```

---

## Reapplication

- **No cooldown** - Job seeker can reapply immediately
- Application status resets to APPLIED
- New application = fresh start (no history from deleted match)
- Company sees it as a new application

---

## Archive Structure

```prisma
model ArchivedMatch {
  id              Int       @id @default(autoincrement())

  // Application data
  applicationId   Int       // Original application ID
  vacancyId       Int
  vacancyTitle    String
  jobSeekerId     Int
  jobSeekerName   String
  companyId       Int
  companyName     String
  applicationStatus String
  appliedAt       DateTime

  // Messages archived as JSON array
  messages        Json      // [{senderId, senderName, messageText, sentAt}, ...]
  messageCount    Int

  // Metadata
  deletedBy       String    // User ID who initiated deletion
  deletedByRole   String    // JOB_SEEKER or COMPANY
  archivedAt      DateTime  @default(now())
}
```

---

## Database Changes

Add the ArchivedMatch model to schema:

```prisma
model ArchivedMatch {
  id                Int       @id @default(autoincrement())
  applicationId     Int
  vacancyId         Int
  vacancyTitle      String
  jobSeekerId       Int
  jobSeekerName     String
  companyId         Int
  companyName       String
  applicationStatus String
  appliedAt         DateTime
  messages          Json
  messageCount      Int
  deletedBy         String
  deletedByRole     String
  archivedAt        DateTime  @default(now())
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| DELETE | `/applications/:id/match` | Delete match (application + messages) |

**Request:**
- No body needed
- Auth required (must be application owner or vacancy owner)

**Response:**
```json
{
  "success": true,
  "message": "Match deleted successfully"
}
```

**Errors:**
- 403: Not authorized to delete this match
- 404: Application not found
- 400: Application is not in ACCEPTED status (can't delete non-matches)

---

## Authorization Logic

```typescript
// User can delete if:
// 1. They are the job seeker who owns the application
// 2. They are the company who owns the vacancy

const application = await getApplicationWithVacancy(applicationId);

const isJobSeeker = application.jobSeeker.userId === currentUser.id;
const isCompany = application.vacancy.company.userId === currentUser.id;

if (!isJobSeeker && !isCompany) {
  throw new ForbiddenException();
}
```

---

## UI Components

### New Components
- `ChatSettingsMenu` - Three-dot dropdown menu in chat header
- `DeleteMatchModal` - Confirmation modal with consequences explained

### Modified Components
- `ChatHeader` - Add three-dot menu button
- `MessagesPage` - Handle deletion redirect

---

## Implementation Order

1. Create ArchivedMatch model, migration
2. Create delete match endpoint with archive logic
3. Add notification creation on match deletion
4. Build ChatSettingsMenu component
5. Build DeleteMatchModal component
6. Integrate into chat header
7. Handle post-delete redirect and toast
8. Test reapplication flow works correctly

---

## File Structure

```
apps/backend/src/
├── applications/
│   ├── applications.controller.ts (add delete match endpoint)
│   └── applications.service.ts (add delete match logic)

apps/frontend/
├── components/
│   └── messages/
│       ├── ChatSettingsMenu.tsx
│       └── DeleteMatchModal.tsx
├── features/
│   └── messages/
│       └── (update chat components)
```

---

## Edge Cases

### What if vacancy is deleted while application exists?
- Existing cascade delete handles this
- Messages and application already deleted with vacancy

### What if user is deleted while match exists?
- Existing cascade delete handles this
- All their applications/messages deleted with user

### Can a rejected/pending application be "match deleted"?
- No - only ACCEPTED applications (actual matches) can be deleted this way
- Pending applications can be withdrawn (different flow)
- Rejected applications just stay in history

---

## Future Considerations

- Could add "Block" option to prevent reapplication
- Could add "Report" option for inappropriate behavior
- Could show "Previously matched" indicator on reapplication (optional)

---

## Notes

- Match deletion is permanent (but archived)
- Both parties can initiate deletion
- Notification is always sent to the other party
- Job seeker can immediately reapply after either party deletes
- Admin can see deleted matches in archives (from admin feature)
