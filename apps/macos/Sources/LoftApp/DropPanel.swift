import AppKit
import LoftKit

@MainActor
final class DropPanel {
  private let drive: URL
  private var window: NSPanel?

  init(drive: URL) {
    self.drive = drive
  }

  func show(count: Int) {
    if window == nil { window = build() }
    if let label = window?.contentView?.viewWithTag(1) as? NSTextField {
      let noun = count == 1 ? Chrome.oneItem : "\(count) items"
      label.stringValue = noun
    }
    window?.center()
    window?.orderFront(nil)
  }

  func hide() {
    window?.orderOut(nil)
  }

  func ingest(_ urls: [URL]) {
    let folder = Catalog.folders.first ?? "Client Work"
    let dest = drive.appendingPathComponent(folder, isDirectory: true)
    for url in urls {
      let target = dest.appendingPathComponent(url.lastPathComponent)
      try? FileManager.default.copyItem(at: url, to: target)
    }
    hide()
  }

  private func build() -> NSPanel {
    let panel = NSPanel(
      contentRect: NSRect(x: 0, y: 0, width: 280, height: 220),
      styleMask: [.borderless, .nonactivatingPanel],
      backing: .buffered,
      defer: false
    )
    panel.isOpaque = false
    panel.backgroundColor = .clear
    panel.level = .statusBar
    let box = NSVisualEffectView(frame: NSRect(x: 12, y: 120, width: 256, height: 88))
    box.material = .hudWindow
    box.state = .active
    box.wantsLayer = true
    box.layer?.cornerRadius = 12
    let title = NSTextField(labelWithString: Chrome.releaseToAdd)
    title.font = .systemFont(ofSize: 15, weight: .semibold)
    title.frame = NSRect(x: 16, y: 44, width: 224, height: 22)
    let count = NSTextField(labelWithString: Chrome.oneItem)
    count.tag = 1
    count.font = .systemFont(ofSize: 12)
    count.frame = NSRect(x: 16, y: 20, width: 224, height: 18)
    box.addSubview(title)
    box.addSubview(count)
    let hint = NSTextField(labelWithString: Chrome.intoFolder)
    hint.font = .systemFont(ofSize: 11)
    hint.textColor = .secondaryLabelColor
    hint.frame = NSRect(x: 16, y: 96, width: 248, height: 16)
    panel.contentView?.addSubview(box)
    panel.contentView?.addSubview(hint)
    var y = 64.0
    for folder in Catalog.folders {
      let row = NSTextField(labelWithString: folder)
      row.frame = NSRect(x: 16, y: y, width: 248, height: 20)
      panel.contentView?.addSubview(row)
      y -= 22
    }
    return panel
  }
}
