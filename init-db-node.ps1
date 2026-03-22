# Node.js를 사용한 데이터베이스 초기화 스크립트
# UTF-8 encoding setup
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptPath "backend"

Write-Host "=== Database Initialization (Node.js) ===" -ForegroundColor Cyan
Write-Host "Using Node.js instead of psql" -ForegroundColor Gray

Set-Location $backendPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "`nRunning database initialization..." -ForegroundColor Yellow
node init-db.js

Set-Location $scriptPath



