#!/usr/bin/env python3
"""Source no-mock scan for QA evidence. Read-only scan, excludes dependencies/build/evidence."""
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/mnt/d/work2.0/SICUN-Portal_test')
OUT = ROOT / 'qa' / 'evidence' / 'no_mock_scan_result.json'
TXT = ROOT / 'qa' / 'evidence' / 'no_mock_scan_summary.txt'
SCAN_DIRS = [ROOT / 'backend' / 'src', ROOT / 'frontend' / 'src']
EXCLUDE_PARTS = {'node_modules', 'target', 'dist', 'build', '.git', '.vite', 'qa/evidence', 'qa/bug-reports'}
PATTERNS = [
    ('mock_keyword', re.compile(r'\b(mock|Mock|MOCK|mockjs|Mock\.mock)\b')),
    ('fake_dummy_stub', re.compile(r'\b(fake|Fake|dummy|Dummy|stub|Stub)\b')),
    # Only flag seeded/test accounts or default passwords, not every legitimate /admin route string.
    ('hardcoded_test_account', re.compile(r'\b(student001|outside001|teacher001)\b|123456')),
    # Backend localhost external-service URLs and generic example.com are potential environment/mock leftovers.
    # Do not flag UI placeholder attributes.
    ('localhost_external_placeholder', re.compile(r'localhost:7001|example\.com', re.I)),
    ('todo_mock', re.compile(r'TODO.*mock|mock.*TODO', re.I)),
]
TEXT_EXTS = {'.java', '.ts', '.tsx', '.js', '.jsx', '.vue', '.json', '.yaml', '.yml', '.properties', '.xml', '.html', '.css', '.scss'}
findings = []
scanned_files = 0
for base in SCAN_DIRS:
    if not base.exists():
        continue
    for p in base.rglob('*'):
        if not p.is_file() or p.suffix not in TEXT_EXTS:
            continue
        rel = p.relative_to(ROOT).as_posix()
        if any(part in rel for part in EXCLUDE_PARTS):
            continue
        scanned_files += 1
        try:
            text = p.read_text(encoding='utf-8', errors='replace')
        except Exception as e:
            findings.append({'type': 'read_error', 'file': rel, 'line': None, 'text': repr(e)})
            continue
        for i, line in enumerate(text.splitlines(), 1):
            for name, rx in PATTERNS:
                if rx.search(line):
                    stripped = line.strip()
                    # Reduce noise: import/package names are not runtime mock data.
                    if name == 'mock_keyword' and (stripped.startswith('import ') or stripped.startswith('package ')):
                        continue
                    findings.append({'type': name, 'file': rel, 'line': i, 'text': stripped[:240]})

# classify likely risk; no automatic failure for comments only.
material = []
for f in findings:
    t = f['text']
    if f['type'] in {'hardcoded_test_account', 'localhost_external_placeholder', 'mock_keyword', 'fake_dummy_stub', 'todo_mock'}:
        if not t.startswith('//') and not t.startswith('*'):
            material.append(f)

summary = {
    'started_at': datetime.now(timezone.utc).isoformat(),
    'root': str(ROOT),
    'scan_dirs': [str(p) for p in SCAN_DIRS],
    'scanned_files': scanned_files,
    'finding_count': len(findings),
    'material_finding_count': len(material),
    'material_findings': material,
    'all_findings': findings,
}
OUT.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
lines = [
    f"root={ROOT}",
    f"scanned_files={scanned_files}",
    f"finding_count={len(findings)}",
    f"material_finding_count={len(material)}",
    "material_findings:",
]
for f in material[:200]:
    lines.append(f"- [{f['type']}] {f['file']}:{f['line']} {f['text']}")
TXT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('\n'.join(lines))
