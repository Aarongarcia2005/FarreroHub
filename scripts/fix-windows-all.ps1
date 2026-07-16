<#
PowerShell script to prepare Windows environment for the bot:
- Tries to install Python via winget (if available)
- Downloads yt-dlp.exe and ffmpeg into ./bin
- Runs npm install

Run as Administrator from project root:
.
#> ./scripts/fix-windows-all.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$binDir = Join-Path $root 'bin'
If (-not (Test-Path $binDir)) { New-Item -ItemType Directory -Path $binDir | Out-Null }

Write-Host "[fix] Installing Python (via winget if available)"
if (Get-Command winget -ErrorAction SilentlyContinue) {
    try {
        winget install -e --id Python.Python.3 -h --silent
    } catch {
        Write-Warning "winget failed to install Python. Please install Python manually from https://www.python.org/"
    }
} else {
    Write-Warning "winget not available. Please install Python manually from https://www.python.org/"
}

Write-Host "[fix] Downloading yt-dlp.exe into ./bin"
$ytUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
$ytPath = Join-Path $binDir 'yt-dlp.exe'
Invoke-WebRequest -Uri $ytUrl -OutFile $ytPath -UseBasicParsing

Write-Host "[fix] Downloading ffmpeg (essentials build) and extracting ffmpeg.exe"
$ffZip = Join-Path $binDir 'ffmpeg.zip'
$ffUrl = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip'
Invoke-WebRequest -Uri $ffUrl -OutFile $ffZip -UseBasicParsing
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($ffZip, Join-Path $binDir 'ffmpeg_tmp')
$ffExe = Get-ChildItem -Path (Join-Path $binDir 'ffmpeg_tmp') -Recurse -Filter 'ffmpeg.exe' | Select-Object -First 1
Copy-Item -Path $ffExe.FullName -Destination (Join-Path $binDir 'ffmpeg.exe') -Force
Remove-Item $ffZip -Force
Remove-Item (Join-Path $binDir 'ffmpeg_tmp') -Recurse -Force

Write-Host "[fix] Running npm install"
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Push-Location $root
    npm install --omit=dev
    Pop-Location
} else {
    Write-Warning "npm not found. Please install Node.js and npm from https://nodejs.org/ and run 'npm install'"
}

Write-Host "[fix] Done. Restart your bot (e.g. node index.js)"
Write-Host "[fix] If YouTube asks you to sign in, export cookies.txt from your browser and place it at the project root. The plugin will use it automatically."
