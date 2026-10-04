import AppKit
import LoftKit

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
  private var status: StatusController?
  private var search: SearchPanel?
  private var settings: NSWindow?
  private var transfer: TransferPanel?
  private var appearanceObservation: NSKeyValueObservation?

  func applicationDidFinishLaunching(_ notification: Notification) {
    appearanceObservation = NSApp.observe(\.effectiveAppearance, options: [.initial, .new]) { _, _ in
      Task { @MainActor in BrandImage.updateApplicationIcon() }
    }
    let preview = CommandLine.arguments.contains("--preview")
    let store = DriveStore(root: preview ? LoftVolume.ensure() : DriveStore.supportRoot())
    if preview {
      do { try store.materialize() } catch { NSLog("loft preview: \(error.localizedDescription)") }
    }
    let cloud = CloudClient.fromEnv()
    let transfer = TransferPanel()
    self.transfer = transfer
    let searchPanel = SearchPanel(store: store, transfer: transfer, client: cloud)
    search = searchPanel
    SearchHotKey.trigger = { searchPanel.show() }
    SearchHotKey.install()
    LoftDomain.register()
    status = StatusController(
      store: store,
      client: cloud,
      onSearch: { searchPanel.show() },
      onSettings: { [weak self] in self?.showSettings() }
    )
    if CommandLine.arguments.contains("--preview") {
      searchPanel.show()
      showSettings()
      status?.showDropPreview()
      if let film = Catalog.files.first {
        transfer.show(file: film)
      }
    }
  }

  private func showSettings() {
    if settings == nil { settings = SettingsWindow.make() }
    settings?.makeKeyAndOrderFront(nil)
    NSApp.activate(ignoringOtherApps: true)
  }
}

@main
enum LoftMain {
  static func main() {
    let app = NSApplication.shared
    app.setActivationPolicy(
      CommandLine.arguments.contains("--preview") ? .regular : .accessory)
    let delegate = AppDelegate()
    app.delegate = delegate
    withExtendedLifetime(delegate) { app.run() }
  }
}
