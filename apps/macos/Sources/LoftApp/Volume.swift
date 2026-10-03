import Foundation
import LoftKit

enum LoftVolume {
  static func ensure() -> URL {
    let vol = DriveStore.volumeRoot()
    if FileManager.default.fileExists(atPath: vol.path) { return vol }
    let image = DriveStore.supportRoot().deletingLastPathComponent()
      .appendingPathComponent("Loft.sparseimage")
    try? FileManager.default.createDirectory(
      at: image.deletingLastPathComponent(), withIntermediateDirectories: true)
    if !FileManager.default.fileExists(atPath: image.path) {
      _ = hdiutil([
        "create", "-size", "32g", "-fs", "APFS", "-volname", "Loft", "-type", "SPARSE",
        image.path,
      ])
    }
    _ = hdiutil(["attach", image.path, "-quiet"])
    if FileManager.default.fileExists(atPath: vol.path) { return vol }
    return DriveStore.supportRoot()
  }

  private static func hdiutil(_ args: [String]) -> Int32 {
    let proc = Process()
    proc.executableURL = URL(fileURLWithPath: "/usr/bin/hdiutil")
    proc.arguments = args
    proc.standardOutput = FileHandle.nullDevice
    proc.standardError = FileHandle.nullDevice
    do {
      try proc.run()
      proc.waitUntilExit()
      return proc.terminationStatus
    } catch {
      return 1
    }
  }
}
