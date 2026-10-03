import AppKit
import LoftKit

@MainActor
final class DropPanel {
  private let store: DriveStore
  private let client: CloudClient
  private var window: NSPanel?

  init(store: DriveStore, client: CloudClient) {
    self.store = store
    self.client = client
  }

  func show(count: Int) {
    if window == nil { window = build() }
    if let label = window?.contentView?.viewWithTag(1) as? NSTextField {
      label.stringValue = count == 1 ? Chrome.oneItem : "\(count) items"
    }
    place()
    window?.orderFront(nil)
  }

  func hide() { window?.orderOut(nil) }

  func ingest(_ urls: [URL]) {
    let folder = Catalog.dropFolders.first ?? "Client Work"
    let client = self.client
    let store = self.store
    Task {
      for url in urls {
        let body = (try? Data(contentsOf: url)) ?? Data()
        let id = url.lastPathComponent.replacingOccurrences(of: " ", with: "-")
        try? await client.put(id: id, name: url.lastPathComponent, folder: folder, body: body)
      }
      if let files = try? await client.list() { try? store.sync(files) }
    }
    hide()
  }

  private func place() {
    guard let window, let screen = NSScreen.main else { return }
    let bar = screen.visibleFrame.maxY
    let x = screen.frame.midX - window.frame.width / 2
    window.setFrameOrigin(NSPoint(x: x, y: bar - window.frame.height - 12))
  }

  private func build() -> NSPanel {
    let panel = NSPanel(
      contentRect: NSRect(x: 0, y: 0, width: 280, height: 236),
      styleMask: [.borderless, .nonactivatingPanel],
      backing: .buffered,
      defer: false
    )
    panel.isOpaque = false
    panel.backgroundColor = .clear
    panel.level = .statusBar
    panel.hasShadow = true
    let hud = NSVisualEffectView(frame: NSRect(x: 16, y: 124, width: 248, height: 96))
    hud.material = .hudWindow
    hud.state = .active
    hud.wantsLayer = true
    hud.layer?.cornerRadius = 14
    let title = NSTextField(labelWithString: Chrome.releaseToAdd)
    title.font = .systemFont(ofSize: 15, weight: .semibold)
    title.alignment = .center
    title.frame = NSRect(x: 12, y: 52, width: 224, height: 22)
    let count = NSTextField(labelWithString: Chrome.oneItem)
    count.tag = 1
    count.font = .systemFont(ofSize: 13)
    count.alignment = .center
    count.frame = NSRect(x: 12, y: 28, width: 224, height: 18)
    hud.addSubview(title)
    hud.addSubview(count)
    let hint = NSTextField(labelWithString: Chrome.intoFolder)
    hint.font = .systemFont(ofSize: 12)
    hint.textColor = .secondaryLabelColor
    hint.alignment = .center
    hint.frame = NSRect(x: 16, y: 96, width: 248, height: 18)
    panel.contentView?.addSubview(hud)
    panel.contentView?.addSubview(hint)
    var y = 70.0
    for folder in Catalog.dropFolders {
      let row = NSTextField(labelWithString: folder)
      row.font = .systemFont(ofSize: 13, weight: .medium)
      row.alignment = .center
      row.frame = NSRect(x: 16, y: y, width: 248, height: 20)
      panel.contentView?.addSubview(row)
      y -= 22
    }
    return panel
  }
}
