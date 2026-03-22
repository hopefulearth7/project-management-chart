# Backend 서버 시작 스크립트
# UTF-8 인코딩 설정
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null
$env:PYTHONIOENCODING = "utf-8"

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptPath "backend"

Write-Host "=== Backend 서버 시작 ===" -ForegroundColor Cyan
Write-Host "스크립트 위치: $scriptPath" -ForegroundColor Gray
Write-Host "Backend 경로: $backendPath" -ForegroundColor Gray

if (Test-Path $backendPath) {
    Set-Location $backendPath
    Write-Host "`nBackend 디렉토리로 이동 완료: $(Get-Location)" -ForegroundColor Green
    
    if (Test-Path "package.json") {
        Write-Host "서버 시작 중...`n" -ForegroundColor Yellow
        npm run dev
    } else {
        Write-Host "오류: package.json을 찾을 수 없습니다." -ForegroundColor Red
        Write-Host "npm install을 먼저 실행하세요." -ForegroundColor Yellow
        pause
    }
} else {
    Write-Host "오류: backend 디렉토리를 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "예상 경로: $backendPath" -ForegroundColor Yellow
    pause
}

