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
