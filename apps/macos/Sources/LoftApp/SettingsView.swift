import AppKit
import LoftKit

enum SettingsWindow {
  @MainActor
  static func make() -> NSWindow {
    let window = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 480, height: 280),
      styleMask: [.titled, .closable],
      backing: .buffered,
      defer: false
    )
    window.title = "Loft"
    let account = NSTextField(labelWithString: "one plan. any size.  $9 per TB a month")
    account.frame = NSRect(x: 20, y: 220, width: 440, height: 24)
    let storage = NSTextField(labelWithString: "Loft  ·  1.2 TB in the cloud  ·  Zero KB")
    storage.frame = NSRect(x: 20, y: 180, width: 440, height: 24)
    let finder = NSTextField(
      wrappingLabelWithString: "Loft sits in Locations, next to Macintosh HD.")
    finder.frame = NSRect(x: 20, y: 120, width: 440, height: 48)
    window.contentView?.addSubview(account)
    window.contentView?.addSubview(storage)
    window.contentView?.addSubview(finder)
    window.center()
    return window
  }
}
