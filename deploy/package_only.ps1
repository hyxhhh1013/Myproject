$DeployDir = "deploy_temp"
if (Test-Path $DeployDir) { Remove-Item -Recurse -Force $DeployDir }
New-Item -ItemType Directory -Force -Path $DeployDir | Out-Null
New-Item -ItemType Directory -Force -Path "$DeployDir/backend" | Out-Null

Copy-Item -Recurse "frontend/dist" "$DeployDir/frontend"
Copy-Item -Recurse "backend/dist" "$DeployDir/backend/dist"
Copy-Item "backend/package.json" "$DeployDir/backend/"
Copy-Item -Recurse "backend/prisma" "$DeployDir/backend/prisma"
Copy-Item "backend/.env" "$DeployDir/backend/"

if (Test-Path "backend/uploads") {
    Copy-Item -Recurse "backend/uploads" "$DeployDir/backend/uploads"
} else {
    New-Item -ItemType Directory -Force -Path "$DeployDir/backend/uploads" | Out-Null
}

Copy-Item "batch_upload.js" "$DeployDir/backend/"
Copy-Item "deploy/setup_server.sh" "$DeployDir/"

$ZipPath = "deploy_package.zip"
if (Test-Path $ZipPath) { Remove-Item $ZipPath }
Compress-Archive -Path "$DeployDir/*" -DestinationPath $ZipPath -Force

Remove-Item -Recurse -Force $DeployDir
Write-Host "Package created: $ZipPath"
