# Backend Unit And Integration Test Recommendations

Target stack: Spring Boot + MyBatis Plus + MySQL + Redis.

## 1. Unit Test Coverage

### Authentication / User Service

- CAS identity mapping creates or updates local user profile correctly.
- Disabled user is rejected even when CAS validation succeeds.
- Logout invalidates application session and related cache keys.
- Current-user lookup returns expected role and permission claims.

### Permission Service

- Admin receives full CMS/admin permission set.
- Teacher receives only teacher-owned course/content permissions.
- Student cannot access admin mutations.
- Unknown role or missing permission defaults to deny.

### Course Service

- Course listing applies keyword/category/status filters.
- Student-visible queries exclude unpublished or archived courses.
- Course detail returns lessons and teacher metadata.
- Enrollment creation is idempotent or returns conflict per contract.
- Duplicate enrollment does not create duplicate records.

### CMS Service

- Article create validates required fields and length limits.
- Draft/submit/approve/reject/publish/offline transitions follow the allowed state machine.
- Delete behavior matches soft-delete/archive policy.
- Edit preserves audit fields and updates `updatedBy`/`updatedAt`.
- XSS-sensitive fields are sanitized or encoded per agreed layer.

### Sync Service

- Upstream payload maps to local course fields correctly.
- Duplicate upstream IDs are skipped or merged consistently.
- Partial failures produce summary counts and error details.
- Re-running the same sync is idempotent.
- Timeout or upstream error does not corrupt existing records.

## 2. Integration Test Coverage

Use `@SpringBootTest` with Testcontainers for MySQL and Redis where possible.

| ID | Area | Recommendation |
| --- | --- | --- |
| BE-IT-001 | Database migration | Start with clean MySQL and apply schema/seed scripts |
| BE-IT-002 | MyBatis mapper | Verify mapper queries, joins, pagination and logical delete filters |
| BE-IT-003 | Transaction rollback | Force failure in multi-table write and assert rollback |
| BE-IT-004 | Redis session/cache | Write/read/expire session or cache entries |
| BE-IT-005 | Controller auth | Mock authenticated roles and assert `401`/`403`/`200` behavior |
| BE-IT-006 | API validation | Send invalid payload and assert field-level validation body |
| BE-IT-007 | Course sync | Use mock HTTP server for course platform success/failure payloads |
| BE-IT-008 | CAS callback | Use mock CAS validation response for valid/invalid tickets |

## 3. Suggested Test Structure

```text
backend/src/test/java/
  .../controller/
    AuthControllerTest.java
    CourseControllerTest.java
    CmsArticleControllerTest.java
    CourseSyncControllerTest.java
  .../service/
    AuthServiceTest.java
    PermissionServiceTest.java
    CourseServiceTest.java
    CmsArticleServiceTest.java
    CourseSyncServiceTest.java
  .../mapper/
    CourseMapperTest.java
    CmsArticleMapperTest.java
  .../support/
    TestSecurityContext.java
    TestDataFactory.java
```

## 4. Recommended Dependencies

- `spring-boot-starter-test`
- `spring-security-test` if Spring Security is used
- `org.testcontainers:mysql`
- `org.testcontainers:junit-jupiter`
- `com.redis:testcontainers-redis` or a generic Redis container
- `mockwebserver` or WireMock for CAS/course platform mocks
- REST Assured for API-level integration tests

## 5. Example Controller Test Pattern

```java
@SpringBootTest
@AutoConfigureMockMvc
class CourseControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    void listCourses_requiresNoLoginAndReturnsPage() throws Exception {
        mockMvc.perform(get("/api/v1/portal/courses")
                .param("page", "1")
                .param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").exists());
    }
}
```

## 6. CI Gate Recommendations

- Run backend unit tests on every pull request.
- Run integration tests when backend/database/integration files change.
- Fail build on test failures, compilation errors and unresolved migrations.
- Publish test reports and coverage trend.
- Add a nightly job for course sync/CAS mock scenarios and UI smoke tests.

## 7. Quality Bar

- Service-layer unit tests cover normal path, validation failure, permission denial and upstream failure.
- Controller tests cover status code, response body and role behavior.
- Mapper tests cover query filters and pagination for realistic seed data.
- Integration tests isolate external services using mocks or containers.
- Defects include reproduction steps, expected/actual result, environment and logs/request IDs.
