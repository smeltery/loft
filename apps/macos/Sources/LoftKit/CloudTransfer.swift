import Darwin
import Foundation

extension CloudClient {
  public func download(
    id: String, to destination: URL, expectedVersion: String? = nil,
    progress: @Sendable (Int64, Int64) -> Void = { _, _ in }
  ) async throws {
    let metadata = try await file(id: id)
    if let expectedVersion, expectedVersion != metadata.version { throw CloudError(status: 412) }
    guard metadata.bytes >= 0 else { throw URLError(.badServerResponse) }
    let manager = FileManager.default
    try manager.createDirectory(at: destination.deletingLastPathComponent(), withIntermediateDirectories: true)
    let temporary = destination.deletingLastPathComponent().appendingPathComponent(".\(UUID().uuidString).download")
    guard manager.createFile(atPath: temporary.path, contents: nil) else { throw DriveError.io }
    defer { try? manager.removeItem(at: temporary) }
    let handle = try FileHandle(forWritingTo: temporary)
    do {
      var offset: Int64 = 0
      progress(0, metadata.bytes)
      while offset < metadata.bytes {
        try Task.checkCancellation()
        let length = min(1_048_576, metadata.bytes - offset)
        let data = try await fetch(id: id, offset: offset, length: length, ifMatch: metadata.etag)
        try handle.write(contentsOf: data)
        offset += Int64(data.count)
        progress(offset, metadata.bytes)
      }
      try handle.synchronize()
      try handle.close()
      try Task.checkCancellation()
      try Placeholder.keep(temporary)
      // Atomic same-filesystem replacement preserves the old copy on all transfer failures.
      guard rename(temporary.path, destination.path) == 0 else { throw DriveError.io }
    } catch {
      try? handle.close()
      throw error
    }
  }

  public func upload(id: String, name: String, folder: String, from source: URL, ifMatch: String? = nil) async throws {
    let values = try source.resourceValues(forKeys: [.isRegularFileKey])
    guard values.isRegularFile == true else { throw CocoaError(.fileReadUnsupportedScheme) }
    var request = URLRequest(url: contentURL(id: id))
    request.httpMethod = "PUT"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue(name, forHTTPHeaderField: "X-Loft-Name")
    request.setValue(folder, forHTTPHeaderField: "X-Loft-Folder")
    if let ifMatch { request.setValue(ifMatch, forHTTPHeaderField: "If-Match") }
    let (_, response) = try await session.upload(for: request, fromFile: source)
    _ = try checked(response)
  }
}
