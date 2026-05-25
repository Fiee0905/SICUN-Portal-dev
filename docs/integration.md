# Integration Contracts

This document defines the local mock interfaces for CAS login validation and
course-platform synchronization. The mock server lives in
`integration/mock-server`.

## Runtime

- Base URL: `http://localhost:4010`
- Health check: `GET /health`
- Course-platform auth header: `x-api-key: dev-integration-key`
- Response envelope:

```json
{
  "code": "OK",
  "message": "success",
  "traceId": "mock-1777521600000-a1b2c3",
  "data": {}
}
```

Error responses use the same top-level shape with `details`:

```json
{
  "code": "CAS_INVALID_TICKET",
  "message": "Ticket does not exist.",
  "traceId": "mock-1777521600000-a1b2c3",
  "details": null
}
```

## CAS Mock

### POST `/mock/cas/login`

Issues a one-time service ticket for local testing.

Request:

```json
{
  "username": "teacher01",
  "password": "password123",
  "service": "http://localhost:8080/api/auth/cas/callback"
}
```

Response data:

```json
{
  "ticket": "ST-1777521600000-abc123xy",
  "service": "http://localhost:8080/api/auth/cas/callback",
  "expiresAt": "2026-04-30T04:05:00.000Z"
}
```

Seed users:

| Username | Password | Roles |
| --- | --- | --- |
| `teacher01` | `password123` | `TEACHER` |
| `student01` | `password123` | `STUDENT` |
| `admin01` | `password123` | `ADMIN`, `TEACHER` |

### POST `/mock/cas/serviceValidate`

Validates and consumes a service ticket. This endpoint is designed to align with
a backend CAS callback flow after the browser receives a `ticket` parameter.

Request:

```json
{
  "service": "http://localhost:8080/api/auth/cas/callback",
  "ticket": "ST-1777521600000-abc123xy"
}
```

Response data:

```json
{
  "userId": "U10001",
  "username": "teacher01",
  "displayName": "Teacher One",
  "email": "teacher01@example.edu",
  "mobile": "13800000001",
  "departmentCode": "CS",
  "roles": ["TEACHER"],
  "attributes": {
    "employeeNo": "T2026001",
    "title": "Associate Professor"
  }
}
```

Validation behavior:

- Unknown ticket: `400 CAS_INVALID_TICKET`
- Reused ticket: `400 CAS_TICKET_REPLAYED`
- Expired ticket: `400 CAS_TICKET_EXPIRED`
- Service mismatch: `400 CAS_SERVICE_MISMATCH`
- Bad login credentials: `401 CAS_BAD_CREDENTIALS`

## Course Platform Mock

All endpoints in this section require `x-api-key`.

### GET `/mock/course-platform/courses`

Returns paged course records. Supports full and incremental sync.

Query parameters:

| Name | Required | Description |
| --- | --- | --- |
| `page` | No | Positive integer, default `1`. |
| `pageSize` | No | Positive integer, default `20`. |
| `since` | No | ISO timestamp. When supplied, returns courses with `updatedAt >= since`. |

Response data:

```json
{
  "items": [
    {
      "courseId": "CSE-101-2026-SPRING",
      "courseCode": "CSE101",
      "courseName": "Introduction to Computer Science",
      "term": "2026-SPRING",
      "departmentCode": "CS",
      "teacherUserId": "U10001",
      "teacherName": "Teacher One",
      "credit": 3.0,
      "hours": 48,
      "status": "ACTIVE",
      "capacity": 120,
      "location": "Main Building 201",
      "startDate": "2026-03-02",
      "endDate": "2026-06-26",
      "updatedAt": "2026-04-25T09:30:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1,
  "hasMore": false,
  "watermark": "2026-04-30T04:00:00.000Z"
}
```

### GET `/mock/course-platform/courses/{courseId}`

Returns one course record by external course ID.

### GET `/mock/course-platform/enrollments`

Returns course enrollment records.

Query parameters:

| Name | Required | Description |
| --- | --- | --- |
| `courseId` | No | Filter by external course ID. |
| `userId` | No | Filter by unified user ID. |

Enrollment shape:

```json
{
  "enrollmentId": "E-000001",
  "courseId": "CSE-101-2026-SPRING",
  "userId": "U20001",
  "studentNo": "S2026001",
  "studentName": "Student One",
  "status": "ENROLLED",
  "enrolledAt": "2026-03-01T02:00:00.000Z",
  "updatedAt": "2026-04-25T09:40:00.000Z"
}
```

### POST `/mock/course-platform/sync-events`

Receives backend callbacks or manual sync event pushes. The mock stores events in
memory so testers can inspect what the backend sent.

Request:

```json
{
  "eventType": "COURSE_UPDATED",
  "courseId": "CSE-101-2026-SPRING",
  "occurredAt": "2026-04-30T04:00:00.000Z",
  "payload": {
    "source": "backend",
    "reason": "manual-resync"
  }
}
```

Response data:

```json
{
  "accepted": true,
  "eventType": "COURSE_UPDATED",
  "receivedAt": "2026-04-30T04:00:00.000Z"
}
```

### GET `/mock/course-platform/sync-events`

Returns in-memory callback events received since the mock process started.

## Backend Alignment Notes

- CAS validation returns unified `userId`, portal login name, role list, and raw
  `attributes` so the backend can map users without scraping XML.
- Course sync uses stable external IDs: `courseId`, `courseCode`, `term`, and
  `teacherUserId`.
- Incremental sync should persist the returned `watermark` after a successful
  page drain. The mock uses current server time as watermark.
- `status` values currently used by the examples are `ACTIVE`, `SUSPENDED`,
  `ENROLLED`, and `WAITLISTED`.
- The mock intentionally keeps data in JSON files plus memory-only callbacks, so
  tests can reset state by restarting the process.

## Local Verification Commands

```bash
cd integration/mock-server
npm install
npm start
```

```bash
curl http://localhost:4010/health
```

```bash
curl "http://localhost:4010/mock/course-platform/courses" \
  -H "x-api-key: dev-integration-key"
```
