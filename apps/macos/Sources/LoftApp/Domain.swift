@preconcurrency import FileProvider
import Foundation

enum LoftDomain {
  static let id = NSFileProviderDomainIdentifier("dev.smeltery.loft.drive")

  static func register() {
    let domain = NSFileProviderDomain(identifier: id, displayName: "Loft")
    NSFileProviderManager.add(domain) { error in
      if let error { NSLog("loft file provider: \(error.localizedDescription)") }
    }
  }
}
