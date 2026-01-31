#!/usr/bin/env pwsh
# Post-provision hook to populate .env file with Azure resource values

$ErrorActionPreference = "Stop"

Write-Host "Running post-provision hook to populate .env file..." -ForegroundColor Cyan

# Get azd environment values and parse KEY="VALUE" format into hashtable
$envValues = @{}
azd env get-values | ForEach-Object {
    if ($_ -match '^([^=]+)="?([^"]*)"?$') {
        $envValues[$matches[1]] = $matches[2]
    }
}

# Define the .env file path (repo root)
$envFile = Join-Path $PSScriptRoot "..\..\.env"
$envExample = Join-Path $PSScriptRoot "..\..\.env.example"

# Create .env if it doesn't exist
if (-not (Test-Path $envFile)) {
    Write-Host "Creating new .env file..." -ForegroundColor Yellow
    Copy-Item $envExample $envFile
}

# Read existing .env content
$envContent = Get-Content $envFile -Raw

# Function to update or add environment variable
function Update-EnvVar {
    param($name, $value)
    
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "  Skipping $name (no value provided)" -ForegroundColor Gray
        return $script:envContent
    }
    
    $pattern = "(?m)^$name=.*$"
    $replacement = "$name=$value"
    
    if ($script:envContent -match $pattern) {
        Write-Host "  Updating $name" -ForegroundColor Green
        $script:envContent = $script:envContent -replace $pattern, $replacement
    } else {
        Write-Host "  Adding $name" -ForegroundColor Green
        $script:envContent += "`n$replacement"
    }
}

# Update Azure OpenAI configuration
Update-EnvVar "AZURE_OPENAI_ENDPOINT" $envValues['AZURE_OPENAI_ENDPOINT']
Update-EnvVar "AZURE_OPENAI_REALTIME_DEPLOYMENT" $envValues['AZURE_OPENAI_REALTIME_DEPLOYMENT']
Update-EnvVar "AZURE_OPENAI_TTS_DEPLOYMENT" $envValues['AZURE_OPENAI_TTS_DEPLOYMENT']

# Update CosmosDB configuration
Update-EnvVar "COSMOSDB_ENDPOINT" $envValues['COSMOSDB_ENDPOINT']
Update-EnvVar "COSMOSDB_DATABASE" $envValues['COSMOSDB_DATABASE']
Update-EnvVar "COSMOSDB_CONVERSATIONS_CONTAINER" $envValues['COSMOSDB_CONVERSATIONS_CONTAINER']
Update-EnvVar "COSMOSDB_SCENARIOS_CONTAINER" $envValues['COSMOSDB_SCENARIOS_CONTAINER']

# Update frontend URL
Update-EnvVar "FRONTEND_URL" $envValues['FRONTEND_URL']

# Write updated content back to .env
Set-Content -Path $envFile -Value $envContent.TrimEnd()

Write-Host ""
Write-Host "✓ .env file updated successfully!" -ForegroundColor Green
Write-Host "  Location: $envFile" -ForegroundColor Gray
Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Cyan
Write-Host "Frontend URL: $($envValues['FRONTEND_URL'])" -ForegroundColor Yellow
Write-Host "Backend URL: $($envValues['BACKEND_URL'])" -ForegroundColor Yellow
