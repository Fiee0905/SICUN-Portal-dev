#!/usr/bin/env python3
"""
Read-only API smoke and permission matrix for SICUN-Portal QA workspace.
Writes JSON evidence next to this script. Does not mutate backend data.
"""
import json
import sys
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path
from urllib import request, parse, error

BASE = "http://172.19.192.1:8080/api/v1"
OUT_DIR = Path(__file__).resolve().parent
OUT_JSON = OUT_DIR / "api_permission_smoke_result.json"
RAW_JSON = OUT_DIR / "api_permission_smoke_raw.json"
ACCOUNTS = {
    "admin": ("admin", "123456"),
    "student": ("student001", "123456"),
    "outside": ("outside001", "123456"),
}

raw = []
results = []
tokens = {}
users = {}
state = {}


def http(method, path, body=None, token=None, timeout=10):
    url = BASE + path
    data = None
    headers = {"Accept": "application/json"}
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = "Bearer " + token
    req = request.Request(url, data=data, headers=headers, method=method)
    started = time.time()
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            text = resp.read().decode("utf-8", errors="replace")
            status = resp.status
            headers_resp = dict(resp.headers)
    except error.HTTPError as e:
        status = e.code
        text = e.read().decode("utf-8", errors="replace")
        headers_resp = dict(e.headers)
    except Exception as e:
        return {"method": method, "path": path, "url": url, "exception": repr(e), "elapsed_ms": round((time.time()-started)*1000, 1)}
    parsed = None
    try:
        parsed = json.loads(text) if text else None
    except Exception:
        parsed = None
    item = {
        "method": method,
        "path": path,
        "url": url,
        "status": status,
        "elapsed_ms": round((time.time()-started)*1000, 1),
        "body_preview": text[:1000],
        "json": parsed,
    }
    raw.append(item)
    return item


def body_code(resp):
    j = resp.get("json")
    if isinstance(j, dict):
        return j.get("code")
    return None


def data_of(resp):
    j = resp.get("json")
    if isinstance(j, dict):
        return j.get("data")
    return None


def ok_response(resp):
    return resp.get("status") == 200 and isinstance(resp.get("json"), dict) and body_code(resp) in (0, 200, None)


def add(case_id, name, expected, resp=None, passed=False, blocked=False, details=""):
    if blocked:
        status = "BLOCKED"
    else:
        status = "PASS" if passed else "FAIL"
    results.append({
        "case_id": case_id,
        "name": name,
        "expected": expected,
        "result": status,
        "http_status": None if resp is None else resp.get("status"),
        "body_code": None if resp is None else body_code(resp),
        "details": details,
        "path": None if resp is None else resp.get("path"),
        "elapsed_ms": None if resp is None else resp.get("elapsed_ms"),
    })


def records_from_page(data):
    if isinstance(data, dict):
        rec = data.get("records")
        return rec if isinstance(rec, list) else []
    return []


def login(label):
    u, p = ACCOUNTS[label]
    resp = http("POST", "/auth/login", {"username": u, "password": p})
    data = data_of(resp)
    token = data.get("accessToken") if isinstance(data, dict) else None
    user = data.get("user") if isinstance(data, dict) else None
    if token:
        tokens[label] = token
    if user:
        users[label] = user
    return resp, token, user


def main():
    started_at = datetime.now(timezone.utc).isoformat()

    # Public portal endpoints
    resp = http("GET", "/portal/home")
    data = data_of(resp)
    required_keys = {"siteConfig", "banners", "quickLinks", "courses", "news", "notices"}
    add("API-PUB-001", "公开门户首页 /portal/home", "HTTP 200 且返回门户核心区块", resp,
        passed=ok_response(resp) and isinstance(data, dict) and required_keys.issubset(data.keys()),
        details="keys=" + (",".join(sorted(data.keys())) if isinstance(data, dict) else "N/A"))

    resp = http("GET", "/portal/courses?page=1&size=10")
    courses_data = data_of(resp)
    public_courses = records_from_page(courses_data)
    state["public_course_count"] = len(public_courses)
    state["public_course_ids"] = [c.get("id") for c in public_courses[:5] if isinstance(c, dict)]
    add("API-PUB-002", "课程检索 /portal/courses", "HTTP 200 且分页 records 可解析，至少返回公开课程", resp,
        passed=ok_response(resp) and isinstance(courses_data, dict) and isinstance(courses_data.get("records"), list) and len(public_courses) > 0,
        details=f"records={len(public_courses)}, total={courses_data.get('total') if isinstance(courses_data, dict) else None}")

    keyword_resp = http("GET", "/portal/search-keywords")
    keywords = data_of(keyword_resp)
    keyword = None
    if isinstance(keywords, list) and keywords:
        keyword = str(keywords[0])
    elif public_courses and isinstance(public_courses[0], dict):
        title = public_courses[0].get("title") or public_courses[0].get("name") or ""
        keyword = str(title)[:2] if title else None
    if keyword:
        q = parse.urlencode({"keyword": keyword, "page": 1, "size": 10})
        resp = http("GET", "/portal/courses?" + q)
        data = data_of(resp)
        add("API-PUB-003", f"搜索关键词课程检索 keyword={keyword}", "HTTP 200 且搜索接口可用", resp,
            passed=ok_response(resp) and isinstance(data, dict) and isinstance(data.get("records"), list),
            details=f"keyword={keyword}, records={len(records_from_page(data))}, total={data.get('total') if isinstance(data, dict) else None}")
    else:
        add("API-PUB-003", "搜索关键词课程检索", "可取得关键词或课程标题并搜索", blocked=True,
            details="/portal/search-keywords 无关键词且 /portal/courses 无课程可派生关键词")

    add("API-PUB-004", "搜索关键词配置 /portal/search-keywords", "HTTP 200 且返回 list", keyword_resp,
        passed=ok_response(keyword_resp) and isinstance(keywords, list),
        details=f"keyword_count={len(keywords) if isinstance(keywords, list) else 'N/A'}")

    # Admin auth matrix
    resp = http("GET", "/admin/courses?page=1&size=5")
    add("AUTH-001", "admin 未登录访问后台课程", "HTTP 401", resp,
        passed=resp.get("status") == 401,
        details=resp.get("body_preview", "")[:200])

    admin_resp, admin_token, admin_user = login("admin")
    add("AUTH-002", "admin 登录", "HTTP 200 且返回 accessToken/user.role=admin", admin_resp,
        passed=ok_response(admin_resp) and bool(admin_token) and isinstance(admin_user, dict) and admin_user.get("role") == "admin",
        details=f"role={admin_user.get('role') if isinstance(admin_user, dict) else None}, token_prefix={admin_token[:8] if admin_token else None}")

    if admin_token:
        resp = http("GET", "/admin/courses?page=1&size=5", token=admin_token)
        add("AUTH-003", "admin 登录后访问后台课程", "HTTP 200", resp,
            passed=ok_response(resp), details=f"records={len(records_from_page(data_of(resp)))}")
    else:
        add("AUTH-003", "admin 登录后访问后台课程", "需要 admin token", blocked=True, details="admin 登录未返回 token")

    student_resp, student_token, student_user = login("student")
    add("AUTH-004a", "普通用户 student001 登录", "HTTP 200 且返回 accessToken", student_resp,
        passed=ok_response(student_resp) and bool(student_token),
        details=f"role={student_user.get('role') if isinstance(student_user, dict) else None}")
    if student_token:
        resp = http("GET", "/admin/courses?page=1&size=5", token=student_token)
        add("AUTH-004", "普通用户访问后台课程", "HTTP 403", resp,
            passed=resp.get("status") == 403,
            details=resp.get("body_preview", "")[:200])
    else:
        add("AUTH-004", "普通用户访问后台课程", "HTTP 403", blocked=True, details="student001 登录未返回 token")

    outside_resp, outside_token, outside_user = login("outside")
    add("AUTH-005a", "外部用户 outside001 登录", "HTTP 200 且返回 accessToken", outside_resp,
        passed=ok_response(outside_resp) and bool(outside_token),
        details=f"role={outside_user.get('role') if isinstance(outside_user, dict) else None}")
    if outside_token:
        resp = http("GET", "/admin/courses?page=1&size=5", token=outside_token)
        add("AUTH-005", "外部/普通用户访问后台课程", "HTTP 403", resp,
            passed=resp.get("status") == 403,
            details=resp.get("body_preview", "")[:200])
    else:
        add("AUTH-005", "外部/普通用户访问后台课程", "HTTP 403", blocked=True, details="outside001 登录未返回 token")

    # Course launch behavior; choose first visible public course from public listing.
    course_id = state["public_course_ids"][0] if state.get("public_course_ids") else None
    if course_id is None:
        add("LAUNCH-001", "课程 launch 未登录", "公开课程存在；未登录 launch 返回 401", blocked=True, details="无公开课程 id")
        add("LAUNCH-002", "课程 launch 登录后", "公开课程存在；登录后 launch 返回 launchUrl", blocked=True, details="无公开课程 id")
    else:
        resp = http("POST", f"/portal/courses/{course_id}/launch")
        add("LAUNCH-001", f"课程 launch 未登录 courseId={course_id}", "HTTP 401", resp,
            passed=resp.get("status") == 401,
            details=resp.get("body_preview", "")[:200])
        token_for_launch = student_token or admin_token or outside_token
        if token_for_launch:
            resp = http("POST", f"/portal/courses/{course_id}/launch", token=token_for_launch)
            data = data_of(resp)
            add("LAUNCH-002", f"课程 launch 登录后 courseId={course_id}", "HTTP 200 且 data.launchUrl 非空", resp,
                passed=ok_response(resp) and isinstance(data, dict) and bool(data.get("launchUrl")),
                details=f"launchUrl={data.get('launchUrl') if isinstance(data, dict) else None}")
        else:
            add("LAUNCH-002", f"课程 launch 登录后 courseId={course_id}", "HTTP 200 且 data.launchUrl 非空", blocked=True, details="无任何登录 token")

    summary = {
        "pass": sum(1 for r in results if r["result"] == "PASS"),
        "fail": sum(1 for r in results if r["result"] == "FAIL"),
        "blocked": sum(1 for r in results if r["result"] == "BLOCKED"),
    }
    doc = {
        "started_at": started_at,
        "finished_at": datetime.now(timezone.utc).isoformat(),
        "base_url": BASE,
        "accounts": list(ACCOUNTS.keys()),
        "state": state,
        "summary": summary,
        "results": results,
    }
    OUT_JSON.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    RAW_JSON.write_text(json.dumps(raw, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(doc, ensure_ascii=False, indent=2))
    return 1 if summary["fail"] else 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        tb = traceback.format_exc()
        (OUT_DIR / "api_permission_smoke_error.log").write_text(tb, encoding="utf-8")
        print(tb, file=sys.stderr)
        sys.exit(2)
