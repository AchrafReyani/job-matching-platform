# Feature Plan: Account Management

## Overview

Add a dedicated Settings page for users to manage their account: change password, delete account, notification preferences, and theme toggle.

---

## Settings Page Location

- **Route:** `/settings`
- **Access:** From sidebar (all authenticated users)
- **Sections:**
  1. Password & Security
  2. Notification Preferences
  3. Appearance
  4. Danger Zone (Delete Account)

---

## Password & Security Section

### Change Password

**Form Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Current Password | password | Yes | Must match stored hash |
| New Password | password | Yes | Minimum 8 characters |
| Confirm New Password | password | Yes | Must match new password |

**Flow:**
1. User enters current password
2. User enters new password + confirmation
3. Frontend validates passwords match and meet requirements
4. Backend verifies current password
5. If valid, update password hash
6. Show success message
7. User stays logged in (no forced re-login)

**Error States:**
- Current password incorrect
- New passwords don't match
- New password too short (< 8 chars)
- New password same as current

---

## Notification Preferences Section

### Toggles for Job Seekers
| Setting | Default | Description |
|---------|---------|-------------|
| Application Accepted | On | Notify when application is accepted |
| Application Rejected | On | Notify when application is rejected |
| New Messages | On | Notify when receiving a message |

### Toggles for Companies
| Setting | Default | Description |
|---------|---------|-------------|
| New Applications | On | Notify when someone applies |
| New Messages | On | Notify when receiving a message |
| Application Withdrawn | On | Notify when applicant withdraws |

**Storage:**
- Add `notificationPreferences` JSON field to User model
- Or create separate `NotificationPreferences` table

---

## Appearance Section

### Theme Toggle
| Option | Description |
|--------|-------------|
| Light | Light mode theme |
| Dark | Dark mode theme |
| System | Follow system preference |

**Implementation:**
- Uses existing `next-themes` package (already in frontend)
- Store preference in localStorage (already working)
- Optionally sync to database for cross-device consistency

---

## Danger Zone Section

### Delete Account

**UI:**
- Red-bordered section at bottom
- Warning text explaining consequences
- "Delete My Account" button (red)

**Confirmation Modal:**
1. Warning message: "This action cannot be undone. All your data will be permanently deleted."
2. List what will be deleted:
   - For Job Seeker: Profile, applications, messages
   - For Company: Profile, vacancies, applications to your vacancies, messages
3. Password input field
4. Text input: "Type DELETE to confirm"
5. Cancel and Confirm buttons

**Flow:**
1. User clicks "Delete My Account"
2. Modal appears with warnings
3. User enters password
4. User types "DELETE"
5. Both fields must be valid to enable Confirm button
6. Backend verifies password
7. Archive user data (same as admin deletion)
8. Delete user (cascade)
9. Clear session/tokens
10. Redirect to home page with "Account deleted" message

---

## Database Schema Changes

```prisma
model User {
  // ... existing fields
  notificationPreferences Json? @default("{}")
}
```

**Notification Preferences JSON Structure:**
```typescript
// Job Seeker
{
  applicationAccepted: boolean,
  applicationRejected: boolean,
  newMessages: boolean
}

// Company
{
  newApplications: boolean,
  newMessages: boolean,
  applicationWithdrawn: boolean
}
```

---

## API Endpoints

### Password
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/users/me/password` | Change password |

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### Notification Preferences
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me/notification-preferences` | Get current preferences |
| PATCH | `/users/me/notification-preferences` | Update preferences |

### Delete Account
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/me/delete` | Delete own account |

**Request Body:**
```json
{
  "password": "string",
  "confirmation": "DELETE"
}
```

---

## UI Components to Create

### Settings Page Components
- `SettingsPage` - Main settings page layout
- `PasswordSection` - Password change form
- `NotificationPreferencesSection` - Toggle switches for notifications
- `AppearanceSection` - Theme selector
- `DangerZoneSection` - Delete account section
- `DeleteAccountModal` - Confirmation modal with password + text input

### Shared Components
- `ToggleSwitch` - Reusable toggle component (if not already exists)
- `PasswordInput` - Input with show/hide toggle
- `DangerButton` - Red styled button for destructive actions

---

## Implementation Order

1. Add `notificationPreferences` field to User model, migration
2. Create password change endpoint
3. Create notification preferences endpoints
4. Create delete account endpoint (reuse archive logic from admin)
5. Build SettingsPage layout
6. Build PasswordSection component
7. Build NotificationPreferencesSection component
8. Build AppearanceSection component
9. Build DangerZoneSection and DeleteAccountModal
10. Add Settings to sidebar
11. Update notification creation to check user preferences

---

## File Structure

```
apps/backend/src/
├── users/
│   ├── users.controller.ts (add new endpoints)
│   ├── users.service.ts (add new methods)
│   └── dto/
│       ├── change-password.dto.ts
│       ├── update-notification-preferences.dto.ts
│       └── delete-account.dto.ts

apps/frontend/
├── app/
│   └── settings/
│       └── page.tsx
├── components/
│   └── settings/
│       ├── PasswordSection.tsx
│       ├── NotificationPreferencesSection.tsx
│       ├── AppearanceSection.tsx
│       ├── DangerZoneSection.tsx
│       └── DeleteAccountModal.tsx
```

---

## Security Considerations

- Rate limit password change attempts (prevent brute force)
- Rate limit delete account attempts
- Log password changes for security audit
- Clear all sessions after password change (optional, discuss)
- Ensure archived data doesn't contain plaintext passwords

---

## UX Considerations

- Show password strength indicator (optional enhancement)
- Auto-save notification preferences on toggle (no save button needed)
- Theme change should be instant (already is with next-themes)
- Delete modal should require scrolling through warnings before inputs are enabled (optional)

---

## Notes

- Password change does NOT force re-login (user stays authenticated)
- Delete account DOES log user out and redirect to home
- Notification preferences only affect in-app notifications (no email system)
- Archive includes `archivedBy: userId` (self-deletion) vs admin deletion
