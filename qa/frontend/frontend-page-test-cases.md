# Frontend Page Test Cases

Target stack: Vue 3 + Element Plus.

> Update route names after `frontend/` implementation lands. These cases can be executed manually or converted to Playwright specs.

## 1. Global Layout And Navigation

| ID | Page/Area | Scenario | Steps | Expected |
| --- | --- | --- | --- | --- |
| FE-GLOBAL-001 | App shell | Initial load | Open frontend root URL | App renders without console errors |
| FE-GLOBAL-002 | Navigation | Public nav links | Click primary nav entries | Correct route loads, active state updates |
| FE-GLOBAL-003 | Route guard | Protected route anonymous | Open admin route without login | Redirect to CAS/login or access denied page |
| FE-GLOBAL-004 | Error handling | API `500` | Mock/list endpoint returns `500` | User sees non-blocking error state |
| FE-GLOBAL-005 | Responsive | Mobile viewport | Set width 375px | Header/menu/content remain usable |
| FE-GLOBAL-006 | Loading states | Slow API | Delay list/detail endpoint | Skeleton/spinner shown, no layout break |

## 2. Login And User Session

| ID | Scenario | Steps | Expected |
| --- | --- | --- | --- |
| FE-AUTH-001 | Login entry | Click login button | Browser enters configured CAS/login flow |
| FE-AUTH-002 | Successful callback | Complete valid CAS callback | User avatar/name shown, protected routes accessible |
| FE-AUTH-003 | Invalid callback | Return with invalid ticket/error | Error message shown, user remains logged out |
| FE-AUTH-004 | Logout | Click logout | Session cleared, public home shown |
| FE-AUTH-005 | Expired session | Force API `401` | Frontend clears state and redirects to login |
| FE-AUTH-006 | Role menu visibility | Login as admin/teacher/student | Menus match role permissions |

## 3. Course Portal Pages

| ID | Page | Scenario | Steps | Expected |
| --- | --- | --- | --- | --- |
| FE-COURSE-001 | Course list | Default list | Open course list route | Courses render with pagination |
| FE-COURSE-002 | Course list | Search | Enter keyword, submit | List updates and query state persists |
| FE-COURSE-003 | Course list | Empty state | Search unmatched keyword | Empty state shown, no broken table/card |
| FE-COURSE-004 | Course list | Pagination | Change page/page size | Correct request and active page state |
| FE-COURSE-005 | Course detail | Published course | Click course card/list row | Detail data, lessons and teacher info render |
| FE-COURSE-006 | Course detail | Missing course | Navigate to unknown ID | Not-found or error state shown |
| FE-COURSE-007 | Course detail | Enroll requires login | Anonymous clicks enroll | Login prompt/redirect shown |
| FE-COURSE-008 | Course detail | Enroll success | Student clicks enroll | Success feedback and enrolled state |
| FE-COURSE-009 | Course media | Missing image | Course has no image | Fallback image or neutral placeholder shown |

## 4. CMS/Admin Pages

| ID | Page | Scenario | Steps | Expected |
| --- | --- | --- | --- | --- |
| FE-CMS-001 | Admin dashboard | Load dashboard | Login as admin, open dashboard | Stats/widgets load or show empty states |
| FE-CMS-002 | Article list | Filter/search | Use status and keyword filters | Query sent, table updates |
| FE-CMS-003 | Article list | Table actions | Open edit/publish/delete actions | Buttons reflect record status and permission |
| FE-CMS-004 | Article create | Required validation | Submit empty form | Field errors shown, no API mutation |
| FE-CMS-005 | Article create | Save draft | Fill minimum fields, save draft | Success message, redirected or record ID shown |
| FE-CMS-006 | Article edit | Load existing | Open edit route | Form populated correctly |
| FE-CMS-007 | Article edit | Save update | Modify fields, submit | Success feedback, data persists after reload |
| FE-CMS-008 | Article publish | Publish draft | Click publish and confirm | Status changes to published |
| FE-CMS-009 | Article delete | Confirm delete | Click delete, cancel then confirm | Cancel no-op; confirm removes/hides record |
| FE-CMS-010 | Permission | Student opens admin page | Login as student and navigate directly | `403`/redirect, no admin data rendered |

## 5. Sync Management Pages

| ID | Page | Scenario | Steps | Expected |
| --- | --- | --- | --- | --- |
| FE-SYNC-001 | Sync page | Load latest status | Open sync management route | Last sync status and counts render |
| FE-SYNC-002 | Sync action | Trigger manual sync | Click sync button and confirm | Button disabled while running, result shown |
| FE-SYNC-003 | Sync action | Failure result | Mock upstream failure | Failure summary displayed with retry option |
| FE-SYNC-004 | Sync logs | View job detail | Open sync job detail | Created/updated/skipped/failed counts visible |

## 6. Accessibility And Usability Smoke

| ID | Scenario | Expected |
| --- | --- | --- |
| FE-A11Y-001 | Keyboard tab through header/forms | Focus order is logical and visible |
| FE-A11Y-002 | Form labels | Inputs have visible labels or accessible names |
| FE-A11Y-003 | Dialogs | Confirmation dialogs trap focus and close with Esc if supported |
| FE-A11Y-004 | Color contrast | Primary text and buttons meet contrast expectations |
| FE-A11Y-005 | Error text | Validation and API errors are readable and specific |

## 7. Suggested Playwright Smoke Flow

```ts
import { test, expect } from "@playwright/test";

test("public course list loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Education|Portal|教育/);
  await page.getByRole("link", { name: /课程|Course/i }).click();
  await expect(page.getByText(/课程|Course/i).first()).toBeVisible();
});
```

