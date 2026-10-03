# macOS app

Loft lives in the menu bar and opens a Finder folder that behaves like a
cloud drive: files list at full size and take **zero bytes on disk** until you
keep them.

```mermaid
flowchart LR
  menu[Menu bar]
  search[Search Loft]
  finder[Finder drive]
  drop[Drop overlay]
  menu --> search
  menu --> finder
  drop --> finder
```

Chrome cloned from the public product:

| Surface | Match |
| --- | --- |
| Status menu | Search Loft ⌃⌥O, Open in Finder, Your Account, Send Feedback, Settings…, Quit Loft |
| Drop | Release to add / Or into a folder |
| Search | ⌃⌥O palette over the catalog |
| Settings | Account, cloud storage, Finder location |
| Request files | `apps/web` at `/r/:token` |

The drive is `~/Library/Application Support/Loft/Drive`. Open in Finder reveals
it. A signed File Provider domain (Locations next to Macintosh HD) is the
Tahoe-era mount; unsigned local builds use this folder so the rest of the app
still runs.

```bash
bun run macos:test
bun run macos:build
scripts/package-macos.sh
```
