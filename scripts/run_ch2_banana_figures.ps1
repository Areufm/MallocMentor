$ErrorActionPreference = 'Stop'

$workspace = Split-Path -Parent $PSScriptRoot
Set-Location $workspace

if (-not (Test-Path .env)) {
    throw '.env file not found in workspace root.'
}

$envText = Get-Content .env -Raw -Encoding UTF8
$matches = [regex]::Matches($envText, '(?im)^\s*GEMINI_API_KEY\s*=\s*(.*?)\s*$')
$candidate = $null

if ($matches.Count -gt 0) {
    for ($i = $matches.Count - 1; $i -ge 0; $i--) {
        $value = $matches[$i].Groups[1].Value.Trim()
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            $candidate = $value
            break
        }
    }
}

if ([string]::IsNullOrWhiteSpace($candidate) -and -not [string]::IsNullOrWhiteSpace($env:GEMINI_API_KEY)) {
    $candidate = $env:GEMINI_API_KEY
}

if ([string]::IsNullOrWhiteSpace($candidate)) {
    throw 'GEMINI_API_KEY is empty. Please set it in .env (last non-empty value is used), then rerun.'
}

python scripts/generate_ch2_figures_with_banana.py

if ($LASTEXITCODE -ne 0) {
    throw "Generation failed with exit code $LASTEXITCODE"
}

Write-Host 'Banana generation completed.'
Write-Host 'Report file: figures/ch2-banana-generation-report.json'
