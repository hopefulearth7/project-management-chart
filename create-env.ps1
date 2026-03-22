# .env file creation script
# UTF-8 encoding setup
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $scriptPath ".env"

Write-Host "=== Creating .env file ===" -ForegroundColor Cyan

# Check if .env file already exists
if (Test-Path $envFile) {
    Write-Host "Warning: .env file already exists." -ForegroundColor Yellow
    $overwrite = Read-Host "Overwrite? (y/n)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Cancelled." -ForegroundColor Gray
        exit 0
    }
}

# Default .env content
$envContent = @"
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/project_roi"
JWT_SECRET="your_jwt_secret_key_change_this_in_production"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
"@

# Write .env file (UTF-8 without BOM)
[System.IO.File]::WriteAllText($envFile, $envContent, [System.Text.Encoding]::UTF8)

Write-Host "`n.env file created successfully!" -ForegroundColor Green
Write-Host "Path: $envFile" -ForegroundColor Gray
Write-Host "`nIMPORTANT: Please update DATABASE_URL with your actual PostgreSQL settings." -ForegroundColor Yellow
Write-Host "  Format: postgresql://username:password@host:port/database_name" -ForegroundColor White
