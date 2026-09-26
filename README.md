# GUILib

GUILib is a TurboWarp extension for creating custom HTML-based graphical interfaces from Scratch blocks.

## Features

- Show, hide and clear the GUI
- Panels, labels, buttons and text inputs
- Checkboxes, sliders and dropdowns
- Draggable windows
- Tooltips, toasts and modal dialogs
- Tabs and GUI events
- Themes and GUI scaling
- Element properties and runtime inspection
- A visual **Open Editor** that opens in a new browser tab
- Editor hierarchy, selection, dragging and resizing
- Grid and snap-to-grid
- Duplicate and delete elements
- JSON export and import

## Requirements

GUILib uses DOM APIs, so it must run as an **unsandboxed** TurboWarp extension.

## Getting started

1. Open TurboWarp.
2. Add GUILib as a custom extension.
3. Make sure the extension is running in unsandboxed mode.
4. Use **Show GUI**.
5. Create GUI elements with the creation blocks.
6. Use **Open Editor** to open the visual layout editor in a new browser tab.

## Example

A simple interface can be created with:

- `Show GUI`
- `create label [title] text [Hello!] at x [100] y [60]`
- `create button [start] text [Start] at x [100] y [110] width [140] height [40]`
- `when GUI element [start] is clicked`

## Editor

The visual editor provides:

- Hierarchy list
- Element selection
- Position editing
- Size editing
- Dragging
- Resizing
- Grid toggle
- Snap-to-grid
- Duplicate/delete
- JSON export/import

Changes made in the editor are applied directly to the running GUILib instance.

## Events

GUILib provides hats for:

- GUI element clicked
- GUI element changed
- Modal confirmed
- Tab selected

## License

MIT License. See [LICENSE](LICENSE).

## Repository

https://github.com/xNrep/GUILibExt
