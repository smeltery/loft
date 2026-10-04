@preconcurrency import FileProvider
import LoftKit

public final class LoftEnumerator: NSObject, NSFileProviderEnumerator, @unchecked Sendable {
  private let client: CloudClient
  private let container: NSFileProviderItemIdentifier

  public init(client: CloudClient, container: NSFileProviderItemIdentifier) {
    self.client = client
    self.container = container
  }

  public func invalidate() {}

  public func enumerateItems(
    for observer: NSFileProviderEnumerationObserver, startingAt page: NSFileProviderPage
  ) {
    let client = self.client
    let container = self.container
    nonisolated(unsafe) let obs = observer
    Task {
      do {
        let files = try await client.list()
        if container == .rootContainer {
          var names = Set<String>()
          files.forEach { names.insert($0.folder) }
          obs.didEnumerate(names.sorted().map { LoftItem(folder: $0) })
        } else if container.rawValue.hasPrefix("folder:") {
          let name = String(container.rawValue.dropFirst("folder:".count))
          obs.didEnumerate(files.filter { $0.folder == name }.map(LoftItem.init))
        }
        obs.finishEnumerating(upTo: nil)
      } catch { obs.finishEnumeratingWithError(error) }
    }
  }
}
