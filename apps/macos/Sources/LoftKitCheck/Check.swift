import Foundation
import LoftKit

@main
enum LoftKitCheck {
  static func main() {
    let titles = [
      "Search Loft",
      "Open in Finder",
      "Your Account",
      "Send Feedback",
      "Settings…",
      "Quit Loft",
    ]
    guard menuTitles == titles else {
      fatalError("status menu chrome mismatch: \(menuTitles)")
    }
    guard Catalog.diskBytes(keepOnMac: false, logical: 100) == 0 else {
      fatalError("placeholders must use zero disk bytes")
    }
    guard Catalog.diskBytes(keepOnMac: true, logical: 100) == 100 else {
      fatalError("kept files must use logical size")
    }
    guard Catalog.search("wedding").first?.name == "wedding-film_final.mov" else {
      fatalError("search missed wedding film")
    }
    guard Catalog.formatSize(48_213_574_021).contains("GB") else {
      fatalError("size format mismatch")
    }
    let cloud = CloudClient(
      origin: URL(string: "http://127.0.0.1:8787") ?? URL(fileURLWithPath: "/"), token: "dev")
    guard cloud.rangeHeader(offset: 0, length: 10) == "bytes=0-9" else {
      fatalError("range header mismatch")
    }
    let aligned = CloudClient.alignedRange(offset: 10, requested: 5, alignment: 8, size: 100)
    guard aligned.offset == 8, aligned.length == 8 else {
      fatalError("aligned range mismatch \(aligned)")
    }
    let share = Catalog.shareURL(origin: "https://loft.example", id: "wedding")
    guard share == "https://loft.example/s/wedding" else {
      fatalError("share url mismatch: \(share)")
    }
    guard Chrome.keepOnMac == "Keep on This Mac" else {
      fatalError("keep chrome mismatch")
    }
    let tmp = FileManager.default.temporaryDirectory.appendingPathComponent("loft-check")
    try? FileManager.default.removeItem(at: tmp)
    let big = tmp.appendingPathComponent("film.mov")
    do {
      try Placeholder.create(at: big, bytes: 50_000_000)
    } catch {
      fatalError("placeholder create failed")
    }
    guard Placeholder.allocated(big) < 5_000_000 else {
      fatalError("placeholders must stay sparse: \(Placeholder.allocated(big))")
    }
    try? Placeholder.keep(big)
    guard Placeholder.isKept(big) else { fatalError("keep flag missing") }
    print("loftkit check ok")
  }
}
