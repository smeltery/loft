import Foundation
import LoftKit

// Each check awaits its requests before replacing the transport handler.
final class StubProtocol: URLProtocol, @unchecked Sendable {
  nonisolated(unsafe) static var handler: @Sendable (URLRequest) throws -> (Int, [String: String], Data) = { _ in (500, [:], Data()) }
  override class func canInit(with request: URLRequest) -> Bool { true }
  override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
  override func startLoading() {
    do {
      let (status, headers, data) = try Self.handler(request)
      let response = HTTPURLResponse(url: request.url!, statusCode: status, httpVersion: nil, headerFields: headers)!
      client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
      client?.urlProtocol(self, didLoad: data)
      client?.urlProtocolDidFinishLoading(self)
    } catch { client?.urlProtocol(self, didFailWithError: error) }
  }
  override func stopLoading() {}
}

final class RecordedProgress: @unchecked Sendable {
  private let lock = NSLock()
  private var values: [Int64] = []
  func append(_ value: Int64) { lock.lock(); defer { lock.unlock() }; values.append(value) }
  func snapshot() -> [Int64] { lock.lock(); defer { lock.unlock() }; return values }
}

enum CloudChecks {
  static func run() async throws {
    let config = URLSessionConfiguration.ephemeral
    config.protocolClasses = [StubProtocol.self]
    let session = URLSession(configuration: config)
    defer { session.invalidateAndCancel() }
    let cloud = CloudClient(origin: URL(string: "https://loft.test")!, token: "test", session: session)
    for code in [401, 404, 412, 500] {
      StubProtocol.handler = { _ in (code, [:], Data("failure".utf8)) }
      try await fails(code) { _ = try await cloud.list() }
      try await fails(code) { _ = try await cloud.account() }
      try await fails(code) { _ = try await cloud.fetch(id: "file", offset: 0, length: 1) }
      try await fails(code) { try await cloud.keep(id: "file") }
      try await fails(code) { try await cloud.remove(id: "file") }
      try await fails(code) { try await cloud.put(id: "file", name: "file", folder: "Inbox", body: Data()) }
    }
    let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
    try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    defer { try? FileManager.default.removeItem(at: directory) }
    let destination = directory.appendingPathComponent("saved.bin")
    let original = Data("original local bytes".utf8)
    try original.write(to: destination)
    try Placeholder.keep(destination)
    guard try Data(contentsOf: destination) == original else { fatalError("keep changed file bytes") }
    let payload = Data((0..<(2_097_152 + 17)).map { UInt8($0 % 251) })
    let metadata = try JSONSerialization.data(withJSONObject: ["id": "file", "name": "saved.bin", "folder": "Inbox", "kind": "application/octet-stream", "bytes": payload.count, "kept": false, "etag": "v1"])
    StubProtocol.handler = { request in
      if request.url!.path.hasSuffix("/content") {
        guard request.value(forHTTPHeaderField: "If-Match") == "v1" else { fatalError("missing version guard") }
        let range = request.value(forHTTPHeaderField: "Range")!.dropFirst(6).split(separator: "-").map { Int($0)! }
        return (206, ["Content-Range": "bytes \(range[0])-\(range[1])/\(payload.count)"], payload.subdata(in: range[0]..<(range[1] + 1)))
      }
      return (200, [:], metadata)
    }
    let progress = RecordedProgress()
    try await cloud.download(id: "file", to: destination) { received, _ in progress.append(received) }
    guard try Data(contentsOf: destination) == payload else { fatalError("download truncated or corrupted") }
    guard progress.snapshot() == [0, 1_048_576, 2_097_152, Int64(payload.count)] else { fatalError("incorrect download progress") }
    guard Placeholder.isKept(destination) else { fatalError("complete download not marked kept") }
    let successfulResponse = StubProtocol.handler
    for failure in ["http", "network", "short"] {
      try original.write(to: destination)
      StubProtocol.handler = { request in
        if request.value(forHTTPHeaderField: "Range")?.hasPrefix("bytes=1048576-") == true {
          if failure == "network" { throw URLError(.networkConnectionLost) }
          if failure == "http" { return (412, [:], Data()) }
          return (206, ["Content-Range": "bytes 1048576-2097151/\(payload.count)"], Data([0]))
        }
        return try successfulResponse(request)
      }
      do { try await cloud.download(id: "file", to: destination); fatalError("accepted partial failure") }
      catch is CloudError {} catch is URLError {}
      guard try Data(contentsOf: destination) == original else { fatalError("partial transfer destroyed local bytes") }
      guard try FileManager.default.contentsOfDirectory(atPath: directory.path) == ["saved.bin"] else { fatalError("partial transfer leaked") }
    }
    for code in [401, 412, 500] {
      try original.write(to: destination)
      StubProtocol.handler = { request in
        request.url!.path.hasSuffix("/content") ? (code, [:], Data("failure".utf8)) : (200, [:], metadata)
      }
      try await fails(code) { try await cloud.download(id: "file", to: destination) }
      guard try Data(contentsOf: destination) == original else { fatalError("failed download replaced local bytes") }
      guard try FileManager.default.contentsOfDirectory(atPath: directory.path) == ["saved.bin"] else { fatalError("temporary download leaked") }
    }
    StubProtocol.handler = { request in request.url!.path.hasSuffix("/content") ? (200, [:], payload) : (200, [:], metadata) }
    do { _ = try await cloud.fetch(id: "file", offset: 5, length: 10); fatalError("accepted ignored range") }
    catch is URLError {}
    let store = DriveStore(root: directory)
    let file = try JSONDecoder().decode(RemoteFile.self, from: metadata)
    let kept = store.url(file.asDriveFile)
    try Placeholder.save(original, to: kept)
    try store.sync([file])
    guard try Data(contentsOf: kept) == original else { fatalError("metadata sync truncated local copy") }
    print("cloud integrity checks ok")
  }

  private static func fails(_ code: Int, operation: () async throws -> Void) async throws {
    do { try await operation(); fatalError("HTTP \(code) reported success") }
    catch let error as CloudError { guard error.status == code else { fatalError("wrong HTTP error") } }
  }
}
