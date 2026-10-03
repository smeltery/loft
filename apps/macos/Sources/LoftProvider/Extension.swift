@preconcurrency import FileProvider
import Foundation
import LoftKit

@objc(LoftExtension)
public final class LoftExtension: NSObject, NSFileProviderReplicatedExtension,
  NSFileProviderPartialContentFetching, @unchecked Sendable
{
  private let client: CloudClient

  @objc public required init(domain: NSFileProviderDomain) {
    client = CloudClient.fromEnv()
    super.init()
  }

  public func invalidate() {}

  public func item(
    for identifier: NSFileProviderItemIdentifier, request: NSFileProviderRequest,
    completionHandler: @escaping (NSFileProviderItem?, Error?) -> Void
  ) -> Progress {
    let progress = Progress(totalUnitCount: 1)
    let client = self.client
    let id = identifier
    nonisolated(unsafe) let finish = completionHandler
    Task {
      defer { progress.completedUnitCount = 1 }
      if id == .rootContainer {
        finish(LoftItem(root: true), nil)
        return
      }
      if id.rawValue.hasPrefix("folder:") {
        finish(LoftItem(folder: String(id.rawValue.dropFirst("folder:".count))), nil)
        return
      }
      let files = try? await client.list()
      if let hit = files?.first(where: { $0.id == id.rawValue }) {
        finish(LoftItem(hit), nil)
      } else {
        finish(
          nil,
          NSError(domain: NSFileProviderErrorDomain, code: NSFileProviderError.noSuchItem.rawValue))
      }
    }
    return progress
  }

  public func fetchContents(
    for itemIdentifier: NSFileProviderItemIdentifier, version: NSFileProviderItemVersion?,
    request: NSFileProviderRequest,
    completionHandler: @escaping (URL?, NSFileProviderItem?, Error?) -> Void
  ) -> Progress {
    fetchPartialContents(
      for: itemIdentifier, version: version ?? NSFileProviderItemVersion(), request: request,
      minimalRange: NSRange(location: 0, length: Int.max), aligningTo: 1, options: [],
      completionHandler: { url, item, _, _, error in
        completionHandler(url, item, error)
      })
  }

  public func fetchPartialContents(
    for itemIdentifier: NSFileProviderItemIdentifier, version: NSFileProviderItemVersion,
    request: NSFileProviderRequest, minimalRange range: NSRange, aligningTo alignment: Int,
    options: NSFileProviderFetchContentsOptions,
    completionHandler: @escaping (
      URL?, NSFileProviderItem?, NSRange, NSFileProviderMaterializationFlags, Error?
    ) -> Void
  ) -> Progress {
    let progress = Progress(totalUnitCount: 1)
    let client = self.client
    let itemId = itemIdentifier.rawValue
    nonisolated(unsafe) let finish = completionHandler
    Task {
      do {
        let files = try await client.list()
        guard let file = files.first(where: { $0.id == itemId }) else {
          throw NSError(
            domain: NSFileProviderErrorDomain, code: NSFileProviderError.noSuchItem.rawValue)
        }
        let aligned = CloudClient.alignedRange(
          offset: Int64(range.location),
          requested: range.length == Int.max ? Int64.max : Int64(range.length),
          alignment: alignment, size: file.bytes)
        let data = try await client.fetch(id: file.id, offset: aligned.offset, length: aligned.length)
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(file.id)
        try Placeholder.create(at: url, bytes: file.bytes)
        let handle = try FileHandle(forWritingTo: url)
        try handle.seek(toOffset: UInt64(aligned.offset))
        try handle.write(contentsOf: data)
        try handle.close()
        let got = NSRange(location: Int(aligned.offset), length: data.count)
        progress.completedUnitCount = 1
        finish(url, LoftItem(file), got, [], nil)
      } catch {
        finish(nil, nil, range, [], error)
      }
    }
    return progress
  }

  public func createItem(
    basedOn itemTemplate: NSFileProviderItem, fields: NSFileProviderItemFields, contents url: URL?,
    options: NSFileProviderCreateItemOptions, request: NSFileProviderRequest,
    completionHandler: @escaping (NSFileProviderItem?, NSFileProviderItemFields, Bool, Error?) ->
      Void
  ) -> Progress {
    let progress = Progress(totalUnitCount: 1)
    let client = self.client
    let name = itemTemplate.filename
    let body = url.flatMap { try? Data(contentsOf: $0) }
    let folder = itemTemplate.parentItemIdentifier.rawValue.hasPrefix("folder:")
      ? String(itemTemplate.parentItemIdentifier.rawValue.dropFirst("folder:".count))
      : "Inbox"
    nonisolated(unsafe) let finish = completionHandler
    nonisolated(unsafe) let template = itemTemplate
    Task {
      defer { progress.completedUnitCount = 1 }
      guard let body else {
        finish(template, [], false, nil)
        return
      }
      try? await client.put(id: name, name: name, folder: folder, body: body)
      finish(template, [], false, nil)
    }
    return progress
  }

  public func modifyItem(
    _ item: NSFileProviderItem, baseVersion: NSFileProviderItemVersion,
    changedFields: NSFileProviderItemFields, contents newContents: URL?,
    options: NSFileProviderModifyItemOptions, request: NSFileProviderRequest,
    completionHandler: @escaping (NSFileProviderItem?, NSFileProviderItemFields, Bool, Error?) ->
      Void
  ) -> Progress {
    let progress = Progress(totalUnitCount: 1)
    let client = self.client
    let body = newContents.flatMap { try? Data(contentsOf: $0) }
    let id = item.itemIdentifier.rawValue
    let folder = item.parentItemIdentifier.rawValue.hasPrefix("folder:")
      ? String(item.parentItemIdentifier.rawValue.dropFirst("folder:".count)) : "Inbox"
    nonisolated(unsafe) let finish = completionHandler
    nonisolated(unsafe) let current = item
    Task {
      defer { progress.completedUnitCount = 1 }
      if let body {
        let match = String(data: baseVersion.contentVersion, encoding: .utf8)
        try? await client.put(id: id, name: item.filename, folder: folder, body: body, ifMatch: match)
      }
      finish(current, [], false, nil)
    }
    return progress
  }

  public func deleteItem(
    identifier: NSFileProviderItemIdentifier, baseVersion: NSFileProviderItemVersion,
    options: NSFileProviderDeleteItemOptions, request: NSFileProviderRequest,
    completionHandler: @escaping (Error?) -> Void
  ) -> Progress {
    let progress = Progress(totalUnitCount: 1)
    let client = self.client
    let id = identifier.rawValue
    nonisolated(unsafe) let finish = completionHandler
    Task {
      if !id.hasPrefix("folder:") { try? await client.remove(id: id) }
      progress.completedUnitCount = 1
      finish(nil)
    }
    return progress
  }

  public func enumerator(
    for containerItemIdentifier: NSFileProviderItemIdentifier, request: NSFileProviderRequest
  ) throws -> NSFileProviderEnumerator {
    LoftEnumerator(client: client, container: containerItemIdentifier)
  }

  public func performAction(
    identifier: NSFileProviderExtensionActionIdentifier,
    onItemsWithIdentifiers ids: [NSFileProviderItemIdentifier],
    completionHandler: @escaping (Error?) -> Void
  ) -> Progress {
    let progress = Progress(totalUnitCount: 1)
    let client = self.client
    nonisolated(unsafe) let finish = completionHandler
    Task {
      if identifier.rawValue == "dev.smeltery.loft.keep" {
        for id in ids where !id.rawValue.hasPrefix("folder:") {
          try? await client.keep(id: id.rawValue)
        }
      }
      progress.completedUnitCount = 1
      finish(nil)
    }
    return progress
  }
}
