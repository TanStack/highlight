---
title: Swift and PowerShell
---

# Swift and PowerShell

Two views of an observatory: Swift keeps concurrent observations behind an actor; PowerShell turns them into a typed pipeline. The examples deliberately mix declarations, metadata, raw text, numeric literals, and control flow so the shipped themes have a rich palette to work with.

Register only the languages you need:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { swift } from '@tanstack/highlight/languages/swift'
import { powershell } from '@tanstack/highlight/languages/powershell'

const highlighter = createHighlighter({ languages: [swift, powershell] })
```

Use `swift`, `powershell`, `pwsh`, or `ps1` as fence tags. The default entry registers both definitions. See [Themes](themes) to switch colors without changing markup.

## Swift: concurrent observations

Nested comments, actor isolation, `async let`, closure parameters, key paths, an extended regex, and exact raw-string delimiters share one block. The example illustrates highlighting; the API URL is a placeholder.

```swift
import Foundation

/* An actor owns the cache.
   /* Nested notes stay inside this comment. */
   No locks escape into the view. */
struct Reading: Sendable, Codable {
    let station: String
    let celsius: Double
    var fahrenheit: Double { celsius * 1.8 + 32 }
}

actor Observatory {
    private var cache: [String: Reading] = [:]

    func reading(for station: String) async throws -> Reading {
        if let saved = cache[station] { return saved }
        let url = URL(string: "https://example.com/observations/\(station)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        let reading = try JSONDecoder().decode(Reading.self, from: data)
        cache[station] = reading
        return reading
    }
}

@MainActor
func forecast() async throws {
    let observatory = Observatory()
    async let coast = observatory.reading(for: "coast")
    async let ridge = observatory.reading(for: "ridge")
    let readings = try await [coast, ridge]
    let warm = readings.filter { $0.celsius > 0 }.map(\.station)
    let scale = 0x1.fp+2
    let mask: UInt8 = 0b1111_0000
    let band = 1..<4
    let pattern = #/^(?<station>[a-z]+):\s+(?<value>-?\d+\.\d+)$/#
    let legend = ##"A literal \n; an interpolated value: \##(scale)"##
    let report = """
    Stations: \(warm.joined(separator: ", "))
    Calibrated: \(scale), mask: \(mask), band: \(band)
    """
    print(report, legend, pattern)
}

#if DEBUG
let preview = Reading(station: "coast", celsius: 18.5)
#endif
```

## PowerShell: a report pipeline

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
```

## Preview and scope

Run `pnpm run report:compare` in the repository and open `artifacts/shiki-comparison.html`. These two showcases appear first, in GitHub Light and Aurora X, alongside Shiki's grammar-based reference. Their canonical sources are `test/showcases/Observatory.swift` and `test/showcases/Get-StationReport.ps1`.

Interpolation is kept inside the string token. Bare Swift regex literals, arbitrary custom operators, symbol resolution, and full PowerShell command/argument disambiguation are outside the lightweight tokenizer's scope.

Lexical rules follow [The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/lexicalstructure/) and PowerShell's [quoting rules](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules) and [language specification](https://learn.microsoft.com/en-us/powershell/scripting/lang-spec/chapter-02).
