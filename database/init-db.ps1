# 데이터베이스 초기화 및 테스트 데이터 삽입 스크립트
# UTF-8 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

Write-Host "=== 데이터베이스 초기화 ===" -ForegroundColor Cyan

# .env 파일에서 DATABASE_URL 읽기
$envFile = Join-Path $projectRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "오류: .env 파일을 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "경로: $envFile" -ForegroundColor Yellow
    exit 1
}

$envContent = Get-Content $envFile -Raw
$dbUrlMatch = $envContent | Select-String -Pattern 'DATABASE_URL="([^"]+)"'
if (-not $dbUrlMatch) {
    Write-Host "오류: .env 파일에서 DATABASE_URL을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

$dbUrl = $dbUrlMatch.Matches[0].Groups[1].Value
Write-Host "데이터베이스 URL: $dbUrl" -ForegroundColor Gray

# PostgreSQL 연결 정보 파싱
if ($dbUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $dbUser = $matches[1]
    $dbPass = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
    
    Write-Host "`n데이터베이스 정보:" -ForegroundColor Yellow
    Write-Host "  호스트: $dbHost" -ForegroundColor White
    Write-Host "  포트: $dbPort" -ForegroundColor White
    Write-Host "  데이터베이스: $dbName" -ForegroundColor White
    Write-Host "  사용자: $dbUser" -ForegroundColor White
    
    # psql 명령어로 스키마 실행
    $schemaFile = Join-Path $scriptPath "schema.sql"
    $seedFile = Join-Path $scriptPath "seed.sql"
    
    Write-Host "`n[1/2] 스키마 생성 중..." -ForegroundColor Yellow
    $env:PGPASSWORD = $dbPass
    & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $schemaFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 스키마 생성 완료" -ForegroundColor Green
    } else {
        Write-Host "✗ 스키마 생성 실패" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n[2/2] 테스트 데이터 삽입 중..." -ForegroundColor Yellow
    & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $seedFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 테스트 데이터 삽입 완료" -ForegroundColor Green
    } else {
        Write-Host "✗ 테스트 데이터 삽입 실패" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n=== 데이터베이스 초기화 완료 ===" -ForegroundColor Green
    Write-Host "`n테스트 계정:" -ForegroundColor Cyan
    Write-Host "  관리자: admin@example.com / admin123" -ForegroundColor White
    Write-Host "  사용자: user@example.com / user123" -ForegroundColor White
} else {
    Write-Host "오류: DATABASE_URL 형식이 올바르지 않습니다." -ForegroundColor Red
    Write-Host "형식: postgresql://user:password@host:port/database" -ForegroundColor Yellow
    exit 1
}



