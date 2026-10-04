import Foundation

public enum LocalPins {
  private static var defaults: UserDefaults { UserDefaults(suiteName: "dev.smeltery.loft") ?? .standard }
  public static func contains(_ id: String) -> Bool { defaults.bool(forKey: "pinned.\(id)") }
  public static func set(_ id: String, pinned: Bool) { defaults.set(pinned, forKey: "pinned.\(id)") }
}
