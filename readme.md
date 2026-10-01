# Frames – Image Gallery

A lightweight, dependency-free image gallery built with plain HTML, CSS, and JavaScript. Everything lives in one file, so there is nothing to install or build.

## Features

- **Masonry layout** that adapts from phones to wide desktops
- **Category filters**: All, Waves, Dunes, Orbits, Blocks, Mine, Favorites
- **Search** images by title
- **Lightbox viewer** with previous/next controls, captions, and an image counter
- **Favorites**, saved in the browser with `localStorage`
- **Add your own images** with the file picker or by dragging files onto the page
- **Remove** images you added from the viewer
- **Light and dark themes**, following the system setting
- **Keyboard accessible**, with visible focus styles and reduced-motion support

## Getting started

1. Download `gallery.html`.
2. Open it in any modern browser.

No server, package manager, or build step is required.

To serve it locally instead:

```bash
python -m http.server 8000
# then visit http://localhost:8000/gallery.html
```

## Usage

| Action | How |
| --- | --- |
| Open an image | Click or tap it |
| Next / previous | `→` / `←` keys, or the on-screen arrows |
| Close the viewer | `Esc`, the ✕ button, or click the backdrop |
| Favorite | Click the heart on a card or in the viewer |
| Add images | Click **Add images**, or drag files onto the page |
| Remove an image | Open it from **Mine**, then click **Remove** |

## Project structure

```
gallery.html   # markup, styles, and script in a single file
```

Inside `gallery.html`:

| Section | Purpose |
| --- | --- |
| `<style>` | Theme tokens (CSS variables), masonry grid, lightbox |
| `art()` | Generates the SVG artwork from a seeded random generator |
| `items` | The list of gallery images (`id`, `title`, `cat`, `src`) |
| Lightbox functions | `open()`, `close()`, `step()` |
| `addFiles()` | Reads uploaded images with `FileReader` |

## Customizing

**Use your own images.** Replace the generated items with real image URLs or data URIs:

```js
items = [
  { id: 0, title: "Mountain lake", cat: "Nature", src: "images/lake.jpg" },
  { id: 1, title: "City at night", cat: "Urban",  src: "images/city.jpg" },
];
```

Then update the `cats` array so the filter chips match your categories:

```js
const cats = ["All", "Nature", "Urban", "Mine", "Favorites"];
```

**Change the colors.** Edit the CSS variables at the top of the stylesheet (`--bg`, `--ink`, `--acc`, and so on). The dark theme overrides live in the `prefers-color-scheme` block.

**Change the grid density.** Adjust `column-width` on `.grid`. Smaller values give more columns.

## Notes and limitations

- Images you add are held in memory only, so they disappear on refresh. Favorites persist, but only for images that still exist.
- To keep uploads between sessions, store them in IndexedDB or upload them to a backend.
- The page loads one web font (Bricolage Grotesque) from Google Fonts and falls back to the system font if it is unavailable.

## Browser support

Current versions of Chrome, Edge, Firefox, and Safari.

## License

MIT. Use it, modify it, and share it freely.
