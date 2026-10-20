Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Building Kids Calculator Desktop Application" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Build Next.js static export
Write-Host "`n[1/3] Building Next.js static export..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Aborting." -ForegroundColor Red
    exit $LASTEXITCODE
}

# 2. Ensure dist_app folders exist
Write-Host "`n[2/3] Setting up dist_app directory..." -ForegroundColor Yellow
$distDir = Join-Path $PSScriptRoot "dist_app"
$wwwDir = Join-Path $distDir "www"
$outDir = Join-Path $PSScriptRoot "out"

if (Test-Path $wwwDir) {
    Remove-Item $wwwDir -Recurse -Force
}
Copy-Item -Path $outDir -Destination $wwwDir -Recurse -Force

# 3. Compile C# executable
Write-Host "`n[3/3] Compiling C# wrapper with native .NET compiler..." -ForegroundColor Yellow
$cscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $cscPath)) {
    $cscPath = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
}

$csFile = Join-Path $distDir "Program.cs"
$exeFile = Join-Path $distDir "KidsCalculator.exe"

& $cscPath /nologo /target:winexe /out:"$exeFile" /r:System.Windows.Forms.dll /r:System.dll "$csFile"

if ($LASTEXITCODE -eq 0) {
    $exeSize = (Get-Item $exeFile).Length / 1KB
    $totalSize = (Get-ChildItem -Recurse $distDir | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "`n==========================================" -ForegroundColor Green
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Executable created: $exeFile ($([math]::Round($exeSize, 2)) KB)" -ForegroundColor Green
    Write-Host "Total folder size: $([math]::Round($totalSize, 2)) MB (Entire app + all assets)" -ForegroundColor Green
    Write-Host "You can distribute the 'dist_app' folder or zip it." -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
} else {
    Write-Host "Failed to compile KidsCalculator.exe" -ForegroundColor Red
}
