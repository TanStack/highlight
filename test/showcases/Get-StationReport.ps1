#Requires -Version 7.4
<# Build typed records, then shape a pipeline for display.
   Quotes and $variables in this comment stay quiet. #>
function Get-StationReport {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateSet('coast', 'ridge')]
        [string[]] $Station,
        [int] $Limit = 5
    )

    begin {
        $script:Endpoint = $env:STATION_API ?? 'https://example.com'
        $headers = @{ Accept = 'application/json' }
        $budget = 64MB
    }
    process {
        foreach ($name in $Station) {
            $request = @{
                Uri = "$script:Endpoint/observations/$name"
                Headers = $headers
                ErrorAction = 'Stop'
            }
            try {
                $reading = Invoke-RestMethod @request
                [pscustomobject]@{
                    Station = $name
                    Celsius = [double] $reading.celsius
                    Online = $true
                }
            }
            catch {
                Write-Warning -Message "Station $name unavailable: $_"
            }
        }
    }
    end {
        $banner = @"
Forecast ready
Budget: $budget
"@
        $literal = @'
$HOME is literal; # this is text, not a comment.
'@
        Write-Verbose -Message ($banner + $literal)
    }
}

${report-title} = 'Today''s observatory'
Get-StationReport -Station coast, ridge |
    Where-Object { $_.Online -and $_.Celsius -ge 0 } |
    Sort-Object -Property Celsius -Descending |
    Select-Object -First 5 -Property Station, Celsius
