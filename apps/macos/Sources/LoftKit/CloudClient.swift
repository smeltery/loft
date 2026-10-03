import Foundation

public struct RemoteFile: Equatable, Sendable, Codable {
  public let id: String
  public let name: String
  public let folder: String
  public let kind: String
  public let bytes: Int64
  public let kept: Bool
  public let etag: String?

  public var version: String { etag ?? id }
}

public struct Account: Equatable, Sendable, Codable {
  public let email: String
  public let files: Int
  public let bytes: Int64
}

public struct CloudClient: Sendable {
  public let origin: URL
  public let token: String

  public init(origin: URL, token: String) {
    self.origin = origin
    self.token = token
  }

  public static func fromEnv() -> CloudClient {
    let origin = ProcessInfo.processInfo.environment["LOFT_API"] ?? "http://127.0.0.1:8787"
    let token = ProcessInfo.processInfo.environment["LOFT_TOKEN"] ?? "dev"
    return CloudClient(origin: URL(string: origin) ?? URL(string: "http://127.0.0.1:8787")!, token: token)
  }

  public static func alignedRange(offset: Int64, requested: Int64, alignment: Int, size: Int64)
    -> (offset: Int64, length: Int64)
  {
    guard size > 0 else { return (0, 0) }
    let a = Int64(max(alignment, 1))
    let start = min(max(0, (offset / a) * a), size - 1)
    var len: Int64
    if requested < 0 || requested == Int64.max {
      len = min(1_048_576, size - start)
    } else {
      len = requested
    }
    let rem = len % a
    if rem != 0 { len += a - rem }
    if start + len > size { len = size - start }
    return (start, max(len, 0))
  }

  public func rangeHeader(offset: Int64, length: Int64) -> String {
    "bytes=\(offset)-\(offset + length - 1)"
  }

  public func contentURL(id: String) -> URL {
    origin.appendingPathComponent("v1").appendingPathComponent("files")
      .appendingPathComponent(id).appendingPathComponent("content")
  }

  public func list() async throws -> [RemoteFile] {
    var req = URLRequest(url: origin.appendingPathComponent("v1").appendingPathComponent("files"))
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    let (data, _) = try await URLSession.shared.data(for: req)
    return try JSONDecoder().decode(ListBody.self, from: data).files
  }

  public func account() async throws -> Account {
    var req = URLRequest(url: origin.appendingPathComponent("v1").appendingPathComponent("me"))
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    let (data, _) = try await URLSession.shared.data(for: req)
    return try JSONDecoder().decode(Account.self, from: data)
  }

  public func fetch(id: String, offset: Int64, length: Int64) async throws -> Data {
    var req = URLRequest(url: contentURL(id: id))
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    req.setValue(rangeHeader(offset: offset, length: length), forHTTPHeaderField: "Range")
    let (data, _) = try await URLSession.shared.data(for: req)
    return data
  }

  public func download(id: String, to url: URL) async throws {
    var req = URLRequest(url: contentURL(id: id))
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    let (data, _) = try await URLSession.shared.data(for: req)
    try Placeholder.save(data, to: url)
  }

  public func keep(id: String) async throws {
    var req = URLRequest(
      url: origin.appendingPathComponent("v1").appendingPathComponent("files")
        .appendingPathComponent(id).appendingPathComponent("keep"))
    req.httpMethod = "POST"
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    _ = try await URLSession.shared.data(for: req)
  }

  public func remove(id: String) async throws {
    var req = URLRequest(
      url: origin.appendingPathComponent("v1").appendingPathComponent("files")
        .appendingPathComponent(id))
    req.httpMethod = "DELETE"
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    _ = try await URLSession.shared.data(for: req)
  }

  public func share(id: String) async throws -> String {
    var req = URLRequest(
      url: origin.appendingPathComponent("v1").appendingPathComponent("files")
        .appendingPathComponent(id).appendingPathComponent("share"))
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    let (data, _) = try await URLSession.shared.data(for: req)
    return try JSONDecoder().decode(ShareBody.self, from: data).url
  }

  public func put(id: String, name: String, folder: String, body: Data, ifMatch: String? = nil)
    async throws
  {
    var req = URLRequest(url: contentURL(id: id))
    req.httpMethod = "PUT"
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    req.setValue(name, forHTTPHeaderField: "X-Loft-Name")
    req.setValue(folder, forHTTPHeaderField: "X-Loft-Folder")
    if let ifMatch { req.setValue(ifMatch, forHTTPHeaderField: "If-Match") }
    req.httpBody = body
    _ = try await URLSession.shared.data(for: req)
  }

  private struct ListBody: Codable { let files: [RemoteFile] }
  private struct ShareBody: Codable { let url: String }
}
