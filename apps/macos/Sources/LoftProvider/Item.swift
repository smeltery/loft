@preconcurrency import FileProvider
import LoftKit
import UniformTypeIdentifiers

@objc(LoftItem)
public final class LoftItem: NSObject, NSFileProviderItem {
  public let itemIdentifier: NSFileProviderItemIdentifier
  public let parentItemIdentifier: NSFileProviderItemIdentifier
  public let filename: String
  public let contentType: UTType
  public let documentSize: NSNumber?
  public var contentPolicy: NSFileProviderContentPolicy {
    if LocalPins.contains(itemIdentifier.rawValue) { return .downloadEagerlyAndKeepDownloaded }
    return itemIdentifier == .rootContainer ? .downloadLazily : .inherited
  }
  public let itemVersion: NSFileProviderItemVersion

  public init(_ file: RemoteFile) {
    itemIdentifier = NSFileProviderItemIdentifier(file.id)
    parentItemIdentifier = NSFileProviderItemIdentifier("folder:\(file.folder)")
    filename = file.name
    contentType = UTType(filenameExtension: (file.name as NSString).pathExtension) ?? .data
    documentSize = NSNumber(value: file.bytes)
    let stamp = Data(file.version.utf8)
    let metadata = Data("\(file.version):\(LocalPins.contains(file.id))".utf8)
    itemVersion = NSFileProviderItemVersion(contentVersion: stamp, metadataVersion: metadata)
  }

  public init(folder name: String) {
    itemIdentifier = NSFileProviderItemIdentifier("folder:\(name)")
    parentItemIdentifier = .rootContainer
    filename = name
    contentType = .folder
    documentSize = nil
    let stamp = Data(name.utf8)
    let metadata = Data("\(name):\(LocalPins.contains("folder:\(name)"))".utf8)
    itemVersion = NSFileProviderItemVersion(contentVersion: stamp, metadataVersion: metadata)
  }

  public init(root _: Bool) {
    itemIdentifier = .rootContainer
    parentItemIdentifier = .rootContainer
    filename = "Loft"
    contentType = .folder
    documentSize = nil
    let stamp = Data("loft".utf8)
    itemVersion = NSFileProviderItemVersion(contentVersion: stamp, metadataVersion: stamp)
  }
}
