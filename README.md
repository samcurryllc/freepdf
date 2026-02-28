# FreePDF

A free, private PDF signing tool that runs entirely in your browser. No uploads, no servers, no accounts — your documents never leave your device.

**Live:** [samuel-pdf.postnew.net](https://samuel-pdf.postnew.net)

## Features

- **Sign & Certify** — Draw or upload signatures, add initials, generate self-signed certificates with full audit trails
- **Annotate** — Text, dates, checkboxes, highlights, strikethrough, underline, sticky notes, shapes, drawings, whiteout
- **Document Tools** — Watermarks, headers/footers, page management, PDF merging
- **Auto-Save** — Documents persist in IndexedDB with automatic saving and a dashboard to resume work
- **Mobile-First** — Full touch support with pointer events, bottom-sheet panels, and responsive layout
- **100% Client-Side** — All processing happens in the browser using pdf-lib and pdfjs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| PDF Rendering | react-pdf (pdfjs) |
| PDF Manipulation | pdf-lib |
| Signatures | signature_pad + node-forge |
| Animation | Motion (Framer Motion) |
| Icons | Lucide React |
| Build | Vite 7 |
| Deploy | Docker + Nginx |

## Getting Started

```bash
npm install
npm run dev
```

Open [localhost:5173](http://localhost:5173).

## Docker

```bash
docker build -t freepdf .
docker run -p 8080:8080 freepdf
```

## Project Structure

```
src/
├── App.tsx                     # Dashboard ↔ Editor routing
├── main.tsx                    # Entry point
├── index.css                   # Tailwind + mobile utilities
├── types/                      # TypeScript interfaces
├── state/                      # Reducer + Context (EditorProvider)
├── hooks/                      # useAutoSave, useHistory, useKeyboardShortcuts
├── lib/                        # PDF export, merge, digital signatures, IndexedDB
└── components/
    ├── screens/                # DashboardScreen, EditorScreen
    ├── panels/                 # ToolsPanel, PropertiesPanel, BottomBar, MobileToolBar
    ├── pdf/                    # PDFViewport, PDFPageWrapper, ZoomControls
    ├── annotations/            # AnnotationItem, ResizeHandles, 14 annotation views
    ├── modals/                 # Signature, Image, StickyNote, Watermark, etc.
    └── ui/                     # Button, IconButton, Modal, Toast, ColorPicker, etc.
```

## License

MIT
