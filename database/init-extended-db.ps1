# Extended database initialization script
# Includes 10 projects, user data, and WBS data

# UTF-8 encoding setup
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

Write-Host "=== Extended Database Initialization ===" -ForegroundColor Cyan
Write-Host "Project root: $projectRoot" -ForegroundColor Gray

# Load environment variables
$envFile = Join-Path $projectRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)\s*=\s*(.+)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
} else {
    Write-Host "Warning: .env file not found." -ForegroundColor Yellow
    Write-Host "Please run .\create-env.ps1 first to create .env file." -ForegroundColor Yellow
    exit 1
}

$databaseUrl = $env:DATABASE_URL
if (-not $databaseUrl) {
    Write-Host "Error: DATABASE_URL environment variable is not set." -ForegroundColor Red
    Write-Host "Please set DATABASE_URL in .env file." -ForegroundColor Yellow
    exit 1
}

# Parse PostgreSQL connection information
if ($databaseUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
} else {
    Write-Host "Error: DATABASE_URL format is incorrect." -ForegroundColor Red
    exit 1
}

Write-Host "`nDatabase Information:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  Port: $dbPort" -ForegroundColor Gray
Write-Host "  Database: $dbName" -ForegroundColor Gray
Write-Host "  User: $dbUser" -ForegroundColor Gray

# Schema file paths
$schemaFile = Join-Path $scriptPath "schema.sql"
$seedFile = Join-Path $scriptPath "seed.sql"
$seedExtendedFile = Join-Path $scriptPath "seed-extended.sql"

# Check schema files
if (-not (Test-Path $schemaFile)) {
    Write-Host "Error: schema.sql file not found." -ForegroundColor Red
    Write-Host "Path: $schemaFile" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $seedExtendedFile)) {
    Write-Host "Error: seed-extended.sql file not found." -ForegroundColor Red
    Write-Host "Path: $seedExtendedFile" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[1/3] Applying schema..." -ForegroundColor Yellow
$schemaContent = Get-Content $schemaFile -Raw -Encoding UTF8
$env:PGPASSWORD = $dbPassword
$schemaContent | & "psql" -h $dbHost -p $dbPort -U $dbUser -d $dbName -f - 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Error occurred while applying schema. Continuing..." -ForegroundColor Yellow
}

Write-Host "`n[2/3] Applying basic seed data..." -ForegroundColor Yellow
if (Test-Path $seedFile) {
    $seedContent = Get-Content $seedFile -Raw -Encoding UTF8
    $seedContent | & "psql" -h $dbHost -p $dbPort -U $dbUser -d $dbName -f - 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: Error occurred while applying basic seed data. Continuing..." -ForegroundColor Yellow
    }
} else {
    Write-Host "Warning: seed.sql file not found. Skipping..." -ForegroundColor Yellow
}

Write-Host "`n[3/3] Applying extended seed data..." -ForegroundColor Yellow
$seedExtendedContent = Get-Content $seedExtendedFile -Raw -Encoding UTF8
$seedExtendedContent | & "psql" -h $dbHost -p $dbPort -U $dbUser -d $dbName -f - 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Error occurred while applying extended seed data." -ForegroundColor Yellow
} else {
    Write-Host "Extended seed data applied successfully!" -ForegroundColor Green
}

Write-Host "`n=== Database Initialization Complete ===" -ForegroundColor Green
Write-Host "`nCreated Data:" -ForegroundColor Cyan
Write-Host "  - Projects: 10" -ForegroundColor White
Write-Host "  - Users: 10 (with join dates)" -ForegroundColor White
Write-Host "  - WBS Items: Work items for each project" -ForegroundColor White

$env:PGPASSWORD = $null
