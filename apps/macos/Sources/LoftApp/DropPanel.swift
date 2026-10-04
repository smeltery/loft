import AppKit
import LoftKit

@MainActor
final class DropPanel: NSObject {
  private let client: CloudClient
  private var window: NSPanel?
  private var pending: [URL] = []
  private var uploadIDs: [URL: String] = [:]
  private let folders = NSPopUpButton()
  private let message = NSTextField(wrappingLabelWithString: Chrome.releaseToAdd)
  private let upload = NSButton()
  private var uploading = false

  init(store: DriveStore, client: CloudClient) { self.client = client }

  func show(count: Int) {
    if window == nil { window = build() }
    if pending.isEmpty { message.stringValue = "Release to add \(count) item(s)" }
    window?.center()
    window?.orderFront(nil)
    Task {
      do {
        let files = try await client.list()
        let selected = folders.titleOfSelectedItem ?? "Inbox"
        folders.removeAllItems()
        folders.addItems(withTitles: Array(Set(files.map(\.folder)).union(["Inbox"])).sorted())
        folders.selectItem(withTitle: selected)
      } catch { message.stringValue = error.localizedDescription }
    }
  }

  func hide() { if pending.isEmpty && !uploading { window?.orderOut(nil) } }

  func ingest(_ urls: [URL]) {
    guard !uploading else { return }
    pending = urls
    uploadIDs = Dictionary(urls.map { ($0, UUID().uuidString) }, uniquingKeysWith: { first, _ in first })
    show(count: urls.count)
    message.stringValue = "Choose a folder for \(urls.count) file(s), then upload."
    upload.isEnabled = !pending.isEmpty
  }

  @objc private func send() {
    guard !uploading, !pending.isEmpty else { return }
    let destination = folders.titleOfSelectedItem ?? "Inbox"
    let selected = pending
    uploading = true
    upload.isEnabled = false
    folders.isEnabled = false
    Task {
      var failures: [URL] = []
      var failureMessage: String?
      for (index, url) in selected.enumerated() {
        message.stringValue = "Uploading \(index + 1) of \(selected.count): \(url.lastPathComponent)"
        do {
          guard let id = uploadIDs[url] else { throw CocoaError(.fileNoSuchFile) }
          try await client.upload(id: id, name: url.lastPathComponent, folder: destination, from: url)
        } catch {
          failures.append(url)
          failureMessage = error.localizedDescription
        }
      }
      pending = failures
      uploading = false
      upload.isEnabled = !failures.isEmpty
      folders.isEnabled = true
      upload.title = failures.isEmpty ? "Upload" : "Retry failed files"
      message.stringValue = failures.isEmpty ? "Uploaded \(selected.count) file(s) to \(destination)." : "\(failures.count) upload(s) failed. \(failureMessage ?? "Try again.")"
    }
  }

  @objc private func dismiss() {
    guard !uploading else { return }
    pending = []
    window?.orderOut(nil)
  }

  private func build() -> NSPanel {
    let panel = NSPanel(contentRect: NSRect(x: 0, y: 0, width: 360, height: 176), styleMask: [.titled, .nonactivatingPanel], backing: .buffered, defer: false)
    panel.title = "Add to Loft"
    panel.level = .statusBar
    message.frame = NSRect(x: 16, y: 108, width: 328, height: 50)
    folders.frame = NSRect(x: 16, y: 66, width: 328, height: 28)
    folders.addItem(withTitle: "Inbox")
    upload.title = "Upload"
    upload.target = self
    upload.action = #selector(send)
    upload.frame = NSRect(x: 176, y: 16, width: 168, height: 30)
    upload.isEnabled = false
    let close = NSButton(title: "Close", target: self, action: #selector(dismiss))
    close.frame = NSRect(x: 16, y: 16, width: 80, height: 30)
    for view in [message, folders, upload, close] { panel.contentView?.addSubview(view) }
    return panel
  }
}
