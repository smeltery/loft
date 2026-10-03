import AppKit
import LoftKit

enum SettingsWindow {
  @MainActor
  static func make() -> NSWindow {
    let window = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 520, height: 360),
      styleMask: [.titled, .closable],
      backing: .buffered,
      defer: false
    )
    window.title = "Loft"
    let icon = NSImageView(frame: NSRect(x: 28, y: 248, width: 56, height: 42))
    icon.image = BrandImage.appIcon()
    icon.imageScaling = .scaleProportionallyUpOrDown
    let name = label("Loft", 15, .semibold, NSRect(x: 96, y: 272, width: 380, height: 22))
    let cloud = label(Chrome.cloudStorage, 13, .regular, NSRect(x: 96, y: 252, width: 380, height: 18))
    cloud.textColor = .secondaryLabelColor
    let zero = label(Chrome.zeroOnDisk, 13, .regular, NSRect(x: 96, y: 234, width: 380, height: 18))
    zero.textColor = .secondaryLabelColor
    let hd = label("Macintosh HD    214.6 of 245.1 GB", 13, .regular, NSRect(x: 28, y: 180, width: 464, height: 20))
    let apps = label("Applications    83.1 GB", 13, .regular, NSRect(x: 28, y: 154, width: 464, height: 20))
    apps.textColor = .secondaryLabelColor
    let loft = label("Loft    1.2 TB in the cloud · Zero KB", 13, .semibold, NSRect(x: 28, y: 128, width: 464, height: 20))
    let finder = NSTextField(
      wrappingLabelWithString: "Loft sits in Locations as a drive named Loft, next to Macintosh HD.")
    finder.frame = NSRect(x: 28, y: 72, width: 464, height: 40)
    for view in [icon, name, cloud, zero, hd, apps, loft, finder] {
      window.contentView?.addSubview(view)
    }
    window.center()
    Task {
      guard let me = try? await CloudClient.fromEnv().account() else { return }
      await MainActor.run {
        loft.stringValue =
          "Loft    \(Catalog.formatSize(me.bytes)) in the cloud · \(me.files) files"
      }
    }
    return window
  }

  @MainActor
  private static func label(
    _ text: String, _ size: CGFloat, _ weight: NSFont.Weight, _ frame: NSRect
  ) -> NSTextField {
    let field = NSTextField(labelWithString: text)
    field.font = .systemFont(ofSize: size, weight: weight)
    field.frame = frame
    return field
  }
}
