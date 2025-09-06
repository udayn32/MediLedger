param(
    [string]$Version = '0.24.0'
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Use the script directory to store the download/extraction to avoid temp inconsistencies
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$zip = Join-Path $scriptDir "kubo_v$Version`_windows-amd64.zip"
$outdir = Join-Path $scriptDir 'go-ipfs'

# Clean only if a previous partial download is detected
if (Test-Path -LiteralPath $zip) {
    try {
        $size = (Get-Item $zip).Length
    } catch { $size = 0 }
    if ($size -lt 10000000) {
        Remove-Item -LiteralPath $zip -Force -ErrorAction SilentlyContinue
        Write-Output "Removed small/incomplete zip ($size bytes): $zip"
    }
}

if (-not (Test-Path -LiteralPath $zip)) {
        Write-Output "Downloading Kubo (go-ipfs) v$Version to $zip..."
        $primary = "https://dist.ipfs.tech/kubo/v$Version/kubo_v$Version`_windows-amd64.zip"
        $fallback = "https://github.com/ipfs/kubo/releases/download/v$Version/kubo_v$Version`_windows-amd64.zip"
    $downloaded = $false
    foreach ($url in @($primary, $fallback)) {
        try {
            Write-Output "Fetching: $url"
            Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing -TimeoutSec 120
            $downloaded = $true
            break
            } catch {
                Write-Output "Download failed from $($url): $($_.Exception.Message)"
            }
    }
    if (-not $downloaded) { Write-Error "Failed to download go-ipfs"; exit 1 }
}

# Validate size
try { $size = (Get-Item $zip).Length } catch { $size = 0 }
if ($size -lt 10000000) { Write-Error "Downloaded zip is too small ($size bytes); network may have interrupted."; exit 1 }

Write-Output "Extracting to $outdir..."
if (Test-Path -LiteralPath $outdir) { Remove-Item -LiteralPath $outdir -Recurse -Force -ErrorAction SilentlyContinue }
Expand-Archive -LiteralPath $zip -DestinationPath $outdir -Force

# Auto-discover ipfs.exe under extracted directory (kubo/ or go-ipfs/)
$ipfsExe = $null
try {
    $candidate = Get-ChildItem -Path $outdir -Recurse -Filter 'ipfs.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($candidate) { $ipfsExe = $candidate.FullName }
} catch {}
if (-not $ipfsExe -or -not (Test-Path $ipfsExe)) {
    Write-Error "IPFS executable not found after extraction in $outdir"
    exit 1
}

Write-Output "Found ipfs executable: $ipfsExe"
# Start daemon in background
Start-Process -FilePath $ipfsExe -ArgumentList 'daemon' -WorkingDirectory (Split-Path $ipfsExe) -WindowStyle Hidden
Start-Sleep -Seconds 4
Write-Output "DAEMON_STARTED:$ipfsExe"

# Probe API /version
try {
    $ver = Invoke-RestMethod -Uri "http://127.0.0.1:5001/api/v0/version" -Method Post -TimeoutSec 5 -ErrorAction Stop
    Write-Output "API_OK:$($ver.Version)"
} catch {
    Write-Output "API_ERR:$($_.Exception.Message)"
}

# Probe gateway root
try {
    $gw = Invoke-WebRequest -Uri "http://127.0.0.1:8080/" -Method Get -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Output "GW_OK:$($gw.StatusCode)"
} catch {
    $status = $null
    try { $status = $_.Exception.Response.StatusCode.Value__ } catch { $status = 'no-response' }
    Write-Output "GW_ERR:$($_.Exception.Message) status:$status"
}
