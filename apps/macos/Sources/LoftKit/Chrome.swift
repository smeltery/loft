public enum Chrome {
  public static let brand = "loft"
  public static let search = "Search Loft"
  public static let searchShortcut = "⌃⌥O"
  public static let finder = "Open in Finder"
  public static let account = "Your Account"
  public static let accountMark = "↗"
  public static let feedback = "Send Feedback"
  public static let settings = "Settings…"
  public static let quit = "Quit Loft"
  public static let releaseToAdd = "Release to add"
  public static let oneItem = "1 item"
  public static let intoFolder = "Or into a folder"
  public static let copyLink = "Copy Loft Link"
  public static let requestFiles = "Request Files…"
  public static let keepSubtitle = "To keep on this Mac, as you chose."
  public static let requestSub = "Files you add go straight to their Loft."
  public static let searchPlaceholder = "Search Loft"
  public static let cloudStorage = "1.2 TB in the cloud"
  public static let zeroOnDisk = "Zero KB"
  public static let keepOnMac = "Keep on This Mac"
  public static let getInfo = "Get Info"
  public static let open = "Open"
  public static let transferTitle = "Downloading 24.1 GB of 38.6 GB"
}

public struct MenuSpec: Equatable, Sendable {
  public let id: String
  public let title: String?
  public let shortcut: String?
  public let trailing: String?
  public let separator: Bool

  public init(
    id: String,
    title: String? = nil,
    shortcut: String? = nil,
    trailing: String? = nil,
    separator: Bool = false
  ) {
    self.id = id
    self.title = title
    self.shortcut = shortcut
    self.trailing = trailing
    self.separator = separator
  }
}

public let statusMenu: [MenuSpec] = [
  .init(id: "search", title: Chrome.search, shortcut: Chrome.searchShortcut),
  .init(id: "finder", title: Chrome.finder),
  .init(id: "account", title: Chrome.account, trailing: Chrome.accountMark),
  .init(id: "feedback", title: Chrome.feedback),
  .init(id: "sep", separator: true),
  .init(id: "settings", title: Chrome.settings, shortcut: "⌘,"),
  .init(id: "quit", title: Chrome.quit, shortcut: "⌘Q"),
]

public var menuTitles: [String] {
  statusMenu.compactMap(\.title)
}
