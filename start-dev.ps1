# 개발 모드 시작 스크립트 (자동 재시작 포함)
# UTF-8 인코딩 설정
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "`n=== 개발 모드 시작 (자동 재시작) ===" -ForegroundColor Cyan
Write-Host "프로젝트 루트: $scriptPath" -ForegroundColor Gray

# 포트 사용 중인 프로세스 확인 및 종료
Write-Host "`n기존 프로세스 확인 중..." -ForegroundColor Yellow

# 포트 3000 (백엔드)
$backendProcesses = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($backendProcesses) {
    Write-Host "포트 3000 사용 중인 프로세스 종료 중..." -ForegroundColor Yellow
    foreach ($pid in $backendProcesses) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
}

# 포트 5173 (프론트엔드)
$frontendProcesses = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($frontendProcesses) {
    Write-Host "포트 5173 사용 중인 프로세스 종료 중..." -ForegroundColor Yellow
    foreach ($pid in $frontendProcesses) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
}

# Backend 시작 (nodemon 사용)
Write-Host "`n[1/2] Backend 서버 시작 중 (자동 재시작 모드)..." -ForegroundColor Yellow
$backendScript = Join-Path $scriptPath "start-backend-dev.ps1"
if (Test-Path $backendScript) {
    Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$backendScript`""
} else {
    Write-Host "오류: start-backend-dev.ps1 파일을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

# 잠시 대기
Start-Sleep -Seconds 3

# Frontend 시작
Write-Host "[2/2] Frontend 서버 시작 중..." -ForegroundColor Yellow
$frontendScript = Join-Path $scriptPath "start-frontend-window.ps1"
if (Test-Path $frontendScript) {
    Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$frontendScript`""
} else {
    Write-Host "오류: start-frontend-window.ps1 파일을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ 개발 서버 시작 완료!" -ForegroundColor Green
Write-Host "`n접속 주소:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "`n특징:" -ForegroundColor Cyan
Write-Host "  - 백엔드: 파일 변경 시 자동 재시작 (nodemon)" -ForegroundColor Gray
Write-Host "  - 프론트엔드: Hot Module Replacement (HMR) 활성화" -ForegroundColor Gray
Write-Host "  - 실시간 로깅 및 에러 표시" -ForegroundColor Gray

# 브라우저 자동 열기 (5초 후)
Write-Host "`n브라우저를 5초 후에 자동으로 엽니다..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$url = "http://localhost:5173"
$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ 서버 준비 완료! 브라우저를 엽니다..." -ForegroundColor Green
            Start-Process $url
            break
        }
    } catch {
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Host "서버 대기 중... ($attempt/$maxAttempts)" -ForegroundColor Gray
            Start-Sleep -Seconds 2
        } else {
            Write-Host "서버가 아직 준비되지 않았습니다. 수동으로 브라우저를 열어주세요." -ForegroundColor Yellow
            Write-Host "URL: $url" -ForegroundColor Cyan
            Start-Process $url
        }
    }
}



