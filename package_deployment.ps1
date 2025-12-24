$deploymentDir = "deployment_package"
if (Test-Path $deploymentDir) { Remove-Item -Recurse -Force $deploymentDir }
New-Item -ItemType Directory -Force -Path $deploymentDir

# Copy setup script
Copy-Item "deployment\setup_server.sh" -Destination $deploymentDir

# Create backend dir
$backendDir = "$deploymentDir\backend"
New-Item -ItemType Directory -Force -Path $backendDir

# Copy backend files (exclude node_modules, .git, etc)
Copy-Item "backend\dist" -Destination $backendDir -Recurse
Copy-Item "backend\prisma" -Destination $backendDir -Recurse
Copy-Item "backend\package.json" -Destination $backendDir
Copy-Item "backend\package-lock.json" -Destination $backendDir
# Optional: Copy src if needed for debugging or some tools, but dist should suffice for running
# But prisma client generation might need schema.
# Copy-Item "backend\src" -Destination $backendDir -Recurse 

# Create frontend dir
$frontendDir = "$deploymentDir\frontend"
New-Item -ItemType Directory -Force -Path $frontendDir

# Copy frontend dist (that's all we really need for Nginx)
Copy-Item "frontend\dist" -Destination $frontendDir -Recurse
# Copy package.json just in case
Copy-Item "frontend\package.json" -Destination $frontendDir

# Compress
$zipFile = "deployment.zip"
if (Test-Path $zipFile) { Remove-Item -Force $zipFile }
Compress-Archive -Path "$deploymentDir\*" -DestinationPath $zipFile

# Cleanup
Remove-Item -Recurse -Force $deploymentDir

Write-Host "Deployment package created: $zipFile"
