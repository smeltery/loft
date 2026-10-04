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
    let zero = label("Files download when opened or kept on this Mac", 13, .regular, NSRect(x: 96, y: 234, width: 380, height: 18))
    zero.textColor = .secondaryLabelColor
    let hd = label("Reading local disk capacity…", 13, .regular, NSRect(x: 28, y: 180, width: 464, height: 20))
    let apps = label("", 13, .regular, NSRect(x: 28, y: 154, width: 464, height: 20))
    apps.textColor = .secondaryLabelColor
    let loft = label("Loading cloud storage…", 13, .semibold, NSRect(x: 28, y: 128, width: 464, height: 20))
    let finder = NSTextField(
      wrappingLabelWithString: "Checking the Loft drive in Finder…")
    finder.frame = NSRect(x: 28, y: 72, width: 464, height: 40)
    for view in [icon, name, cloud, zero, hd, apps, loft, finder] {
      window.contentView?.addSubview(view)
    }
    window.center()
    do {
      let volume = try FileManager.default.homeDirectoryForCurrentUser.resourceValues(
        forKeys: [.volumeNameKey, .volumeTotalCapacityKey, .volumeAvailableCapacityKey])
      if let total = volume.volumeTotalCapacity, let free = volume.volumeAvailableCapacity {
        hd.stringValue = "\(volume.volumeName ?? "Local disk")    \(Catalog.formatSize(Int64(total - free))) of \(Catalog.formatSize(Int64(total))) used"
        apps.stringValue = "\(Catalog.formatSize(Int64(free))) available"
      } else { hd.stringValue = "Local disk capacity unavailable" }
    } catch { hd.stringValue = "Local disk capacity unavailable" }
    Task {
      do {
        let me = try await CloudClient.fromEnv().account()
        loft.stringValue = "Loft    \(Catalog.formatSize(me.bytes)) in the cloud · \(me.files) files"
      } catch { loft.stringValue = error.localizedDescription }
    }
    Task {
      do {
        _ = try await LoftDomain.userURL()
        finder.stringValue = "Loft is available under Locations in Finder."
      } catch {
        finder.stringValue = "Loft is not available in Finder. Enable the signed Loft File Provider installation under Locations."
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
