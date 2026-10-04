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
  public let session: URLSession

  public init(origin: URL, token: String, session: URLSession = .shared) {
    self.origin = origin
    self.token = token
    self.session = session
  }

  public static func fromEnv() -> CloudClient {
    let origin = ProcessInfo.processInfo.environment["LOFT_API"] ?? "http://127.0.0.1:8787"
    let token = ProcessInfo.processInfo.environment["LOFT_TOKEN"] ?? "dev"
    return CloudClient(origin: URL(string: origin) ?? URL(string: "http://127.0.0.1:8787")!, token: token)
  }

  public static func alignedRange(offset: Int64, requested: Int64, alignment: Int, size: Int64)
    -> (offset: Int64, length: Int64)
  {
    guard size > 0, offset >= 0, offset < size, requested > 0 else { return (0, 0) }
    let a = Int64(max(alignment, 1))
    let start = (offset / a) * a
    var end = offset + min(requested, size - offset)
    let remainder = end % a
    if remainder != 0 { end += min(a - remainder, size - end) }
    return (start, end - start)
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
    let data = try await send(req)
    return try JSONDecoder().decode(ListBody.self, from: data).files
  }

  public func account() async throws -> Account {
    var req = URLRequest(url: origin.appendingPathComponent("v1").appendingPathComponent("me"))
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    let data = try await send(req)
    return try JSONDecoder().decode(Account.self, from: data)
  }

  public func fetch(id: String, offset: Int64, length: Int64, ifMatch: String? = nil) async throws -> Data {
    guard offset >= 0, length >= 0, offset <= Int64.max - length else { throw URLError(.badURL) }
    if length == 0 { return Data() }
    var req = URLRequest(url: contentURL(id: id))
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    req.setValue(rangeHeader(offset: offset, length: length), forHTTPHeaderField: "Range")
    if let ifMatch { req.setValue(ifMatch, forHTTPHeaderField: "If-Match") }
    let (data, response) = try await session.data(for: req)
    let http = try checked(response)
    let expected = "bytes \(offset)-\(offset + length - 1)/"
    guard http.statusCode == 206, data.count == length,
      http.value(forHTTPHeaderField: "Content-Range")?.hasPrefix(expected) == true else {
      throw URLError(.badServerResponse)
    }
    return data
  }

  public func keep(id: String) async throws {
    var req = URLRequest(
      url: origin.appendingPathComponent("v1").appendingPathComponent("files")
        .appendingPathComponent(id).appendingPathComponent("keep"))
    req.httpMethod = "POST"
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    _ = try await send(req)
  }

  public func remove(id: String) async throws {
    var req = URLRequest(
      url: origin.appendingPathComponent("v1").appendingPathComponent("files")
        .appendingPathComponent(id))
    req.httpMethod = "DELETE"
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    _ = try await send(req)
  }

  public func share(id: String) async throws -> String {
    var req = URLRequest(
      url: origin.appendingPathComponent("v1").appendingPathComponent("files")
        .appendingPathComponent(id).appendingPathComponent("share"))
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    let data = try await send(req)
    return try JSONDecoder().decode(ShareBody.self, from: data).url
  }

  public func requestFiles(folder: String) async throws -> String {
    var req = URLRequest(url: origin.appendingPathComponent("v1/requests"))
    req.httpMethod = "POST"
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
    req.httpBody = try JSONEncoder().encode(["folder": folder])
    let data = try await send(req)
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
    _ = try await send(req)
  }

  private struct ListBody: Codable { let files: [RemoteFile] }
  private struct ShareBody: Codable { let url: String }
}
