import Darwin
import Foundation

public enum DriveError: Error { case io }

public enum Placeholder {
  public static func create(at url: URL, bytes: Int64) throws {
    let fm = FileManager.default
    try fm.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
    if !fm.fileExists(atPath: url.path) {
      fm.createFile(atPath: url.path, contents: nil)
    }
    try truncate(url, bytes: bytes)
  }

  public static func truncate(_ url: URL, bytes: Int64) throws {
    let fd = open(url.path, O_WRONLY)
    guard fd >= 0 else { throw DriveError.io }
    defer { close(fd) }
    guard ftruncate(fd, off_t(bytes)) == 0 else { throw DriveError.io }
  }

  public static func allocated(_ url: URL) -> Int64 {
    let keys: Set<URLResourceKey> = [.totalFileAllocatedSizeKey]
    let value = try? url.resourceValues(forKeys: keys).totalFileAllocatedSize
    return Int64(value ?? 0)
  }

  public static func save(_ data: Data, to url: URL) throws {
    try FileManager.default.createDirectory(
      at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
    try data.write(to: url)
    try xattr(url, set: "1")
  }

  public static func keep(_ url: URL) throws {
    let fd = open(url.path, O_RDWR)
    guard fd >= 0 else { throw DriveError.io }
    defer { close(fd) }
    let head = [UInt8](repeating: 0, count: 4096)
    _ = head.withUnsafeBytes { write(fd, $0.baseAddress, 4096) }
    try xattr(url, set: "1")
  }

  public static func isKept(_ url: URL) -> Bool { xattr(url) == "1" }

  private static let keepKey = "dev.smeltery.loft.keep"

  private static func xattr(_ url: URL) -> String? {
    url.path.withCString { path in
      var buf = [CChar](repeating: 0, count: 8)
      let n = getxattr(path, keepKey, &buf, buf.count - 1, 0, 0)
      guard n > 0 else { return nil }
      return String(decoding: buf.prefix(Int(n)).map { UInt8(bitPattern: $0) }, as: UTF8.self)
    }
  }

  private static func xattr(_ url: URL, set value: String) throws {
    let data = Array(value.utf8)
    let ok = url.path.withCString { path in
      data.withUnsafeBytes {
        setxattr(path, keepKey, $0.baseAddress, data.count, 0, 0) == 0
      }
    }
    if !ok { throw DriveError.io }
  }
}
