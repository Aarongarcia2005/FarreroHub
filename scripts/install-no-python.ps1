# PowerShell script to install yt-dlp.exe and ffmpeg into ./bin so the bot runs without Python
# Usage: Open PowerShell as administrator (recommended) and run: .\scripts\install-no-python.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$binDir = Join-Path $root 'bin'
if (-not (Test-Path $binDir)) { New-Item -ItemType Directory -Path $binDir | Out-Null }

Write-Host "Installing yt-dlp and ffmpeg into $binDir"

# Download yt-dlp.exe (stable release) from GitHub releases
$ytUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
$ytPath = Join-Path $binDir 'yt-dlp.exe'
Write-Host "Downloading yt-dlp..."
Invoke-WebRequest -Uri $ytUrl -OutFile $ytPath -UseBasicParsing

# Make executable (not necessary on Windows but keep permissions sane)
icacls $ytPath /grant Everyone:R | Out-Null

# Download ffmpeg static build (windows 64-bit). This downloads a zip, extracts ffmpeg.exe
$ffZip = Join-Path $binDir 'ffmpeg.zip'
$ffExtractDir = Join-Path $binDir 'ffmpeg'

Write-Host "Downloading ffmpeg (may take a while)..."
# Using gyan.dev builds (small and reliable)
$ffUrl = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip'
Invoke-WebRequest -Uri $ffUrl -OutFile $ffZip -UseBasicParsing

Write-Host "Extracting ffmpeg..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($ffZip, $ffExtractDir)

# Locate ffmpeg.exe inside extracted folders
$ffExe = Get-ChildItem -Path $ffExtractDir -Recurse -Filter 'ffmpeg.exe' | Select-Object -First 1
if ($null -eq $ffExe) {
    Write-Error "ffmpeg.exe not found after extraction"
    exit 1
}

# Copy ffmpeg.exe to bin root for easier lookup
Copy-Item -Path $ffExe.FullName -Destination (Join-Path $binDir 'ffmpeg.exe') -Force

# Clean up zip and extracted folder to save space (optional)
Remove-Item $ffZip -Force
Remove-Item $ffExtractDir -Recurse -Force

Write-Host "Installation complete. Added yt-dlp.exe and ffmpeg.exe to $binDir"
Write-Host "You can add $binDir to your PATH, or restart the bot — plugin checks ./bin/yt-dlp.exe automatically."
Write-Host "To add to PATH for current session: $env:PATH += ';' + '$binDir'"

Write-Host "Done."