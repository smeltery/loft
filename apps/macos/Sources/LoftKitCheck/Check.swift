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
    let share = Catalog.shareURL(origin: "https://loft.example", id: "wedding")
    guard share == "https://loft.example/s/wedding" else {
      fatalError("share url mismatch: \(share)")
    }
    print("loftkit check ok")
  }
}
