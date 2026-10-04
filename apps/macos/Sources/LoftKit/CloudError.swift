import Foundation

public struct CloudError: Error, LocalizedError, Sendable {
  public let status: Int

  public init(status: Int) { self.status = status }

  public var errorDescription: String? {
    switch status {
    case 401, 403: return "Loft could not authenticate. Check your access token."
    case 404: return "This file is no longer available."
    case 409, 412: return "The file changed in the cloud. Refresh before trying again."
    case 416: return "Loft received an invalid file range. Refresh and try again."
    default: return "The Loft server returned an error (\(status)). Try again."
    }
  }
}

extension CloudClient {
  func checked(_ response: URLResponse) throws -> HTTPURLResponse {
    guard let http = response as? HTTPURLResponse else { throw URLError(.badServerResponse) }
    guard (200..<300).contains(http.statusCode) else { throw CloudError(status: http.statusCode) }
    return http
  }

  func send(_ request: URLRequest) async throws -> Data {
    let (data, response) = try await session.data(for: request)
    _ = try checked(response)
    return data
  }

  public func file(id: String) async throws -> RemoteFile {
    var request = URLRequest(url: contentURL(id: id).deletingLastPathComponent())
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    return try JSONDecoder().decode(RemoteFile.self, from: await send(request))
  }
}
