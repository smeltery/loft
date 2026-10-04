@preconcurrency import FileProvider
import AppKit
import LoftKit

enum LoftDomain {
  static let id = NSFileProviderDomainIdentifier("dev.smeltery.loft.drive")
  static var domain: NSFileProviderDomain { NSFileProviderDomain(identifier: id, displayName: "Loft") }

  static func register() {
    NSFileProviderManager.add(domain) { error in
      if let error { NSLog("loft file provider: \(error.localizedDescription)") }
    }
  }

  static func userURL(for identifier: NSFileProviderItemIdentifier = .rootContainer) async throws -> URL {
    guard let manager = NSFileProviderManager(for: domain) else { throw CocoaError(.fileNoSuchFile) }
    return try await manager.getUserVisibleURL(for: identifier)
  }

  @MainActor
  static func openFinder() {
    Task {
      do { NSWorkspace.shared.open(try await userURL()) }
      catch {
        let alert = NSAlert()
        alert.messageText = "Enable the Loft drive in Finder"
        alert.informativeText = "Open Finder and enable Loft under Locations. A signed Loft File Provider installation is required.\n\n\(error.localizedDescription)"
        alert.runModal()
      }
    }
  }

  static func keep(_ file: DriveFile, progress: @escaping @Sendable (Int64, Int64) -> Void) async throws -> URL {
    guard let manager = NSFileProviderManager(for: domain) else { throw CocoaError(.fileNoSuchFile) }
    let identifier = NSFileProviderItemIdentifier(file.id)
    LocalPins.set(file.id, pinned: true)
    try await manager.signalEnumerator(for: NSFileProviderItemIdentifier("folder:\(file.folder)"))
    let url = try await userURL(for: identifier)
    // Coordinated reads wait for actual materialization; requestDownload only acknowledges scheduling.
    let task = Task.detached {
      var coordinationError: NSError?
      var readError: Error?
      NSFileCoordinator().coordinate(readingItemAt: url, options: [], error: &coordinationError) { local in
        do {
          let handle = try FileHandle(forReadingFrom: local)
          defer { try? handle.close() }
          var received: Int64 = 0
          progress(0, file.bytes)
          while true {
            try Task.checkCancellation()
            let data = try handle.read(upToCount: 1_048_576) ?? Data()
            if data.isEmpty { break }
            received += Int64(data.count)
            progress(received, file.bytes)
          }
          guard received == file.bytes else { throw URLError(.badServerResponse) }
        } catch { readError = error }
      }
      if let error = coordinationError ?? readError as NSError? { throw error }
      return url
    }
    return try await withTaskCancellationHandler { try await task.value } onCancel: { task.cancel() }
  }
}
