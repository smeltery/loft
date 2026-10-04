@preconcurrency import FileProvider
import Foundation
import CryptoKit
import LoftKit

@objc(LoftExtension)
public final class LoftExtension: NSObject, NSFileProviderReplicatedExtension,
  NSFileProviderPartialContentFetching, @unchecked Sendable
{
  private let client: CloudClient
  private let domain: NSFileProviderDomain

  @objc public required init(domain: NSFileProviderDomain) {
    self.domain = domain
    client = CloudClient.fromEnv()
    super.init()
  }

  public func invalidate() {}

  public func item(
    for identifier: NSFileProviderItemIdentifier, request: NSFileProviderRequest,
    completionHandler: @escaping @Sendable (NSFileProviderItem?, Error?) -> Void
  ) -> Progress {
    let progress = Progress(totalUnitCount: 1)
    let client = self.client
    let id = identifier
    let finish = completionHandler
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
      do {
        finish(LoftItem(try await client.file(id: id.rawValue)), nil)
      } catch { finish(nil, error) }
    }
    return progress
  }

  public func fetchContents(
    for itemIdentifier: NSFileProviderItemIdentifier, version: NSFileProviderItemVersion?,
    request: NSFileProviderRequest,
    completionHandler: @escaping @Sendable (URL?, NSFileProviderItem?, Error?) -> Void
  ) -> Progress {
    let progress = Progress(totalUnitCount: 1)
    let client = self.client
    let requestedVersion = version?.contentVersion
    let task = Task {
      do {
        let file = try await client.file(id: itemIdentifier.rawValue)
        if let requestedVersion, requestedVersion != Data(file.version.utf8) { throw CloudError(status: 412) }
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try await client.download(id: file.id, to: url, expectedVersion: file.version) { received, total in
          progress.totalUnitCount = max(total, 1)
          progress.completedUnitCount = received
        }
        progress.completedUnitCount = progress.totalUnitCount
        completionHandler(url, LoftItem(file), nil)
      } catch { completionHandler(nil, nil, error) }
    }
    progress.cancellationHandler = { task.cancel() }
    return progress
  }

  public func fetchPartialContents(
    for itemIdentifier: NSFileProviderItemIdentifier, version: NSFileProviderItemVersion,
    request: NSFileProviderRequest, minimalRange range: NSRange, aligningTo alignment: Int,
    options: NSFileProviderFetchContentsOptions,
    completionHandler: @escaping @Sendable (
      URL?, NSFileProviderItem?, NSRange, NSFileProviderMaterializationFlags, Error?
    ) -> Void
  ) -> Progress {
    let progress = Progress(totalUnitCount: 1)
    let client = self.client
    let itemId = itemIdentifier.rawValue
    let requestedVersion = version.contentVersion
    let finish = completionHandler
    let task = Task {
      do {
        let file = try await client.file(id: itemId)
        guard requestedVersion == Data(file.version.utf8) else { throw CloudError(status: 412) }
        let aligned = CloudClient.alignedRange(
          offset: Int64(range.location),
          requested: range.length == Int.max ? Int64.max : Int64(range.length),
          alignment: alignment, size: file.bytes)
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        var completed = false
        defer { if !completed { try? FileManager.default.removeItem(at: url) } }
        try Placeholder.create(at: url, bytes: file.bytes)
        let handle = try FileHandle(forWritingTo: url)
        defer { try? handle.close() }
        try handle.seek(toOffset: UInt64(aligned.offset))
        var received: Int64 = 0
        progress.totalUnitCount = max(aligned.length, 1)
        while received < aligned.length {
          try Task.checkCancellation()
          let data = try await client.fetch(id: file.id, offset: aligned.offset + received,
            length: min(1_048_576, aligned.length - received), ifMatch: file.etag)
          try handle.write(contentsOf: data)
          received += Int64(data.count)
          progress.completedUnitCount = received
        }
        try handle.close()
        try Task.checkCancellation()
        let got = NSRange(location: Int(aligned.offset), length: Int(aligned.length))
        progress.completedUnitCount = progress.totalUnitCount
        completed = true
        finish(url, LoftItem(file), got, [], nil)
      } catch {
        finish(nil, nil, range, [], error)
      }
    }
    progress.cancellationHandler = { task.cancel() }
    return progress
  }

  public func createItem(
    basedOn itemTemplate: NSFileProviderItem, fields: NSFileProviderItemFields, contents url: URL?,
    options: NSFileProviderCreateItemOptions, request: NSFileProviderRequest,
    completionHandler: @escaping @Sendable (NSFileProviderItem?, NSFileProviderItemFields, Bool, Error?) ->
      Void
  ) -> Progress {
    let progress = Progress(totalUnitCount: 1)
    let client = self.client
    let name = itemTemplate.filename
    let folder = itemTemplate.parentItemIdentifier.rawValue.hasPrefix("folder:")
      ? String(itemTemplate.parentItemIdentifier.rawValue.dropFirst("folder:".count)) : "Inbox"
    let id = SHA256.hash(data: Data(itemTemplate.itemIdentifier.rawValue.utf8)).map { String(format: "%02x", $0) }.joined()
    let task = Task {
      do {
        guard let url else { throw CocoaError(.featureUnsupported) }
        try await client.upload(id: id, name: name, folder: folder, from: url)
        let file = try await client.file(id: id)
        progress.completedUnitCount = 1
        completionHandler(LoftItem(file), [], false, nil)
      } catch { completionHandler(nil, fields, false, error) }
    }
    progress.cancellationHandler = { task.cancel() }
    return progress
  }

  public func modifyItem(
    _ item: NSFileProviderItem, baseVersion: NSFileProviderItemVersion,
    changedFields: NSFileProviderItemFields, contents newContents: URL?,
    options: NSFileProviderModifyItemOptions, request: NSFileProviderRequest,
    completionHandler: @escaping @Sendable (NSFileProviderItem?, NSFileProviderItemFields, Bool, Error?) ->
      Void
  ) -> Progress {
    let progress = Progress(totalUnitCount: 1)
    let client = self.client
    let id = item.itemIdentifier.rawValue
    let name = item.filename
    let folder = item.parentItemIdentifier.rawValue.hasPrefix("folder:")
      ? String(item.parentItemIdentifier.rawValue.dropFirst("folder:".count)) : "Inbox"
    let match = String(data: baseVersion.contentVersion, encoding: .utf8)
    let task = Task {
      do {
        guard let newContents else { throw CocoaError(.featureUnsupported) }
        try await client.upload(id: id, name: name, folder: folder, from: newContents, ifMatch: match)
        let file = try await client.file(id: id)
        progress.completedUnitCount = 1
        completionHandler(LoftItem(file), [], false, nil)
      } catch { completionHandler(nil, changedFields, false, error) }
    }
    progress.cancellationHandler = { task.cancel() }
    return progress
  }

  public func deleteItem(
    identifier: NSFileProviderItemIdentifier, baseVersion: NSFileProviderItemVersion,
    options: NSFileProviderDeleteItemOptions, request: NSFileProviderRequest,
    completionHandler: @escaping @Sendable (Error?) -> Void
  ) -> Progress {
    let progress = Progress(totalUnitCount: 1)
    let client = self.client
    let id = identifier.rawValue
    let finish = completionHandler
    let task = Task {
      do {
        guard !id.hasPrefix("folder:") else { throw CocoaError(.featureUnsupported) }
        try await client.remove(id: id)
        progress.completedUnitCount = 1
        finish(nil)
      } catch { finish(error) }
    }
    progress.cancellationHandler = { task.cancel() }
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
    completionHandler: @escaping @Sendable (Error?) -> Void
  ) -> Progress {
    let progress = Progress(totalUnitCount: 1)
    let client = self.client
    let domain = self.domain
    let task = Task {
      do {
        guard identifier.rawValue == "dev.smeltery.loft.keep",
          let manager = NSFileProviderManager(for: domain) else { throw CocoaError(.featureUnsupported) }
        let files = try await client.list()
        for id in ids {
          LocalPins.set(id.rawValue, pinned: true)
          let children = id.rawValue.hasPrefix("folder:")
            ? files.filter { $0.folder == String(id.rawValue.dropFirst(7)) }.map { NSFileProviderItemIdentifier($0.id) }
            : [id]
          for child in children {
            LocalPins.set(child.rawValue, pinned: true)
            try await manager.requestDownloadForItem(withIdentifier: child)
          }
        }
        try await manager.signalEnumerator(for: .rootContainer)
        progress.completedUnitCount = 1
        completionHandler(nil)
      } catch { completionHandler(error) }
    }
    progress.cancellationHandler = { task.cancel() }
    return progress
  }
}
