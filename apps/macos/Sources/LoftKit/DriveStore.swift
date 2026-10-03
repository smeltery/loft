import Foundation

public struct DriveStore: Sendable {
  public let root: URL

  public init(root: URL) {
    self.root = root
  }

  public static func supportRoot() -> URL {
    FileManager.default.homeDirectoryForCurrentUser
      .appendingPathComponent("Library/Application Support/Loft/Drive", isDirectory: true)
  }

  public static func volumeRoot() -> URL {
    URL(fileURLWithPath: "/Volumes/Loft", isDirectory: true)
  }

  public func materialize() throws {
    let fm = FileManager.default
    try fm.createDirectory(at: root, withIntermediateDirectories: true)
    for folder in Catalog.folders {
      try fm.createDirectory(
        at: root.appendingPathComponent(folder, isDirectory: true),
        withIntermediateDirectories: true)
    }
    for file in Catalog.files {
      let url = self.url(file)
      try Placeholder.create(at: url, bytes: file.bytes)
    }
  }

  public func url(_ file: DriveFile) -> URL {
    root.appendingPathComponent(file.folder, isDirectory: true)
      .appendingPathComponent(file.name)
  }

  public func sync(_ files: [RemoteFile]) throws {
    try materialize()
    for file in files {
      try Placeholder.create(at: url(file.asDriveFile), bytes: file.bytes)
    }
  }
}

extension RemoteFile {
  public var asDriveFile: DriveFile {
    DriveFile(id: id, name: name, kind: kind, bytes: bytes, folder: folder)
  }
}
