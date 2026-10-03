import AppKit
import LoftKit

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
  private var status: StatusController?
  private var search: SearchPanel?
  private var settings: NSWindow?

  func applicationDidFinishLaunching(_ notification: Notification) {
    let store = DriveStore(root: DriveStore.defaultRoot())
    try? store.materialize()
    let searchPanel = SearchPanel()
    search = searchPanel
    status = StatusController(
      drive: store.root,
      onSearch: { searchPanel.show() },
      onSettings: { [weak self] in self?.showSettings() }
    )
  }

  private func showSettings() {
    if settings == nil {
      settings = SettingsWindow.make()
    }
    settings?.makeKeyAndOrderFront(nil)
    NSApp.activate(ignoringOtherApps: true)
  }
}

@main
enum LoftMain {
  static func main() {
    let app = NSApplication.shared
    app.setActivationPolicy(.accessory)
    let delegate = AppDelegate()
    app.delegate = delegate
    withExtendedLifetime(delegate) {
      app.run()
    }
  }
}
