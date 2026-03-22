# 백엔드 서버 상태 확인 및 재시작
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "`n=== 백엔드 서버 상태 확인 ===" -ForegroundColor Cyan

# 포트 3000 사용 중인 프로세스 확인
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    Write-Host "포트 3000 사용 중인 프로세스 발견" -ForegroundColor Yellow
    foreach ($pid in $processes) {
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  PID: $pid, 이름: $($proc.ProcessName)" -ForegroundColor Gray
        }
    }
    Write-Host "`n기존 프로세스를 종료하고 재시작하시겠습니까? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'Y' -or $response -eq 'y') {
        foreach ($pid in $processes) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
        Write-Host "프로세스 종료 완료" -ForegroundColor Green
    }
} else {
    Write-Host "포트 3000 사용 중인 프로세스 없음" -ForegroundColor Green
}

# 서버 연결 테스트
Write-Host "`n서버 연결 테스트 중..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ 백엔드 서버 실행 중 (상태: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "응답: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 백엔드 서버가 실행되지 않았습니다" -ForegroundColor Red
    Write-Host "에러: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n백엔드 서버를 시작하시겠습니까? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host "`n백엔드 서버 시작 중..." -ForegroundColor Green
        Set-Location "$PSScriptRoot\backend"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; node server.js"
        Write-Host "백엔드 서버 시작됨 (새 창에서 확인)" -ForegroundColor Green
    }
}

Write-Host "`n=== 확인 완료 ===" -ForegroundColor Cyan



