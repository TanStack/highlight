---
title: PowerShell Showcase
---

# PowerShell Showcase

Register PowerShell directly for report and automation examples. The `pwsh` and `ps1` aliases normalize to `powershell` when it is registered.

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { powershell } from '@tanstack/highlight/languages/powershell'

const highlighter = createHighlighter({ languages: [powershell] })
const result = highlighter.highlight('Get-Item $HOME', { lang: 'pwsh' })
```

## A report pipeline

An advanced function combines attributes, splatting, scoped variables, typed records, here-strings, null coalescing, and case-insensitive word operators. The API URL is a placeholder.

```powershell
#Requires -Version 7.4
<# Build typed records, then shape a pipeline for display.
   Quotes and $variables in this comment stay quiet. #>
function Get-StationReport {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateSet('coast', 'ridge')]
        [string[]] $Station
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
```

## Preview and scope

Run `pnpm run report:compare` and open `artifacts/shiki-comparison.html`. This showcase appears first in GitHub Light and Aurora X alongside Shiki's reference. Its canonical source is `test/showcases/Get-StationReport.ps1`.

Interpolation remains inside the string token. Full PowerShell command/argument disambiguation and symbol resolution are outside the lightweight tokenizer's scope.

Lexical rules follow PowerShell's [quoting rules](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules) and [language specification](https://learn.microsoft.com/en-us/powershell/scripting/lang-spec/chapter-02).
