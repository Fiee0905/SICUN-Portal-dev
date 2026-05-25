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
