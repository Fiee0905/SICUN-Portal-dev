# Integration Mock Server

This mock service simulates the external CAS server and course platform used by
the education portal backend.

## Start

```bash
npm install
npm start
```

Default base URL:

```text
http://localhost:4010
```

Protected course-platform endpoints require:

```text
x-api-key: dev-integration-key
```

Override runtime values with environment variables:

```bash
PORT=4010 MOCK_API_KEY=dev-integration-key npm start
```

On PowerShell:

```powershell
$env:PORT = "4010"
$env:MOCK_API_KEY = "dev-integration-key"
npm start
```

## Quick CAS Flow

1. Request a service ticket:

   ```bash
   curl -X POST http://localhost:4010/mock/cas/login \
     -H "content-type: application/json" \
     -d "{\"username\":\"teacher01\",\"password\":\"password123\",\"service\":\"http://localhost:8080/api/auth/cas/callback\"}"
   ```

2. Validate the returned ticket:

   ```bash
   curl -X POST http://localhost:4010/mock/cas/serviceValidate \
     -H "content-type: application/json" \
     -d "{\"ticket\":\"ST-example\",\"service\":\"http://localhost:8080/api/auth/cas/callback\"}"
   ```

Tickets expire after five minutes and can only be consumed once.

## Course Platform Examples

```bash
curl "http://localhost:4010/mock/course-platform/courses?page=1&pageSize=20" \
  -H "x-api-key: dev-integration-key"
```

```bash
curl "http://localhost:4010/mock/course-platform/courses?since=2026-04-26T00:00:00.000Z" \
  -H "x-api-key: dev-integration-key"
```

```bash
curl "http://localhost:4010/mock/course-platform/enrollments?courseId=CSE-101-2026-SPRING" \
  -H "x-api-key: dev-integration-key"
```

```bash
curl -X POST http://localhost:4010/mock/course-platform/sync-events \
  -H "content-type: application/json" \
  -H "x-api-key: dev-integration-key" \
  -d "{\"eventType\":\"COURSE_UPDATED\",\"courseId\":\"CSE-101-2026-SPRING\"}"
```
