import AppKit
import Foundation

enum BrandImage {
  static func mark(pointSize: NSSize = NSSize(width: 18, height: 13.5)) -> NSImage {
    let names = ["logo@2x", "logo", "appicon"]
    for name in names {
      if let url = url(name), let image = NSImage(contentsOf: url) {
        image.isTemplate = true
        image.size = pointSize
        return image
      }
    }
    NSLog("Loft logo resources are missing from the app bundle")
    return NSImage()
  }

  static func appIcon() -> NSImage {
    if let url = url("appicon"), let image = NSImage(contentsOf: url) {
      image.size = NSSize(width: 64, height: 64)
      image.isTemplate = true
      return image
    }
    return mark(pointSize: NSSize(width: 64, height: 48))
  }

  @MainActor
  static func updateApplicationIcon() {
    // Asset-catalog icons let macOS apply Dark, Clear, and Tinted appearances.
    if Bundle.main.object(forInfoDictionaryKey: "CFBundleIconName") != nil {
      NSApp.applicationIconImage = nil
      return
    }
    let dark = NSApp.effectiveAppearance.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua
    let name = dark ? "appicon-dark" : "appicon"
    guard let url = url(name), let image = NSImage(contentsOf: url) else {
      NSLog("Loft application icon is missing: %@", name)
      return
    }
    // Dock icons are not template images, so switch the original artwork explicitly.
    NSApp.applicationIconImage = image
  }

  private static func url(_ name: String) -> URL? {
    if let url = Bundle.main.url(forResource: name, withExtension: "png") {
      return url
    }
    let exe = URL(fileURLWithPath: CommandLine.arguments[0]).standardizedFileURL
    let dir = exe.deletingLastPathComponent()
    let files = [
      dir.appendingPathComponent("../Resources/\(name).png"),
      dir.appendingPathComponent("Loft_LoftApp.bundle/Contents/Resources/\(name).png"),
    ]
    return files.map(\.standardizedFileURL).first {
      FileManager.default.fileExists(atPath: $0.path)
    }
  }
}
