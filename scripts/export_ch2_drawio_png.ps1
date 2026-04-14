$ErrorActionPreference = 'Stop'

$workspace = Split-Path -Parent $PSScriptRoot
Set-Location $workspace

$files = @(
  'figures/ch2-figure-llm-coze-architecture.drawio',
  'figures/ch2-figure-prompt-structured-pipeline.drawio',
  'figures/ch2-figure-rag-knowledge-flow.drawio',
  'figures/ch2-figure-sse-sequence.drawio'
)

if (-not (Get-Command drawio -ErrorAction SilentlyContinue)) {
  Write-Host 'drawio CLI not found. Please install draw.io Desktop CLI first.'
  Write-Host 'After installation, rerun this script to export PNG files.'
  exit 1
}

foreach ($f in $files) {
  if (-not (Test-Path $f)) {
    Write-Host "Skip missing file: $f"
    continue
  }

  $out = "$f.png"
  drawio -x -f png -s 2 -t -o $out $f
  Write-Host "Exported: $out"
}

Write-Host 'All available Chapter 2 drawio files have been exported.'
