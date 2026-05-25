# Automation Smoke / Permission Matrix Defect Candidates

Workspace: /mnt/d/work2.0/SICUN-Portal_test
Backend base: http://172.19.192.1:8080/api/v1
Evidence time: 2026-05-21T12:54-12:56Z

## P1 - CAS callback accepts invalid ticket and issues an internal-user token

Severity: P1 (authentication bypass / mock implementation leaking into runtime)

Evidence:
- Source: backend/src/main/java/com/edu/portal/auth/controller/AuthController.java:35-38
- Source code authenticates hard-coded teacher001 / 123456 in casCallback and does not validate the submitted ticket/service.
- Runtime probe: qa/evidence/cas_callback_probe.txt

Reproduction:
1. Start backend with the QA test database.
2. Run:
   curl -i -X POST 'http://172.19.192.1:8080/api/v1/auth/cas/callback' \
     -H 'Content-Type: application/json' \
     -d '{"ticket":"INVALID_QA_PROBE","service":"http://qa.local/callback"}'
3. Actual: HTTP 200 and accessToken for teacher001/internal is returned.
4. Expected: invalid CAS ticket should be rejected (401/400) or verified against CAS before issuing any token.

Impact:
- Any caller can obtain an internal role token without valid CAS authentication.
- Should block security/production acceptance until replaced by real CAS verification or disabled behind an explicit non-production profile.

## P2 - Hard-coded localhost:7001 external URLs remain in backend runtime paths

Severity: P2 (environment/configuration portability; can break launch/CAS URL outside local dev)

Evidence:
- backend/src/main/java/com/edu/portal/auth/controller/AuthController.java:31 hard-codes `http://localhost:7001/cas/login`.
- backend/src/main/java/com/edu/portal/portal/controller/PortalController.java:126-128 falls back to `http://localhost:7001/course-platform/.../launch` when course.launchUrl is null.
- no-mock scan: qa/evidence/no_mock_scan_result.json and qa/evidence/no_mock_scan_summary.txt

Reproduction:
1. Call `/auth/cas/login-url?redirectUri=...`; response contains localhost:7001.
2. For a course without launchUrl, call `/portal/courses/{id}/launch` after login; fallback launchUrl points to localhost:7001.

Expected:
- External CAS/LMS URLs should be environment-configurable and not default to localhost in deployable runtime.

## P3 - Default database password is committed in application.yml

Severity: P3 for QA/local; increase severity if this file is reused in non-local deployments.

Evidence:
- backend/src/main/resources/application.yml:15-17 contains MySQL URL/user/password (`edu` / `edu123456`).

Expected:
- Use environment variables/profile-specific config for non-local secrets.
