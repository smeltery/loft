import AppKit
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
  private var all: [DriveFile] = Catalog.files
  private var hits: [DriveFile] = Catalog.files

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
    let store = self.store
    Task {
      guard let files = try? await client.list() else { return }
      try? store.sync(files)
      let mapped = files.map(\.asDriveFile)
      await MainActor.run {
        self.all = mapped
        self.applyFilter()
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
    let disk = file.map { Placeholder.allocated(store.url($0)) } ?? 0
    let size = file.map { Catalog.formatSize($0.bytes) } ?? ""
    let diskNote = disk == 0 ? Chrome.zeroOnDisk : Catalog.formatSize(disk)
    let text = NSTextField(labelWithString: "\(file?.name ?? "")    \(size)    \(diskNote)")
    text.font = .systemFont(ofSize: 13)
    return text
  }

  private func currentFile() -> DriveFile? {
    let row = table?.clickedRow ?? table?.selectedRow ?? -1
    return hits.indices.contains(row) ? hits[row] : nil
  }

  @objc private func openRow() {
    guard let file = currentFile() else { return }
    FileActions.open(store.url(file))
  }

  @objc private func fromMenu(_ sender: NSMenuItem) {
    guard let file = currentFile() else { return }
    let url = store.url(file)
    switch sender.title {
    case Chrome.open: FileActions.open(url)
    case Chrome.getInfo: InfoPanel.show(file, onDisk: Placeholder.allocated(url))
    case Chrome.copyLink: FileActions.copyLink(file, client: client)
    case Chrome.requestFiles:
      FileActions.requestFiles(folder: file.folder, client: client)
    case Chrome.keepOnMac:
      transfer.show(file: file)
      let client = self.client
      Task {
        try? await client.keep(id: file.id)
        try? await client.download(id: file.id, to: url)
        await MainActor.run {
          self.transfer.hide()
          self.table?.reloadData()
        }
      }
    default: break
    }
  }
}
