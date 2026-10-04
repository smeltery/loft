import AppKit
@preconcurrency import FileProvider
import LoftKit

@MainActor
final class SearchPanel: NSObject, NSTableViewDataSource, NSTableViewDelegate, NSSearchFieldDelegate
{
  private let store: DriveStore
  private let transfer: TransferPanel
  private let client: CloudClient
  private var window: NSPanel?
  private var field: NSSearchField?
  private var table: NSTableView?
  private var all: [DriveFile] = []
  private var hits: [DriveFile] = []

  init(store: DriveStore, transfer: TransferPanel, client: CloudClient) {
    self.store = store
    self.transfer = transfer
    self.client = client
  }

  func show() {
    if window == nil { window = build() }
    field?.stringValue = ""
    hits = all
    table?.reloadData()
    window?.center()
    window?.makeKeyAndOrderFront(nil)
    NSApp.activate(ignoringOtherApps: true)
    window?.makeFirstResponder(field)
    let client = self.client
    window?.title = "Loading Loft…"
    Task {
      do {
        let files = try await client.list()
        self.all = files.map(\.asDriveFile)
        self.applyFilter()
        self.field?.placeholderString = self.all.isEmpty ? "No files in Loft" : Chrome.searchPlaceholder
      } catch {
        self.all = []
        self.applyFilter()
        self.field?.placeholderString = error.localizedDescription
      }
    }
  }

  private func applyFilter() {
    let q = (field?.stringValue ?? "").trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    hits = q.isEmpty ? all : all.filter {
      $0.name.lowercased().contains(q) || $0.folder.lowercased().contains(q)
    }
    table?.reloadData()
  }

  private func build() -> NSPanel {
    let panel = NSPanel(
      contentRect: NSRect(x: 0, y: 0, width: 520, height: 340),
      styleMask: [.borderless, .fullSizeContentView],
      backing: .buffered,
      defer: false
    )
    panel.isOpaque = false
    panel.backgroundColor = .clear
    panel.isFloatingPanel = true
    panel.hasShadow = true
    let blur = NSVisualEffectView(frame: NSRect(x: 0, y: 0, width: 520, height: 340))
    blur.material = .popover
    blur.state = .active
    blur.wantsLayer = true
    blur.layer?.cornerRadius = 12
    let search = NSSearchField(frame: NSRect(x: 16, y: 300, width: 488, height: 28))
    search.placeholderString = Chrome.searchPlaceholder
    search.delegate = self
    search.focusRingType = .none
    let scroll = NSScrollView(frame: NSRect(x: 8, y: 12, width: 504, height: 280))
    let table = NSTableView(frame: scroll.bounds)
    table.addTableColumn(NSTableColumn(identifier: .init("name")))
    table.headerView = nil
    table.backgroundColor = .clear
    table.dataSource = self
    table.delegate = self
    table.rowHeight = 28
    table.doubleAction = #selector(openRow)
    table.target = self
    table.menu = contextMenu()
    scroll.documentView = table
    scroll.drawsBackground = false
    scroll.hasVerticalScroller = true
    blur.addSubview(search)
    blur.addSubview(scroll)
    panel.contentView = blur
    field = search
    self.table = table
    return panel
  }

  private func contextMenu() -> NSMenu {
    let menu = NSMenu()
    for title in [
      Chrome.open, Chrome.getInfo, Chrome.copyLink, Chrome.requestFiles, Chrome.keepOnMac,
    ] {
      let item = NSMenuItem(title: title, action: #selector(fromMenu(_:)), keyEquivalent: "")
      item.target = self
      menu.addItem(item)
    }
    return menu
  }

  func controlTextDidChange(_ obj: Notification) { applyFilter() }

  func numberOfRows(in tableView: NSTableView) -> Int { hits.count }

  func tableView(_ tableView: NSTableView, viewFor tableColumn: NSTableColumn?, row: Int)
    -> NSView?
  {
    let file = hits.indices.contains(row) ? hits[row] : nil
    let size = file.map { Catalog.formatSize($0.bytes) } ?? ""
    let text = NSTextField(labelWithString: "\(file?.name ?? "")    \(size)")
    text.font = .systemFont(ofSize: 13)
    return text
  }

  private func currentFile() -> DriveFile? {
    let clicked = table?.clickedRow ?? -1
    let row = clicked >= 0 ? clicked : (table?.selectedRow ?? -1)
    return hits.indices.contains(row) ? hits[row] : nil
  }

  @objc private func openRow() {
    guard let file = currentFile() else { return }
    Task {
      do { FileActions.open(try await LoftDomain.userURL(for: NSFileProviderItemIdentifier(file.id))) }
      catch { FileActions.showError(error) }
    }
  }

  @objc private func fromMenu(_ sender: NSMenuItem) {
    guard let file = currentFile() else { return }
    switch sender.title {
    case Chrome.open: openRow()
    case Chrome.getInfo:
      Task {
        do {
          let url = try await LoftDomain.userURL(for: NSFileProviderItemIdentifier(file.id))
          InfoPanel.show(file, onDisk: Placeholder.allocated(url))
        } catch { FileActions.showError(error) }
      }
    case Chrome.copyLink: FileActions.copyLink(file, client: client)
    case Chrome.requestFiles:
      FileActions.requestFiles(folder: file.folder, client: client)
    case Chrome.keepOnMac:
      transfer.keep(file: file) { [weak self] _ in self?.table?.reloadData() }
    default: break
    }
  }
}
