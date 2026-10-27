# Website UI assets

The page uses one complete native view of CursorApp’s real trackpad, media controls and eight Mac shortcuts. No generated device photograph, invented UI, enlarged detail crops or partial portrait remains.

- `mac-shortcuts-en.webp`, `mac-shortcuts-ru.webp`: Xcode RenderPreview captures in English and Russian, 1500 × 900 pixels. They render the actual production `RemoteTopBar`, `BlockStack`, `SurfaceWithVolume`, `ComputerLayoutView`, default Mac dock/media/shortcut blocks and Slate tokens in a supported split composition.
- This is a source-rendered production-component preview, not a live paired session. Connection name “Studio” and awake/connected values are illustrative preview data. Command closures are inert and haptics disabled. No purchase, entitlement, network or device state is changed.
- A static panel header mirrors the production split-panel header. The controls themselves are the real components, not redrawn website controls.
- Lossless WebP decoding matches every RGBA pixel in the native PNG captures. No cropping, resizing, retouching or text replacement was performed. The site scales the entire image proportionally.
- English and Russian pages use their matching capture. Other page locales show the real English capture; no claim is made that the screenshot pixels are translated into all eleven languages.
- `brand-mark.svg` is the website’s authored monochrome pointer sign, matching the inline header mark. The header uses one CursorApp wordmark without the old app-icon tile and Helper suffix.

## Reproducible composition

The temporary native SwiftUI fixture uses `#Preview` with fixed 1000 × 600 point layout. Within horizontal padding 52 and vertical padding 20, an HStack has 16-point spacing, the production 460-point remote width and 420-point controls-panel width. The remote has the actual top bar and default Mac main blocks. The panel has the production default Mac drawer blocks, 20-point spacing and a 64-point static header. SlateBackground and the normal dark appearance supply the native surface.

The exact capture fixture is retained in the CursorApp source repository at `docs/design/fixtures/mac-controls-preview.swift.txt`. Raw PNGs were copied to `/private/tmp/native-product-asset-en.png` and `-ru.png` during capture; those temporary files are not required to use the site. Raster sidecars record the origin.

Render destination was the project’s CursorApp simulator, UUID `2A4D2B06-0A3B-4AE3-A274-D7858AC938AF`, iOS 27.2. After earlier Xcode build-service and database failures, the new fixture rendered once the concurrent build finished and ReorderMath’s missing explicit Foundation import was corrected. Its four native geometry tests passed. The capture fixture was then removed byte-for-byte, preserving concurrent source changes; its unique marker is absent from worktree, index and HEAD. The existing Xcode workspace was left open and its toolbar restored only after verifying ownership of the temporary selection.

CursorApp Helper remains free; Mac control in the iPhone app requires CursorApp Pro. This distinction appears beside the page’s download action. No Mac helper screenshot or fabricated system-settings diagram is used.
