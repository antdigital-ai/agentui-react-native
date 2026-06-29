# One-shot setup for the Expo example (npm only — do not use pnpm).
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Example = Join-Path $Root "example"

Write-Host "Cleaning pnpm artifacts..."
foreach ($dir in @(
    (Join-Path $Root "node_modules"),
    (Join-Path $Example "node_modules"),
    (Join-Path $Example ".expo")
)) {
    if (Test-Path $dir) {
        cmd /c "rmdir /s /q `"$dir`"" 2>$null
    }
}
foreach ($lock in @(
    (Join-Path $Root "pnpm-lock.yaml"),
    (Join-Path $Example "pnpm-lock.yaml")
)) {
    if (Test-Path $lock) { Remove-Item -Force $lock }
}

Write-Host "Installing root..."
Push-Location $Root
npm install
Pop-Location

Write-Host "Installing example..."
Push-Location $Example
npm install
Pop-Location

Write-Host "Done. Start with: cd example && npm run start:clean"
