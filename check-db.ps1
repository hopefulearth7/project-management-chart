# Database check script
# UTF-8 encoding setup
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = $scriptPath

Write-Host "=== Database Status Check ===" -ForegroundColor Cyan

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
    Write-Host "Error: .env file not found." -ForegroundColor Red
    Write-Host "Please run .\create-env.ps1 first." -ForegroundColor Yellow
    exit 1
}

$databaseUrl = $env:DATABASE_URL
if (-not $databaseUrl) {
    Write-Host "Error: DATABASE_URL not set in .env file." -ForegroundColor Red
    exit 1
}

# Parse PostgreSQL connection
if ($databaseUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
} else {
    Write-Host "Error: Invalid DATABASE_URL format." -ForegroundColor Red
    exit 1
}

Write-Host "`nChecking database..." -ForegroundColor Yellow
Write-Host "  Database: $dbName" -ForegroundColor Gray
Write-Host "  Host: $dbHost" -ForegroundColor Gray

$env:PGPASSWORD = $dbPassword

# Check if project table exists and count projects
$checkQuery = @"
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'project'
        ) THEN 'exists'
        ELSE 'not_exists'
    END as table_status,
    (SELECT COUNT(*) FROM project) as project_count;
"@

try {
    $result = $checkQuery | & "psql" -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -A 2>&1
    if ($LASTEXITCODE -eq 0) {
        $lines = $result -split "`n" | Where-Object { $_.Trim() -ne "" }
        if ($lines.Count -ge 2) {
            $tableStatus = $lines[0].Trim()
            $projectCount = [int]$lines[1].Trim()
            
            Write-Host "`n=== Results ===" -ForegroundColor Green
            Write-Host "  Table status: $tableStatus" -ForegroundColor White
            Write-Host "  Project count: $projectCount" -ForegroundColor White
            
            if ($tableStatus -eq "not_exists") {
                Write-Host "`n⚠️  Project table does not exist!" -ForegroundColor Yellow
                Write-Host "Run: .\database\init-extended-db.ps1" -ForegroundColor Cyan
            } elseif ($projectCount -eq 0) {
                Write-Host "`n⚠️  No projects found in database!" -ForegroundColor Yellow
                Write-Host "Run: .\database\init-extended-db.ps1" -ForegroundColor Cyan
            } else {
                Write-Host "`n✅ Database is initialized with $projectCount projects!" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "`n❌ Database connection failed!" -ForegroundColor Red
        Write-Host "Check your DATABASE_URL in .env file." -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ Error checking database: $_" -ForegroundColor Red
}

$env:PGPASSWORD = $null



