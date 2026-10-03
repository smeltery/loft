import AppKit
import LoftKit

@MainActor
final class SearchPanel: NSObject, NSTableViewDataSource, NSTableViewDelegate, NSSearchFieldDelegate {
  private var window: NSPanel?
  private var field: NSSearchField?
  private var table: NSTableView?
  private var hits: [DriveFile] = Catalog.files

  func show() {
    if window == nil { window = build() }
    field?.stringValue = ""
    hits = Catalog.files
    table?.reloadData()
    window?.center()
    window?.makeKeyAndOrderFront(nil)
    NSApp.activate(ignoringOtherApps: true)
    window?.makeFirstResponder(field)
  }

  private func build() -> NSPanel {
    let panel = NSPanel(
      contentRect: NSRect(x: 0, y: 0, width: 520, height: 320),
      styleMask: [.titled, .closable, .fullSizeContentView],
      backing: .buffered,
      defer: false
    )
    panel.title = Chrome.search
    panel.isFloatingPanel = true
    let search = NSSearchField(frame: NSRect(x: 12, y: 284, width: 496, height: 24))
    search.placeholderString = Chrome.searchPlaceholder
    search.delegate = self
    let scroll = NSScrollView(frame: NSRect(x: 12, y: 12, width: 496, height: 264))
    let table = NSTableView(frame: scroll.bounds)
    table.addTableColumn(NSTableColumn(identifier: .init("name")))
    table.headerView = nil
    table.dataSource = self
    table.delegate = self
    scroll.documentView = table
    scroll.hasVerticalScroller = true
    panel.contentView?.addSubview(search)
    panel.contentView?.addSubview(scroll)
    field = search
    self.table = table
    return panel
  }

  func controlTextDidChange(_ obj: Notification) {
    hits = Catalog.search(field?.stringValue ?? "")
    table?.reloadData()
  }

  func numberOfRows(in tableView: NSTableView) -> Int { hits.count }

  func tableView(_ tableView: NSTableView, viewFor tableColumn: NSTableColumn?, row: Int)
    -> NSView?
  {
    let name = hits.indices.contains(row) ? hits[row].name : ""
    let text = NSTextField(labelWithString: name)
    text.font = .systemFont(ofSize: 13)
    return text
  }
}
