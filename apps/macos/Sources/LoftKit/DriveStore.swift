import Foundation

public struct DriveStore: Sendable {
  public let root: URL

  public init(root: URL) {
    self.root = root
  }

  public static func defaultRoot() -> URL {
    FileManager.default.homeDirectoryForCurrentUser
      .appendingPathComponent("Library/Application Support/Loft/Drive", isDirectory: true)
  }

  public func materialize() throws {
    let fm = FileManager.default
    try fm.createDirectory(at: root, withIntermediateDirectories: true)
    for folder in Catalog.folders {
      let dir = root.appendingPathComponent(folder, isDirectory: true)
      try fm.createDirectory(at: dir, withIntermediateDirectories: true)
    }
    for file in Catalog.files {
      let url = root.appendingPathComponent(file.folder, isDirectory: true)
        .appendingPathComponent(file.name)
      if !fm.fileExists(atPath: url.path) {
        fm.createFile(atPath: url.path, contents: Data())
      }
    }
  }
}
