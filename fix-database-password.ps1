# 데이터베이스 비밀번호 수정 스크립트
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "=== 데이터베이스 비밀번호 수정 ===" -ForegroundColor Cyan

$envPath = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env 파일을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

Write-Host "`.env 파일 읽는 중..." -ForegroundColor Yellow
$envContent = Get-Content $envPath -Raw

# DATABASE_URL 찾기 및 수정
if ($envContent -match 'DATABASE_URL\s*=\s*["'']?([^"'']+)["'']?') {
    $currentUrl = $matches[1]
    Write-Host "현재 DATABASE_URL: $currentUrl" -ForegroundColor Gray
    
    # postgres:postgres를 postgres:0316으로 변경
    if ($currentUrl -match 'postgresql://postgres:postgres@') {
        $newUrl = $currentUrl -replace 'postgres:postgres@', 'postgres:0316@'
        $envContent = $envContent -replace [regex]::Escape($currentUrl), $newUrl
        Write-Host "✅ 비밀번호를 0316으로 변경했습니다." -ForegroundColor Green
    } elseif ($currentUrl -match 'postgresql://hopefulearth:') {
        Write-Host "✅ 이미 hopefulearth 사용자를 사용하고 있습니다." -ForegroundColor Green
        Write-Host "비밀번호가 올바른지 확인하세요." -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  DATABASE_URL 형식을 확인할 수 없습니다." -ForegroundColor Yellow
        Write-Host "수동으로 확인이 필요합니다." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ DATABASE_URL을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

# 파일 저장
Set-Content -Path $envPath -Value $envContent -NoNewline
Write-Host "`n✅ .env 파일이 업데이트되었습니다." -ForegroundColor Green
Write-Host "`n업데이트된 DATABASE_URL:" -ForegroundColor Cyan
if ($envContent -match 'DATABASE_URL\s*=\s*["'']?([^"'']+)["'']?') {
    $updatedUrl = $matches[1]
    $maskedUrl = $updatedUrl -replace ':(.+?)@', ':****@'
    Write-Host $maskedUrl -ForegroundColor White
}

Write-Host "`n백엔드 서버를 재시작하세요." -ForegroundColor Yellow



