import AppKit
import LoftKit

@MainActor
final class TransferPanel {
  private var window: NSPanel?

  func show(file: DriveFile) {
    if window == nil { window = build() }
    if let title = window?.contentView?.viewWithTag(1) as? NSTextField {
      title.stringValue = "Downloading \(Catalog.formatSize(file.bytes / 2)) of \(Catalog.formatSize(file.bytes))"
    }
    window?.center()
    window?.orderFront(nil)
  }

  func hide() { window?.orderOut(nil) }

  private func build() -> NSPanel {
    let panel = NSPanel(
      contentRect: NSRect(x: 0, y: 0, width: 360, height: 88),
      styleMask: [.titled, .nonactivatingPanel],
      backing: .buffered,
      defer: false
    )
    panel.title = "Finder"
    panel.level = .statusBar
    let title = NSTextField(labelWithString: Chrome.transferTitle)
    title.tag = 1
    title.font = .systemFont(ofSize: 13, weight: .semibold)
    title.frame = NSRect(x: 16, y: 44, width: 328, height: 20)
    let sub = NSTextField(labelWithString: Chrome.keepSubtitle)
    sub.font = .systemFont(ofSize: 12)
    sub.textColor = .secondaryLabelColor
    sub.frame = NSRect(x: 16, y: 20, width: 328, height: 18)
    panel.contentView?.addSubview(title)
    panel.contentView?.addSubview(sub)
    return panel
  }
}
