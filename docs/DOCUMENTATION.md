# GUILib Documentation

GUILib is a TurboWarp extension for building custom graphical interfaces with Scratch blocks.

## Installation

GUILib uses browser DOM APIs and requires an unsandboxed TurboWarp extension.

1. Open TurboWarp.
2. Add `GUILib.js` as a custom extension.
3. Allow the extension to run unsandboxed.
4. Use the GUILib blocks in your project.

## Basic workflow

A typical project uses this order:

1. Show the GUI.
2. Create elements.
3. Configure their properties.
4. React to GUI events.
5. Optionally use Open Editor to arrange the interface.

## GUI visibility

### Show GUI
Makes the GUILib interface visible.

### Hide GUI
Hides the interface without deleting elements.

### Clear GUI
Removes all current GUI elements.

## Creating elements

### Panel
Creates a rectangular panel. Arguments: ID, X, Y, W, H.

### Label
Creates text. Arguments: ID, TEXT, X, Y.

### Button
Creates a clickable button. Arguments: ID, TEXT, X, Y, W, H.

### Input
Creates a text input. Arguments: ID, PLACEHOLDER, X, Y, W, H.

### Checkbox
Creates a checkbox with a label. Arguments: ID, TEXT, X, Y.

### Slider
Creates a range slider. Arguments: ID, X, Y, W, MIN, MAX.

### Dropdown
Creates a selection menu. OPTIONS is a comma-separated list.

### Window
Creates a draggable window. Arguments: ID, TITLE, X, Y, W, H.

## Element properties

Use `set [ID] property [PROPERTY] to [VALUE]` to change an element.

Common properties:

| Property | Description |
|---|---|
| `x` | Horizontal position |
| `y` | Vertical position |
| `width` | Element width |
| `height` | Element height |
| `text` | Element text |
| `value` | Control value |
| `color` | Text color |
| `background` | Background color |
| `fontSize` | Font size |
| `radius` | Border radius |
| `opacity` | Opacity |
| `placeholder` | Input placeholder |
| `draggable` | Enable or disable dragging |

Use `get [PROPERTY] of [ID]` to read a property.
Use `[ID] exists?` to check whether an element exists.

## Element management

- `remove [ID]` deletes an element.
- `bring [ID] to front` moves it above other elements.
- `set [ID] draggable [STATE]` enables or disables dragging.

## Events

GUILib provides Scratch hat blocks for interaction:

- `when GUI element [ID] is clicked`
- `when GUI element [ID] changes`
- `when modal [ID] is confirmed`
- `when tab [ID] is selected`

## Toasts, modals and tooltips

### Toast
`show toast [TEXT]` displays a temporary notification.

### Modal
`show modal [ID] title [TITLE] message [MESSAGE]` displays a confirmation dialog.

### Tooltip
`set [ID] tooltip to [TEXT]` adds a tooltip to an element.

## Themes and scaling

Available themes: `dark`, `light`, `blue`, and `purple`.
Use `set theme to [THEME]` to select one.

Use `set GUI scale to [SCALE]` to change the overall scale. `1` is the normal scale.

## Visual editor

Use `Open Editor` to open the editor in a new browser tab.

The editor provides:

- Hierarchy list
- Element selection
- Position editing
- Size editing
- Dragging
- Resizing
- Grid toggle
- Snap-to-grid
- Duplicate
- Delete
- JSON export
- JSON import

Changes made in the editor are synchronized with the running GUILib instance.

## JSON layouts

The editor can export the current layout as JSON and import it again later.

A layout stores element IDs, types, positions, sizes and text.

## Example project

A simple interface can contain:

`Show GUI`
`create label [title] text [My App] at x [100] y [60]`
`create button [start] text [Start] at x [100] y [110] width [140] height [40]`
`when GUI element [start] is clicked`

## Troubleshooting

### The extension does not load
Make sure you are using `GUILib.js`, loading it as a custom extension, and allowing unsandboxed execution.

### The GUI does not appear
Run `Show GUI` before creating or using GUI elements.

### Open Editor does nothing
Check that the browser is not blocking the new tab or popup.

### An element cannot be found
Use exactly the same ID in every block that refers to the element.

## Repository structure

GUILibExt/
├── GUILib.js
├── README.md
├── docs/
│   └── DOCUMENTATION.md
└── LICENSE

## License

GUILib is distributed under the MIT License. See [LICENSE](../LICENSE).