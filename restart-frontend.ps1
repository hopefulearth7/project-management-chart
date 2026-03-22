# 프론트엔드 서버 재시작 스크립트
# UTF-8 인코딩 설정
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null
$env:PYTHONIOENCODING = "utf-8"

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendPath = Join-Path $scriptPath "frontend"

Write-Host "=== 프론트엔드 서버 재시작 ===" -ForegroundColor Cyan

# Vite 캐시 삭제
if (Test-Path "$frontendPath\node_modules\.vite") {
    Write-Host "Vite 캐시 삭제 중..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "$frontendPath\node_modules\.vite" -ErrorAction SilentlyContinue
    Write-Host "캐시 삭제 완료" -ForegroundColor Green
}

Set-Location $frontendPath

Write-Host "`n프론트엔드 서버 시작 중...`n" -ForegroundColor Yellow
npm run dev

