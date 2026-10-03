import AppKit
import Foundation

enum BrandImage {
  static func mark(pointSize: NSSize = NSSize(width: 18, height: 13)) -> NSImage {
    let names = ["logo@2x", "logo", "appicon"]
    for name in names {
      if let url = url(name), let image = NSImage(contentsOf: url) {
        image.isTemplate = true
        image.size = pointSize
        return image
      }
    }
    return NSImage(systemSymbolName: "cloud.fill", accessibilityDescription: "loft")
      ?? NSImage()
  }

  static func appIcon() -> NSImage {
    if let url = url("appicon"), let image = NSImage(contentsOf: url) {
      image.size = NSSize(width: 64, height: 48)
      return image
    }
    return mark(pointSize: NSSize(width: 64, height: 48))
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
