# 백엔드 개발 모드 시작 (nodemon 사용 - 자동 재시작)
# UTF-8 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\backend"

Write-Host "`n=== Backend 개발 서버 (자동 재시작 모드) ===" -ForegroundColor Cyan
Write-Host "포트: 3000" -ForegroundColor Gray
Write-Host "파일 변경 시 자동 재시작됩니다." -ForegroundColor Yellow
Write-Host "종료: Ctrl+C`n" -ForegroundColor Gray

# nodemon이 설치되어 있는지 확인
$nodemonInstalled = npm list nodemon 2>$null
if (-not $nodemonInstalled) {
    Write-Host "nodemon이 설치되지 않았습니다. 설치 중..." -ForegroundColor Yellow
    npm install --save-dev nodemon
}

# 개발 모드로 시작
npm run dev



