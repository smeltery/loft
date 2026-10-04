import AppKit
import Foundation

// Render the canonical vector paths; no raster tracing or separate logo geometry.
let root = URL(fileURLWithPath: CommandLine.arguments[1])
let resources = root.appendingPathComponent("apps/macos/Resources")
let source = try String(contentsOf: root.appendingPathComponent("apps/web/public/brand/logo.svg"), encoding: .utf8)
let regex = try NSRegularExpression(pattern: #"<path d="([^"]+)""#)
let paths = regex.matches(in: source, range: NSRange(source.startIndex..., in: source)).map {
  String(source[Range($0.range(at: 1), in: source)!])
}
precondition(paths.count == 5, "Expected two cutouts and three logo shapes")
let compound = NSBezierPath()
compound.windingRule = .evenOdd
for data in paths {
  let tokens = data.split(separator: " ").map(String.init)
  var index = 0
  func point() -> NSPoint {
    let x = Double(tokens[index])!
    let y = Double(tokens[index + 1])!
    index += 2
    return NSPoint(x: x, y: y)
  }
  while index < tokens.count {
    let command = tokens[index]
    index += 1
    switch command {
    case "M": compound.move(to: point())
    case "L": compound.line(to: point())
    case "C":
      let first = point(), second = point(), end = point()
      compound.curve(to: end, controlPoint1: first, controlPoint2: second)
    case "Z": compound.close()
    default: fatalError("Unsupported vector command: \(command)")
    }
  }
}

func render(width: Int, height: Int, white: Bool, inset: Double = 0) -> Data {
  let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height,
    bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
    colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
  let scale = min(Double(width) * (1 - inset * 2) / 1434, Double(height) * (1 - inset * 2) / 1063)
  let transform = AffineTransform(m11: scale, m12: 0, m21: 0, m22: -scale,
    tX: (Double(width) - 1434 * scale) / 2 - 307 * scale,
    tY: (Double(height) + 1063 * scale) / 2 + 495 * scale)
  let path = compound.copy() as! NSBezierPath
  path.transform(using: transform)
  (white ? NSColor.white : NSColor.black).setFill()
  path.fill()
  NSGraphicsContext.restoreGraphicsState()
  return bitmap.representation(using: .png, properties: [:])!
}

for (name, width, height, white, inset) in [
  ("logo", 24, 18, false, 0.0), ("logo@2x", 48, 36, false, 0.0),
  ("logo-white", 24, 18, true, 0.0), ("logo-white@2x", 48, 36, true, 0.0),
  ("appicon", 1024, 1024, false, 0.09), ("appicon-dark", 1024, 1024, true, 0.09),
] {
  try render(width: width, height: height, white: white, inset: inset)
    .write(to: resources.appendingPathComponent("\(name).png"))
}
let whiteSVG = source.replacingOccurrences(of: #"<g fill="black" mask="url(#face)">"#,
  with: #"<g fill="white" mask="url(#face)">"#)
try whiteSVG.write(to: resources.appendingPathComponent("logo-white.svg"), atomically: true, encoding: .utf8)

let temporary = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
try FileManager.default.createDirectory(at: temporary, withIntermediateDirectories: true)
defer { try? FileManager.default.removeItem(at: temporary) }
for (name, white) in [("Loft", false), ("LoftDark", true)] {
  let iconset = temporary.appendingPathComponent("\(name).iconset")
  try FileManager.default.createDirectory(at: iconset, withIntermediateDirectories: true)
  for points in [16, 32, 128, 256, 512] {
    for scale in [1, 2] {
      let suffix = scale == 2 ? "@2x" : ""
      try render(width: points * scale, height: points * scale, white: white, inset: 0.09)
        .write(to: iconset.appendingPathComponent("icon_\(points)x\(points)\(suffix).png"))
    }
  }
  let process = Process()
  process.executableURL = URL(fileURLWithPath: "/usr/bin/iconutil")
  process.arguments = ["-c", "icns", iconset.path, "-o", resources.appendingPathComponent("\(name).icns").path]
  try process.run()
  process.waitUntilExit()
  precondition(process.terminationStatus == 0, "Icon conversion failed")
}

// A custom SF Symbol lets Finder supply dark/light/selected-state colors.
let symbols = resources.appendingPathComponent("Brand.xcassets/LoftSidebar.symbolset")
try FileManager.default.createDirectory(at: symbols, withIntermediateDirectories: true)
let info = #"{"info":{"author":"xcode","version":1},"symbols":[{"filename":"LoftSidebar.svg","idiom":"universal"}]}"#
try (info + "\n").write(to: symbols.appendingPathComponent("Contents.json"), atomically: true, encoding: .utf8)
var guides = "", variants = ""
for (size, baseline, height) in [("S", 698.66, 70.46), ("M", 1128.66, 88.0), ("L", 1558.66, 106.0)] {
  let scale = height / 1063
  let x = 1450 - 1434 * scale / 2
  guides += "<line id=\"Baseline-\(size)\" x1=\"263\" y1=\"\(baseline)\" x2=\"3036\" y2=\"\(baseline)\"/><line id=\"Capline-\(size)\" x1=\"263\" y1=\"\(baseline - height)\" x2=\"3036\" y2=\"\(baseline - height)\"/>"
  variants += "<g id=\"Regular-\(size)\"><path fill-rule=\"evenodd\" transform=\"translate(\(x - 307 * scale) \(baseline - height - 495 * scale)) scale(\(scale))\" d=\"\(paths.joined(separator: " "))\"/></g>"
}
let symbol = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 3300 2200\"><g id=\"Guides\">\(guides)</g><g id=\"Symbols\">\(variants)</g></svg>"
try (symbol + "\n").write(to: symbols.appendingPathComponent("LoftSidebar.svg"), atomically: true, encoding: .utf8)
print("Generated Loft icons from apps/web/public/brand/logo.svg")

// Keep the layered app icon's foreground aligned with the canonical mark.
let layered = resources.appendingPathComponent("Loft.icon/Assets")
try FileManager.default.createDirectory(at: layered, withIntermediateDirectories: true)
let iconScale = 800.0 / 1434
let iconX = 112 - 307 * iconScale
let iconY = (1024 - 1063 * iconScale) / 2 - 495 * iconScale
let foreground = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1024\" height=\"1024\" viewBox=\"0 0 1024 1024\"><path fill=\"black\" fill-rule=\"evenodd\" transform=\"translate(\(iconX) \(iconY)) scale(\(iconScale))\" d=\"\(paths.joined(separator: " "))\"/></svg>"
try (foreground + "\n").write(to: layered.appendingPathComponent("logo.svg"), atomically: true, encoding: .utf8)
