# .env 파일 확인 스크립트 (비밀번호는 마스킹)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "=== .env 파일 확인 ===" -ForegroundColor Cyan

$envPath = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env 파일을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

Write-Host "`.env 파일 내용 (비밀번호 마스킹):`n" -ForegroundColor Yellow

Get-Content $envPath | ForEach-Object {
    if ($_ -match 'DATABASE_URL\s*=\s*(.+)') {
        $url = $matches[1] -replace '^["'']|["'']$', ''
        $masked = $url -replace ':(.+?)@', ':****@'
        Write-Host "DATABASE_URL=$masked" -ForegroundColor White
    } elseif ($_ -match 'PASSWORD\s*=\s*(.+)') {
        Write-Host "$($_.Split('=')[0])=****" -ForegroundColor White
    } elseif ($_ -match 'SECRET\s*=\s*(.+)') {
        Write-Host "$($_.Split('=')[0])=****" -ForegroundColor White
    } else {
        Write-Host $_ -ForegroundColor Gray
    }
}



