# Content Real Data Acceptance

## Scope

Verify homepage content modules do not use hardcoded frontend data:

- Teachers: admin CRUD -> `/portal/home.teachers`
- News: admin article CRUD with `categoryCode=news` -> `/portal/home.news`
- New courses: latest active visible courses -> `/portal/home.newCourses`

## Go / No-Go

- No-Go if homepage teachers, news, or new courses fall back to `frontend/src/data/mock.ts` when public APIs return empty arrays.
- No-Go if disabled/deleted teachers still appear on the homepage.
- No-Go if draft/offline/deleted news appears on the homepage.
- No-Go if `newCourses` shows more than 4 items or includes inactive/unavailable courses.

## API Checks

1. Login as admin and create a teacher through `POST /api/v1/admin/teachers`.
2. Confirm `GET /api/v1/portal/home` contains the teacher under `data.teachers`.
3. Disable or delete the teacher and confirm `data.teachers` no longer contains it.
4. Create a news article through `POST /api/v1/admin/articles` with `categoryCode=news`.
5. Publish it through `/publish` and confirm `data.news` contains it.
6. Offline or delete it and confirm `data.news` no longer contains it.
7. Create or update at least 5 active public courses and confirm `data.newCourses.length <= 4`.
8. Confirm `data.newCourses` is ordered newest first.

## Page Checks

- `/admin/teachers`: list, create, edit, enable/disable, delete.
- `/admin/news`: list, create, edit, publish, offline, delete.
- `/`: homepage teachers, news, and new courses are synchronized with `/api/v1/portal/home`.

## Verification Commands

```powershell
cd backend
mvn test

cd ..\frontend
npm.cmd run build
```
