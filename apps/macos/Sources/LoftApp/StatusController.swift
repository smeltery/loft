import AppKit
import LoftKit

@MainActor
final class StatusController: NSObject {
  private let item: NSStatusItem
  private let drive: URL
  private let onSearch: () -> Void
  private let onSettings: () -> Void
  private let drop: DropPanel
  private let catcher: DropCatcher

  init(drive: URL, onSearch: @escaping () -> Void, onSettings: @escaping () -> Void) {
    self.drive = drive
    self.onSearch = onSearch
    self.onSettings = onSettings
    item = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
    drop = DropPanel(drive: drive)
    catcher = DropCatcher()
    super.init()
    item.button?.image = NSImage(
      systemSymbolName: "externaldrive.fill.badge.icloud",
      accessibilityDescription: Chrome.brand)
    item.menu = buildMenu()
    if let button = item.button {
      catcher.frame = button.bounds
      catcher.autoresizingMask = [.width, .height]
      catcher.onEnter = { [weak self] n in self?.drop.show(count: n) }
      catcher.onExit = { [weak self] in self?.drop.hide() }
      catcher.onDrop = { [weak self] urls in self?.drop.ingest(urls) }
      button.addSubview(catcher)
    }
  }

  private func buildMenu() -> NSMenu {
    let menu = NSMenu()
    for spec in statusMenu {
      if spec.separator {
        menu.addItem(.separator())
        continue
      }
      let row = NSMenuItem(title: spec.title ?? "", action: #selector(pick), keyEquivalent: "")
      row.target = self
      row.representedObject = spec.id
      switch spec.id {
      case "search":
        row.keyEquivalent = "o"
        row.keyEquivalentModifierMask = [.control, .option]
      case "settings":
        row.keyEquivalent = ","
        row.keyEquivalentModifierMask = [.command]
      case "quit":
        row.keyEquivalent = "q"
        row.keyEquivalentModifierMask = [.command]
      default:
        break
      }
      menu.addItem(row)
    }
    return menu
  }

  @objc private func pick(_ sender: NSMenuItem) {
    switch sender.representedObject as? String {
    case "search": onSearch()
    case "finder": NSWorkspace.shared.open(drive)
    case "account":
      if let url = URL(string: "https://github.com/smeltery/loft") {
        NSWorkspace.shared.open(url)
      }
    case "feedback":
      if let url = URL(string: "https://github.com/smeltery/loft/issues") {
        NSWorkspace.shared.open(url)
      }
    case "settings": onSettings()
    case "quit": NSApp.terminate(nil)
    default: break
    }
  }
}

final class DropCatcher: NSView {
  var onEnter: ((Int) -> Void)?
  var onExit: (() -> Void)?
  var onDrop: (([URL]) -> Void)?

  override func mouseDown(with event: NSEvent) {
    superview?.mouseDown(with: event)
  }

  override func draggingEntered(_ sender: NSDraggingInfo) -> NSDragOperation {
    onEnter?(sender.draggingPasteboard.fileCount)
    return .copy
  }

  override func draggingExited(_ sender: NSDraggingInfo?) {
    onExit?()
  }

  override func draggingEnded(_ sender: NSDraggingInfo) {
    onExit?()
  }

  override func performDragOperation(_ sender: NSDraggingInfo) -> Bool {
    let urls = sender.draggingPasteboard.readObjects(forClasses: [NSURL.self]) as? [URL] ?? []
    onDrop?(urls)
    return !urls.isEmpty
  }

  override init(frame frameRect: NSRect) {
    super.init(frame: frameRect)
    registerForDraggedTypes([.fileURL])
  }

  required init?(coder: NSCoder) { nil }
}

extension NSPasteboard {
  fileprivate var fileCount: Int {
    pasteboardItems?.count ?? 1
  }
}
