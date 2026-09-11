# Keep bonto server awake during daytime (8 AM - 10 PM)
# Pings every 5 minutes to prevent idle sleep
# Usage: .\.scripts\keep-alive.ps1

$apiUrl = "https://truetaste-api.bonto.run/api"
$intervalMinutes = 5
$startHour = 8
$endHour = 22

Write-Host "Keep-alive started. Pinging $apiUrl every $intervalMinutes min between ${startHour}:00 and ${endHour}:00"
Write-Host "Press Ctrl+C to stop"

while ($true) {
    $hour = (Get-Date).Hour

    if ($hour -ge $startHour -and $hour -lt $endHour) {
        try {
            $resp = Invoke-WebRequest -Uri $apiUrl -Method GET -TimeoutSec 10 -UseBasicParsing
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Ping OK - $($resp.StatusCode)"
        } catch {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Ping failed - $($_.Exception.Message)"
        }
    } else {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Night time - skipping ping"
    }

    Start-Sleep -Seconds ($intervalMinutes * 60)
}
