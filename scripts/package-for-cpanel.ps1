# package-for-cpanel.ps1
# This script automates building and packaging your app for cPanel

# 1. Build the project
Write-Host "--- Building the project (this may take a minute) ---" -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Please check for errors above." -ForegroundColor Red
    exit
}

# 2. Create a clean deployment folder
$deployFolder = "cpanel-deploy"
if (Test-Path $deployFolder) {
    Remove-Item -Recurse -Force $deployFolder
}
New-Item -ItemType Directory -Path $deployFolder

Write-Host "--- Organizing files for cPanel ---" -ForegroundColor Cyan

# 3. Copy standalone files
Copy-Item -Recurse -Force ".next/standalone/*" $deployFolder

# 4. Copy public assets (Required for Next.js standalone)
if (Test-Path "public") {
    Copy-Item -Recurse -Force "public" "$deployFolder/"
}

# 5. Copy static files (Required for Next.js standalone)
$staticDest = "$deployFolder/.next/static"
if (!(Test-Path $staticDest)) {
    New-Item -ItemType Directory -Path $staticDest -Force
}
Copy-Item -Recurse -Force ".next/static/*" $staticDest

# 6. Copy Prisma folder (to keep your database)
if (Test-Path "prisma") {
    Copy-Item -Recurse -Force "prisma" "$deployFolder/"
}

# 7. Create the ZIP file
$zipFile = "deploy_me.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile
}

Write-Host "--- Creating ZIP archive: $zipFile ---" -ForegroundColor Cyan
Compress-Archive -Path "$deployFolder/*" -DestinationPath $zipFile

# 8. Cleanup
# Remove-Item -Recurse -Force $deployFolder

Write-Host "`nSUCCESS! Your deployment package is ready." -ForegroundColor Green
Write-Host "Upload '$zipFile' to your cPanel folder and extract it." -ForegroundColor White
Write-Host "Then follow the instructions in CPANEL_HOSTING_GUIDE.md" -ForegroundColor Yellow
