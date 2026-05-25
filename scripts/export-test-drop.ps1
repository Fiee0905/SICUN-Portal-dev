param(
    [string]$SourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
    [string]$OutputRoot = "D:\work2.0\.tmp\SICUN-Portal_test",
    [string]$ZipRoot = "D:\work2.0\.tmp\SICUN-Portal_handoff\releases",
    [switch]$Zip
)

$ErrorActionPreference = "Stop"

$source = (Resolve-Path $SourceRoot).Path
$output = $OutputRoot
$ignorePath = Join-Path $source ".handoffignore"

if (-not (Test-Path -LiteralPath $ignorePath)) {
    throw "Missing .handoffignore at $ignorePath"
}

$excludePatterns = @()
Get-Content -LiteralPath $ignorePath | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
        return
    }
    $excludePatterns += $line
}

$requiredDirs = @("backend", "frontend", "database", "docs", "integration", "qa", "scripts")
$requiredFiles = @("README.md", "docker-compose.yml", ".gitignore")

if (Test-Path -LiteralPath $output) {
    Remove-Item -LiteralPath $output -Recurse -Force
}
New-Item -ItemType Directory -Path $output | Out-Null

$robocopyArgs = @(
    $source,
    $output,
    "/MIR",
    "/XD"
) + $excludePatterns + @(
    "/XF"
) + $excludePatterns + @(
    "/NFL",
    "/NDL",
    "/NJH",
    "/NJS",
    "/NP"
)

& robocopy @robocopyArgs | Out-Null
$code = $LASTEXITCODE
if ($code -gt 7) {
    throw "robocopy failed with exit code $code"
}

foreach ($pattern in $excludePatterns) {
    Get-ChildItem -LiteralPath $output -Force -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -like $pattern } |
        Sort-Object FullName -Descending |
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

foreach ($dir in $requiredDirs) {
    if (-not (Test-Path -LiteralPath (Join-Path $output $dir))) {
        Write-Warning "Expected delivery directory missing: $dir"
    }
}
foreach ($file in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $output $file))) {
        Write-Warning "Expected delivery file missing: $file"
    }
}

$dropName = "test-drop-" + (Get-Date -Format "yyyyMMdd-HHmmss")
$manifestPath = Join-Path $output "DELIVERY_MANIFEST.md"
$hermesWorkflowPath = Join-Path $output "docs\HERMES_TEST_WORKFLOW.md"
$commit = ""
try {
    $commit = (& git -C $source rev-parse --short HEAD 2>$null)
} catch {
    $commit = "uncommitted"
}
if (-not $commit) {
    $commit = "uncommitted"
}

@"
# Delivery Manifest

- Drop: $dropName
- Source: $source
- Source Git Revision: $commit
- Generated At: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")
- Audience: Hermes testing team

## Included

- backend
- frontend
- database
- docs
- integration
- qa
- scripts
- README.md
- docker-compose.yml

## Excluded

Internal Codex coordination files, local logs, build outputs, dependencies,
Figma exports, bug report work folders, and local environment files are excluded
according to `.handoffignore`.
"@ | Set-Content -LiteralPath $manifestPath -Encoding UTF8

@'
# Hermes Test Team Workflow

This workflow is for the Hermes testing team using:

- Delivery repository: `https://github.com/Fiee0905/SICUN-Portal-delivery.git`
- Delivery branches: `test-drop/YYYYMMDD-NN`

Hermes should only use the delivery repository and should not access the Codex
development repository or local development workspace.

## 1. Test Boundary

Hermes tests only the files included in the current delivery branch.

Do not read, request, or depend on Codex internal files such as:

- `PROJECT_MEMORY.md`
- `TASKS.md`
- `AGENTS.md`
- `pm/`
- `bug-report-*`
- local logs, Figma exports, or development-only folders

## 2. Start a Test Cycle

1. Pull or check out the latest delivery branch provided by Codex.
2. Record the exact branch name in all test notes and GitHub Issues.
3. Deploy or run the project using the files in this branch only.
4. Execute functional, API, page, regression, and feature coverage tests.

## 3. Report Bugs

Submit bugs in GitHub Issues in the delivery repository.

Use the `Hermes Bug Report` issue template and include:

- Tested branch, for example `test-drop/20260525-05`
- Severity
- Environment
- Reproduction steps
- Actual result
- Expected result
- Screenshots, logs, or API responses

Create one issue per bug. Do not group unrelated bugs into one issue.

## 4. Submit Suggestions

Use the `Hermes Suggestion` issue template for non-blocking improvements.

Suggestions should include:

- Tested branch
- Background or user scenario
- Proposed improvement
- Priority
- Evidence if available

## 5. Feedback Loop

Codex reads issues from the delivery repository, fixes problems in the
development repository, and publishes a new delivery branch.

Hermes should retest only after Codex provides the next `test-drop/*` branch.

## 6. Do Not

- Do not modify delivery branch code directly.
- Do not submit fixes as direct commits to the delivery repository.
- Do not test against the Codex development repository.
- Do not omit the tested branch from bug reports.
'@ | Set-Content -LiteralPath $hermesWorkflowPath -Encoding UTF8

if ($Zip) {
    New-Item -ItemType Directory -Path $ZipRoot -Force | Out-Null
    $zipPath = Join-Path $ZipRoot "$dropName.zip"
    if (Test-Path -LiteralPath $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }
    Compress-Archive -Path (Join-Path $output "*") -DestinationPath $zipPath -Force
    Write-Host "Exported test drop to $output"
    Write-Host "Created zip $zipPath"
} else {
    Write-Host "Exported test drop to $output"
}
