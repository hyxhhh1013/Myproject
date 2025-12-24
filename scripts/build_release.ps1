# Build Release Script
$ErrorActionPreference = "Stop"

Write-Host "Starting Build Process..." -ForegroundColor Green

# 1. Frontend Build
Write-Host "Building Frontend..." -ForegroundColor Cyan
Push-Location "frontend"
if (!(Test-Path "node_modules")) {
    npm install
}
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed"
    exit 1
}
Pop-Location

# 2. Backend Build
Write-Host "Building Backend..." -ForegroundColor Cyan
Push-Location "backend"
if (!(Test-Path "node_modules")) {
    npm install
}
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend build failed"
    exit 1
}
Pop-Location

# 3. Create Release Directory
$releaseDir = "release"
if (Test-Path $releaseDir) {
    Remove-Item -Path $releaseDir -Recurse -Force
}
New-Item -ItemType Directory -Path $releaseDir | Out-Null

# 4. Copy Backend Artifacts
Write-Host "Copying Backend Artifacts..." -ForegroundColor Cyan
Copy-Item -Path "backend\dist\*" -Destination $releaseDir -Recurse
Copy-Item -Path "backend\package.json" -Destination $releaseDir
Copy-Item -Path "backend\.env" -Destination $releaseDir
Copy-Item -Path "backend\prisma" -Destination "$releaseDir\prisma" -Recurse

# 5. Copy Frontend Artifacts to Backend Public
Write-Host "Copying Frontend Artifacts..." -ForegroundColor Cyan
$publicDir = "$releaseDir\public"
New-Item -ItemType Directory -Path $publicDir | Out-Null
Copy-Item -Path "frontend\dist\*" -Destination $publicDir -Recurse

# 6. Create Deployment Guide
$readmeContent = @"
# Deployment Guide

This folder contains the compiled application ready for deployment.

## Prerequisites
- Node.js (v18+)
- MySQL Database

## Setup
1. Edit `.env` file to match your production database and settings.
   - Set \`NODE_ENV=production\`
   - Set \`DATABASE_URL\` to your MySQL connection string.

2. Install Production Dependencies
   \`\`\`bash
   npm install --production
   \`\`\`

3. Run Database Migrations
   \`\`\`bash
   npx prisma migrate deploy
   \`\`\`

4. Start the Server
   \`\`\`bash
   npm start
   \`\`\`

The server will start on the port specified in .env (default 3001) and serve the frontend application.
"@

Set-Content -Path "$releaseDir\README_DEPLOY.md" -Value $readmeContent

Write-Host "Build Complete! Check the '$releaseDir' directory." -ForegroundColor Green
