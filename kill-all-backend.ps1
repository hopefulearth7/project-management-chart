# 모든 백엔드 관련 프로세스 종료
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "`n=== 백엔드 프로세스 정리 ===" -ForegroundColor Cyan

# 포트 3000 사용 중인 프로세스 종료
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    Write-Host "포트 3000 사용 중인 프로세스 종료 중..." -ForegroundColor Yellow
    foreach ($procId in $processes) {
        try {
            $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "  종료: PID $procId ($($proc.ProcessName))" -ForegroundColor Gray
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        } catch {
            Write-Host "  경고: PID $procId 종료 실패" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "프로세스 종료 완료" -ForegroundColor Green
} else {
    Write-Host "포트 3000 사용 중인 프로세스 없음" -ForegroundColor Green
}

# nodemon 프로세스 종료
$nodemonProcs = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $cmd = (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
    $cmd -like "*nodemon*" -or $cmd -like "*server.js*"
}
if ($nodemonProcs) {
    Write-Host "`nnodemon 프로세스 종료 중..." -ForegroundColor Yellow
    foreach ($proc in $nodemonProcs) {
        try {
            Write-Host "  종료: PID $($proc.Id)" -ForegroundColor Gray
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host "  경고: PID $($proc.Id) 종료 실패" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 1
}

Write-Host "`n=== 정리 완료 ===" -ForegroundColor Green

