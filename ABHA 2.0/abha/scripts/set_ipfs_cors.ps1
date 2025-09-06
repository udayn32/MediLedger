param(
    [string]$IpfsExePath
)

# Auto-detect ipfs.exe if not provided
if (-not $IpfsExePath -or $IpfsExePath -eq "") {
    $ipfsCmd = Get-Command ipfs -ErrorAction SilentlyContinue
    if ($ipfsCmd) {
        $IpfsExePath = $ipfsCmd.Source
    } else {
        $candidates = @(
            (Join-Path $PSScriptRoot 'go-ipfs\go-ipfs\ipfs.exe'),
            (Join-Path $env:ProgramFiles 'ipfs\ipfs.exe'),
            (Join-Path $env:LOCALAPPDATA 'Programs\ipfs\ipfs.exe')
        )
        foreach ($c in $candidates) {
            if (Test-Path $c) { $IpfsExePath = $c; break }
        }
    }
}

if (-not $IpfsExePath -or -not (Test-Path $IpfsExePath)) {
    Write-Output "IPFS_EXE_NOT_FOUND. Tried PATH and common install locations. Provide -IpfsExePath or run scripts/start_ipfs.ps1 first."
    exit 1
}

# Determine repo path (use IPFS_PATH if set, otherwise default to %USERPROFILE%\.ipfs)
$repo = $env:IPFS_PATH
if (-not $repo -or $repo -eq "") { $repo = Join-Path $env:USERPROFILE ".ipfs" }
$configPath = Join-Path $repo "config"

# Initialize repo if config missing
if (-not (Test-Path $configPath)) {
    & $IpfsExePath init | Out-Null
}

if (-not (Test-Path $configPath)) {
    Write-Output "CONFIG_NOT_FOUND:$configPath"
    exit 1
}

# Read, modify, and write config safely
try {
    $config = Get-Content -Raw -Path $configPath | ConvertFrom-Json
} catch {
    Write-Output "FAILED_TO_READ_CONFIG:$configPath"; exit 1
}

if (-not $config.API) { $config | Add-Member -NotePropertyName API -NotePropertyValue (@{}) -Force }
$config.API.HTTPHeaders = @{ 
    'Access-Control-Allow-Origin' = @('http://localhost:3000','http://localhost:3001','http://127.0.0.1:3000','http://127.0.0.1:3001','*');
    'Access-Control-Allow-Methods' = @('GET','POST','PUT','DELETE','OPTIONS');
    'Access-Control-Allow-Headers' = @('*')
}

# Save config
try {
    $config | ConvertTo-Json -Depth 20 | Set-Content -Path $configPath -Force
    Write-Output "CONFIG_UPDATED:$configPath"
} catch {
    Write-Output "FAILED_TO_WRITE_CONFIG:$configPath"; exit 1
}

# Restart daemon
Get-Process ipfs -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Start-Process -FilePath $IpfsExePath -ArgumentList 'daemon' -WindowStyle Hidden -PassThru | Out-Null
Start-Sleep -Seconds 2

# Output the new headers
& $IpfsExePath config API.HTTPHeaders
Write-Output "DONE"
