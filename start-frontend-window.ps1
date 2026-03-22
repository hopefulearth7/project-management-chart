# Frontend 서버 시작 (별도 창)
# UTF-8 인코딩 설정
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null
$env:PYTHONIOENCODING = "utf-8"

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendPath = Join-Path $scriptPath "frontend"

Set-Location $frontendPath

Write-Host "=== Frontend 서버 시작 ===" -ForegroundColor Cyan
Write-Host "경로: $frontendPath" -ForegroundColor Gray

if (-not (Test-Path "node_modules")) {
    Write-Host "`nnode_modules 설치 중..." -ForegroundColor Yellow
    npm install
}

Write-Host "`n서버 시작 중...`n" -ForegroundColor Yellow
npm run dev

