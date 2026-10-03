import AppKit
import LoftKit

enum FileActions {
  static func copyLink(_ file: DriveFile, client: CloudClient) {
    Task {
      let text = (try? await client.share(id: file.id)) ?? Catalog.shareURL(
        origin: ProcessInfo.processInfo.environment["LOFT_WEB"] ?? "http://127.0.0.1:3000",
        id: file.id)
      await MainActor.run {
        let paste = NSPasteboard.general
        paste.clearContents()
        paste.setString(text, forType: .string)
      }
    }
  }

  static func requestURL() -> URL? {
    let origin = ProcessInfo.processInfo.environment["LOFT_WEB"]
      ?? "http://127.0.0.1:3000"
    let token = UUID().uuidString.split(separator: "-").first.map(String.init) ?? "demo"
    return URL(string: "\(origin)/r/\(token)")
  }

  static func open(_ url: URL) {
    NSWorkspace.shared.activateFileViewerSelecting([url])
  }
}

@MainActor
enum InfoPanel {
  static func show(_ file: DriveFile, onDisk: Int64) {
    let window = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 280, height: 220),
      styleMask: [.titled, .closable],
      backing: .buffered,
      defer: false
    )
    window.title = "Get Info"
    let body = """
      \(file.name)
      Kind: \(file.kind)
      Size: \(file.bytes) bytes (\(onDisk == 0 ? "Zero bytes on disk" : Catalog.formatSize(onDisk)))
      Where: \(file.whereLine)
      """
    let label = NSTextField(wrappingLabelWithString: body)
    label.frame = NSRect(x: 16, y: 16, width: 248, height: 180)
    window.contentView?.addSubview(label)
    window.center()
    window.makeKeyAndOrderFront(nil)
  }
}
