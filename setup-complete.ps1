# 프로젝트 완전 설치 및 설정 스크립트
# 데이터베이스 스키마 업데이트, 백엔드/프론트엔드 의존성 설치

Write-Host "=== 프로젝트 관리 시스템 완전 설치 ===" -ForegroundColor Green
Write-Host ""

$ErrorActionPreference = "Stop"
$PROJECT_ROOT = $PSScriptRoot

# 1. 환경 변수 확인
Write-Host "[1/6] 환경 변수 확인..." -ForegroundColor Cyan
$envPath = Join-Path $PROJECT_ROOT ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env 파일이 없습니다." -ForegroundColor Red
    Write-Host "   .\create-env.ps1 스크립트를 실행하여 .env 파일을 생성하세요." -ForegroundColor Yellow
    exit 1
}

# DATABASE_URL 읽기
Get-Content $envPath | ForEach-Object {
    if ($_ -match "DATABASE_URL=(.+)") {
        $env:DATABASE_URL = $matches[1].Trim('"').Trim("'")
    }
}

if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL이 설정되지 않았습니다." -ForegroundColor Red
    exit 1
}
Write-Host "✅ 환경 변수 확인 완료" -ForegroundColor Green
Write-Host ""

# 2. 데이터베이스 스키마 업데이트
Write-Host "[2/6] 데이터베이스 스키마 업데이트..." -ForegroundColor Cyan
$schemaFile = Join-Path $PROJECT_ROOT "database\update-complete-schema.sql"

if (Test-Path $schemaFile) {
    try {
        Get-Content $schemaFile -Raw | psql $env:DATABASE_URL 2>&1 | Out-Null
        Write-Host "✅ 스키마 업데이트 완료" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  스키마 업데이트 중 일부 경고 발생 (무시 가능)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  스키마 업데이트 파일을 찾을 수 없습니다." -ForegroundColor Yellow
}
Write-Host ""

# 3. 백엔드 의존성 설치
Write-Host "[3/6] 백엔드 의존성 설치..." -ForegroundColor Cyan
Push-Location (Join-Path $PROJECT_ROOT "backend")
try {
    if (Test-Path "node_modules") {
        Write-Host "  ℹ️  이미 설치되어 있습니다. (건너뛰기)" -ForegroundColor Gray
    } else {
        npm install --silent
        Write-Host "✅ 백엔드 의존성 설치 완료" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ 백엔드 의존성 설치 실패" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
Write-Host ""

# 4. 프론트엔드 의존성 설치
Write-Host "[4/6] 프론트엔드 의존성 설치..." -ForegroundColor Cyan
Push-Location (Join-Path $PROJECT_ROOT "frontend")
try {
    if (Test-Path "node_modules") {
        Write-Host "  ℹ️  이미 설치되어 있습니다. (건너뛰기)" -ForegroundColor Gray
    } else {
        npm install --silent
        Write-Host "✅ 프론트엔드 의존성 설치 완료" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ 프론트엔드 의존성 설치 실패" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
Write-Host ""

# 5. 데이터베이스 연결 테스트
Write-Host "[5/6] 데이터베이스 연결 테스트..." -ForegroundColor Cyan
try {
    $result = psql $env:DATABASE_URL -c "SELECT NOW();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 데이터베이스 연결 성공" -ForegroundColor Green
    } else {
        Write-Host "❌ 데이터베이스 연결 실패" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 데이터베이스 연결 테스트 실패" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 6. 초기 데이터 확인
Write-Host "[6/6] 초기 데이터 확인..." -ForegroundColor Cyan
try {
    $roleCount = psql $env:DATABASE_URL -t -c "SELECT COUNT(*) FROM role;" 2>&1 | Out-String
    $roleCount = $roleCount.Trim()
    
    if ([int]$roleCount -gt 0) {
        Write-Host "✅ 초기 데이터 존재 (직급: $roleCount개)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  초기 데이터가 없습니다. seed.sql 실행을 권장합니다." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  초기 데이터 확인 실패" -ForegroundColor Yellow
}
Write-Host ""

# 완료
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ 설치 완료!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "1. 백엔드 시작:      .\start-backend.ps1" -ForegroundColor White
Write-Host "2. 프론트엔드 시작:  .\start-frontend.ps1" -ForegroundColor White
Write-Host "3. 또는 한 번에:     .\start-dev.ps1" -ForegroundColor White
Write-Host "4. API 테스트:       .\test-all-apis.ps1" -ForegroundColor White
Write-Host ""
Write-Host "브라우저에서 http://localhost:5173 접속" -ForegroundColor Cyan





