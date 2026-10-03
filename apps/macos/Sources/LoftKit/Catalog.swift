import Foundation

public struct DriveFile: Equatable, Sendable, Identifiable {
  public let id: String
  public let name: String
  public let kind: String
  public let bytes: Int64
  public let folder: String

  public init(id: String, name: String, kind: String, bytes: Int64, folder: String) {
    self.id = id
    self.name = name
    self.kind = kind
    self.bytes = bytes
    self.folder = folder
  }

  public var whereLine: String { "Loft › \(folder)" }
}

public enum Catalog {
  public static let folders = ["Client Work", "Films", "Brand", "Clients", "Music", "Archive"]
  public static let dropFolders = ["Client Work", "Films"]
  public static let files: [DriveFile] = [
    .init(
      id: "wedding", name: "wedding-film_final.mov", kind: "QuickTime movie",
      bytes: 48_213_574_021, folder: "Client Work"),
    .init(
      id: "notes", name: "Edit Notes.md", kind: "Markdown", bytes: 12_288,
      folder: "Client Work"),
    .init(
      id: "drone", name: "drone-coast_4k.mp4", kind: "MPEG-4 movie",
      bytes: 21_700_000_000, folder: "Films"),
    .init(
      id: "brand", name: "Brand Shoot.jpg", kind: "JPEG image", bytes: 18_400_000,
      folder: "Brand"),
    .init(
      id: "album", name: "Album Cover.psd", kind: "Photoshop", bytes: 2_300_000_000,
      folder: "Brand"),
    .init(
      id: "broll", name: "interview-broll.mov", kind: "QuickTime movie",
      bytes: 12_400_000_000, folder: "Films"),
    .init(
      id: "podcast", name: "Podcast Ep 42.wav", kind: "WAVE audio",
      bytes: 1_100_000_000, folder: "Client Work"),
    .init(
      id: "budget", name: "Budget.xlsx", kind: "Spreadsheet", bytes: 1_363_968,
      folder: "Client Work"),
    .init(
      id: "pack", name: "Sample Pack.zip", kind: "ZIP archive", bytes: 3_600_000_000,
      folder: "Client Work"),
    .init(
      id: "invoice", name: "Invoice.pdf", kind: "PDF", bytes: 3_355_443,
      folder: "Client Work"),
    .init(
      id: "deck", name: "Pitch Deck.pdf", kind: "PDF", bytes: 48_000_000,
      folder: "Client Work"),
  ]

  public static func search(_ query: String) -> [DriveFile] {
    let q = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    if q.isEmpty { return files }
    return files.filter {
      $0.name.lowercased().contains(q) || $0.folder.lowercased().contains(q)
    }
  }

  public static func shareURL(origin: String, id: String) -> String {
    "\(origin.trimmingCharacters(in: CharacterSet(charactersIn: "/")))/s/\(id)"
  }

  public static func diskBytes(keepOnMac: Bool, logical: Int64) -> Int64 {
    keepOnMac ? logical : 0
  }

  public static func formatSize(_ bytes: Int64) -> String {
    let units = ["bytes", "KB", "MB", "GB", "TB"]
    var n = Double(bytes)
    var i = 0
    while n >= 1000, i < units.count - 1 {
      n /= 1000
      i += 1
    }
    if i == 0 { return "\(bytes) bytes" }
    return String(format: "%.1f %@", n, units[i])
  }
}
