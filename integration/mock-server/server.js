const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const users = require("./data/cas-users.json");
const courses = require("./data/courses.json");
const enrollments = require("./data/enrollments.json");

const app = express();
const port = Number(process.env.PORT || 4010);
const apiKey = process.env.MOCK_API_KEY || "dev-integration-key";

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

const issuedTickets = new Map();
const callbacks = [];

function nowIso() {
  return new Date().toISOString();
}

function buildTraceId() {
  return `mock-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function ok(data, meta = {}) {
  return {
    code: "OK",
    message: "success",
    traceId: meta.traceId || buildTraceId(),
    data
  };
}

function fail(res, status, code, message, details) {
  return res.status(status).json({
    code,
    message,
    traceId: buildTraceId(),
    details: details || null
  });
}

function requireApiKey(req, res, next) {
  const provided = req.header("x-api-key");
  if (provided !== apiKey) {
    return fail(res, 401, "UNAUTHORIZED", "Missing or invalid x-api-key header.");
  }
  return next();
}

function normalizePage(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

app.get("/health", (req, res) => {
  res.json(ok({ status: "UP", service: "integration-mock", time: nowIso() }));
});

app.post("/mock/cas/login", (req, res) => {
  const { username, password, service } = req.body || {};
  const user = users.find(
    (item) => item.username === username && item.password === password
  );

  if (!user) {
    return fail(res, 401, "CAS_BAD_CREDENTIALS", "Invalid CAS username or password.");
  }

  const ticket = `ST-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  issuedTickets.set(ticket, {
    username: user.username,
    service: service || "http://localhost:8080/api/auth/cas/callback",
    expiresAt: Date.now() + 5 * 60 * 1000,
    consumed: false
  });

  return res.json(ok({
    ticket,
    service: service || null,
    expiresAt: minutesFromNow(5)
  }));
});

app.post("/mock/cas/serviceValidate", (req, res) => {
  const { service, ticket } = req.body || {};
  const issued = issuedTickets.get(ticket);

  if (!issued) {
    return fail(res, 400, "CAS_INVALID_TICKET", "Ticket does not exist.");
  }

  if (issued.consumed) {
    return fail(res, 400, "CAS_TICKET_REPLAYED", "Ticket has already been consumed.");
  }

  if (issued.expiresAt < Date.now()) {
    return fail(res, 400, "CAS_TICKET_EXPIRED", "Ticket has expired.");
  }

  if (service && issued.service !== service) {
    return fail(res, 400, "CAS_SERVICE_MISMATCH", "Ticket service does not match.");
  }

  const user = users.find((item) => item.username === issued.username);
  issued.consumed = true;

  return res.json(ok({
    userId: user.userId,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    mobile: user.mobile,
    departmentCode: user.departmentCode,
    roles: user.roles,
    attributes: user.attributes
  }));
});

app.get("/mock/course-platform/courses", requireApiKey, (req, res) => {
  const page = normalizePage(req.query.page, 1);
  const pageSize = normalizePage(req.query.pageSize, 20);
  const since = req.query.since ? new Date(String(req.query.since)) : null;
  const changedOnly = since && !Number.isNaN(since.getTime());

  const filtered = changedOnly
    ? courses.filter((course) => new Date(course.updatedAt) >= since)
    : courses;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  res.json(ok({
    items,
    page,
    pageSize,
    total: filtered.length,
    hasMore: start + pageSize < filtered.length,
    watermark: nowIso()
  }));
});

app.get("/mock/course-platform/courses/:courseId", requireApiKey, (req, res) => {
  const course = courses.find((item) => item.courseId === req.params.courseId);
  if (!course) {
    return fail(res, 404, "COURSE_NOT_FOUND", "Course was not found.");
  }
  return res.json(ok(course));
});

app.get("/mock/course-platform/enrollments", requireApiKey, (req, res) => {
  const { courseId, userId } = req.query;
  let filtered = enrollments;

  if (courseId) {
    filtered = filtered.filter((item) => item.courseId === courseId);
  }

  if (userId) {
    filtered = filtered.filter((item) => item.userId === userId);
  }

  res.json(ok({
    items: filtered,
    total: filtered.length,
    watermark: nowIso()
  }));
});

app.post("/mock/course-platform/sync-events", requireApiKey, (req, res) => {
  const payload = req.body || {};
  callbacks.push({
    id: `evt-${callbacks.length + 1}`,
    receivedAt: nowIso(),
    payload
  });

  res.status(202).json(ok({
    accepted: true,
    eventType: payload.eventType || "UNKNOWN",
    receivedAt: nowIso()
  }));
});

app.get("/mock/course-platform/sync-events", requireApiKey, (req, res) => {
  res.json(ok({
    items: callbacks,
    total: callbacks.length
  }));
});

app.use((req, res) => {
  fail(res, 404, "NOT_FOUND", "Mock endpoint does not exist.");
});

app.listen(port, () => {
  console.log(`Integration mock server listening on http://localhost:${port}`);
  console.log(`Use x-api-key: ${apiKey}`);
});
