param(
    [Parameter(Mandatory = $true)]
    [string]$DeliveryRepoUrl,

    [string]$DeliveryWorktree = "D:\work2.0\SICUN-Portal_delivery_repo",
    [string]$SourceDrop = "D:\work2.0\.tmp\SICUN-Portal_test",
    [string]$Branch = ("test-drop/" + (Get-Date -Format "yyyyMMdd-HHmmss")),
    [string]$CommitMessage = ("Publish Hermes test drop " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $SourceDrop)) {
    throw "Source test drop does not exist: $SourceDrop. Run scripts/export-test-drop.ps1 first."
}

if (-not (Test-Path -LiteralPath $DeliveryWorktree)) {
    git clone $DeliveryRepoUrl $DeliveryWorktree
} else {
    git -C $DeliveryWorktree remote set-url origin $DeliveryRepoUrl
    git -C $DeliveryWorktree fetch origin
}

git -C $DeliveryWorktree checkout --orphan $Branch

Get-ChildItem -LiteralPath $DeliveryWorktree -Force |
    Where-Object { $_.Name -ne ".git" } |
    Remove-Item -Recurse -Force

Get-ChildItem -LiteralPath $SourceDrop -Force |
    Copy-Item -Destination $DeliveryWorktree -Recurse -Force

git -C $DeliveryWorktree add -A
git -C $DeliveryWorktree commit -m $CommitMessage
git -C $DeliveryWorktree push -u origin $Branch

Write-Host "Published delivery branch $Branch to $DeliveryRepoUrl"
