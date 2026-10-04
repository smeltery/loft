import AppKit
import LoftKit

@MainActor
final class TransferPanel: NSObject {
  private var window: NSPanel?
  private var bar: NSProgressIndicator?
  private var generation = UUID()
  private var task: Task<Void, Never>?
  private var retryAction: (() -> Void)?

  func show(file: DriveFile) {
    if window == nil { window = build() }
    update(received: 0, total: file.bytes)
    window?.center()
    window?.orderFront(nil)
  }

  func keep(file: DriveFile, completion: @escaping (URL) -> Void) {
    task?.cancel()
    let run = UUID()
    generation = run
    show(file: file)
    (window?.contentView?.viewWithTag(1) as? NSTextField)?.stringValue = "Waiting for Finder to download \(file.name)…"
    retryAction = { [weak self] in self?.keep(file: file, completion: completion) }
    task = Task { [self] in
      do {
        let url = try await LoftDomain.keep(file) { [weak self] received, total in
          Task { @MainActor in if self?.generation == run { self?.update(received: received, total: total) } }
        }
        try Task.checkCancellation()
        guard generation == run else { return }
        hide()
        completion(url)
      } catch {
        guard generation == run else { return }
        if let title = window?.contentView?.viewWithTag(1) as? NSTextField {
          title.stringValue = error is CancellationError ? "Download cancelled" : error.localizedDescription
        }
      }
    }
  }

  func update(received: Int64, total: Int64) {
    (window?.contentView?.viewWithTag(1) as? NSTextField)?.stringValue =
      "Downloaded \(Catalog.formatSize(received)) of \(Catalog.formatSize(total))"
    if let bar {
      bar.maxValue = Double(max(total, 1))
      bar.doubleValue = Double(received)
    }
  }

  func hide() { window?.orderOut(nil) }
  @objc private func cancel() {
    generation = UUID()
    task?.cancel()
    hide()
  }
  @objc private func retry() { retryAction?() }

  private func build() -> NSPanel {
    let panel = NSPanel(contentRect: NSRect(x: 0, y: 0, width: 420, height: 120), styleMask: [.titled, .nonactivatingPanel], backing: .buffered, defer: false)
    panel.title = "Loft downloads"
    panel.level = .statusBar
    let title = NSTextField(wrappingLabelWithString: "Preparing download…")
    title.tag = 1
    title.font = .systemFont(ofSize: 13, weight: .semibold)
    title.frame = NSRect(x: 16, y: 68, width: 388, height: 40)
    let bar = NSProgressIndicator(frame: NSRect(x: 16, y: 48, width: 388, height: 12))
    self.bar = bar
    bar.isIndeterminate = false
    let cancel = NSButton(title: "Close", target: self, action: #selector(cancel))
    cancel.frame = NSRect(x: 240, y: 10, width: 80, height: 28)
    let retry = NSButton(title: "Retry", target: self, action: #selector(retry))
    retry.frame = NSRect(x: 324, y: 10, width: 80, height: 28)
    for view in [title, bar, cancel, retry] { panel.contentView?.addSubview(view) }
    return panel
  }
}
