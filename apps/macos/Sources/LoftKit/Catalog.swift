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
  public static let folders = ["Client Work", "Films", "Brand"]
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
}
