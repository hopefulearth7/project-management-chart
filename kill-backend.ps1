# 백엔드 서버 강제 종료 스크립트
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "=== 백엔드 서버 종료 ===" -ForegroundColor Cyan

# 포트 3000을 사용하는 프로세스 찾기
$connections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($connections) {
    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($processId in $pids) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "프로세스 종료 중... (PID: $processId, 이름: $($process.ProcessName))" -ForegroundColor Yellow
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "✅ 백엔드 서버 종료 완료" -ForegroundColor Green
} else {
    Write-Host "포트 3000을 사용하는 프로세스가 없습니다." -ForegroundColor Yellow
}

