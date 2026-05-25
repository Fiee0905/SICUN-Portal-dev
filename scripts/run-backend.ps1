$ErrorActionPreference = "Stop"

$env:JAVA_HOME = "D:\JAVA\jdk-17"
$env:MAVEN_HOME = "D:\Maven\apache-maven-3.9.11"
$env:Path = "$env:MAVEN_HOME\bin;$env:JAVA_HOME\bin;C:\Windows\System32;C:\Windows;C:\Windows\System32\WindowsPowerShell\v1.0"

$workspace = "C:\Users\86199\Documents\New project"
$backend = Join-Path $workspace "backend"
$log = Join-Path $workspace "logs\backend-run.log"
$err = Join-Path $workspace "logs\backend-run.err.log"

Set-Location $backend
& "$env:MAVEN_HOME\bin\mvn.cmd" spring-boot:run 1>> $log 2>> $err
