# macOS app

Loft lives in the menu bar and exposes a File Provider drive in Finder
Locations. Files download when opened. **Keep on This Mac** pins files on
this device and asks Finder to materialize them for offline access.

```mermaid
flowchart LR
  menu[Menu bar]
  search[Search Loft]
  finder[Loft File Provider]
  drop[Drop overlay]
  keep[Keep on This Mac]
  menu --> search
  menu --> finder
  search --> finder
  drop --> api[Storage API]
  finder --> api
  keep --> finder
```

- **Search Loft** (Control-Option-O) lists real remote files and reports
  connection failures. Opening a result uses its File Provider URL.
- **Open in Finder** opens the registered domain. If unavailable, Loft
  explains that the signed File Provider must be enabled.
- **Drop** lets you choose an existing folder or Inbox before uploading.
  Failed files remain available for retry; successful files are not retried.
- **Keep on This Mac** stores a device-local pin. The transfer panel waits
  for Finder materialization and reports bytes verified by a coordinated
  read. Closing the panel stops waiting; Finder manages the pinned download.
- **Settings** displays measured disk capacity, actual cloud usage, and
  File Provider availability. Unavailable data is reported explicitly.
- **Copy Loft Link** and **Request Files…** use the persisted sharing API.

The File Provider extension (`LoftProvider`) is embedded at
`Contents/PlugIns/LoftProvider.appex`. Full downloads read all bytes in bounded
chunks, guard the remote version, and replace local files only after success.
Range downloads preserve alignment and requested coverage. Authentication,
conflict, network, and write errors propagate to Finder rather than reporting
success. Folder creation and metadata-only moves/renames are not implemented.

The packaging script uses an ad-hoc signature for local builds. Activating
and testing the Finder domain requires a correctly signed and entitled
installation; a successful Swift build does not verify that integration.
Normal launches do not mount a demo disk image. The `--preview` flag retains
the sparse demo volume for development only.

```bash
bun --filter @loft/api dev
bun run macos:test
bun run macos:build
scripts/package-macos.sh
```

## Brand icons

The canonical artwork is `apps/web/public/brand/logo.svg`. Regenerate native
black/white PNGs, multi-resolution ICNS files and the Finder sidebar symbol
with `swift scripts/generate-macos-icons.swift "$PWD"` from the repository root.
The white vector is also available at `apps/macos/Resources/logo-white.svg`.

Menu-bar and Settings images are templates, so macOS supplies the appropriate
contrast, including selection states. The running app switches its Dock icon
between black and white when its effective appearance changes. Loft remains
a menu-bar app; this does not add a permanent Dock entry.

Both bundles declare a Loft icon for Finder and system dialogs. The provider
uses the custom `LoftSidebar` SF Symbol for its Finder Locations entry, allowing
Finder to tint it for light and dark appearances. Packaging with full Xcode
compiles that symbol; Command Line Tools-only builds emit a warning and use
the bundle icon fallback. CI checks the fully compiled symbol. An enabled,
correctly signed provider installation is still needed to verify Finder UI.
