# WBS 테이블에 original_end_date 컬럼 추가 스크립트

Write-Host "=== WBS 스키마 업데이트 시작 ===" -ForegroundColor Green

# .env 파일에서 DATABASE_URL 읽기
$envPath = Join-Path $PSScriptRoot ".env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match "DATABASE_URL=(.+)") {
            $env:DATABASE_URL = $matches[1].Trim('"').Trim("'")
        }
    }
}

if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL이 설정되지 않았습니다." -ForegroundColor Red
    Write-Host "   .env 파일을 확인하거나 환경 변수를 설정하세요." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ 데이터베이스 연결 정보 확인 완료" -ForegroundColor Green

# SQL 파일 실행
$sqlFile = Join-Path $PSScriptRoot "database\add-wbs-original-date.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ SQL 파일을 찾을 수 없습니다: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "✓ SQL 파일 확인: $sqlFile" -ForegroundColor Green
Write-Host ""
Write-Host "마이그레이션을 실행합니다..." -ForegroundColor Cyan

# psql 명령 실행
try {
    $content = Get-Content $sqlFile -Raw
    $content | psql $env:DATABASE_URL
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ WBS 스키마 업데이트 완료!" -ForegroundColor Green
        Write-Host ""
        Write-Host "추가된 기능:" -ForegroundColor Yellow
        Write-Host "  - original_end_date 필드 추가 (기간 연장 추적)" -ForegroundColor White
        Write-Host "  - 간트 차트에서 기간 연장된 작업을 노란색으로 표시" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "❌ 마이그레이션 실패" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 오류 발생: $_" -ForegroundColor Red
    exit 1
}

Write-Host "백엔드 서버를 재시작하세요." -ForegroundColor Yellow





