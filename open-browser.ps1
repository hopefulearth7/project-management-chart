# 브라우저 열기 스크립트
# UTF-8 인코딩 설정
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null
$env:PYTHONIOENCODING = "utf-8"

$url = "http://localhost:5173"
$maxAttempts = 30
$attempt = 0

Write-Host "=== 브라우저 열기 ===" -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Gray

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ 서버 준비 완료! 브라우저를 엽니다..." -ForegroundColor Green
            Start-Process $url
            exit 0
        }
    } catch {
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Host "서버 대기 중... ($attempt/$maxAttempts)" -ForegroundColor Gray
            Start-Sleep -Seconds 2
        } else {
            Write-Host "서버가 아직 준비되지 않았습니다." -ForegroundColor Yellow
            Write-Host "수동으로 브라우저를 열어주세요: $url" -ForegroundColor Cyan
            Start-Process $url
            exit 1
        }
    }
}

