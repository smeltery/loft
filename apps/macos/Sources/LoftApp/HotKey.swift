import Carbon
import Foundation

enum SearchHotKey {
  nonisolated(unsafe) static var trigger: (() -> Void)?

  static func install() {
    var ref: EventHotKeyRef?
    let id = EventHotKeyID(signature: OSType(0x4C4654), id: 1)
    RegisterEventHotKey(
      UInt32(kVK_ANSI_O), UInt32(controlKey | optionKey), id, GetApplicationEventTarget(), 0, &ref)
    var spec = EventTypeSpec(
      eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed))
    InstallEventHandler(
      GetApplicationEventTarget(),
      { _, _, _ in
        DispatchQueue.main.async { SearchHotKey.trigger?() }
        return noErr
      }, 1, &spec, nil, nil)
  }
}
