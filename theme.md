# Worko Cozy UI Theme

## Design Direction

Worko should feel focused, warm, and premium: Notion's clarity, Linear's
precision, Arc's confident color, and Miro's creative energy. Neutral surfaces
keep the workspace calm while vibrant accents guide attention.

## Color Palette

- App background: `#F8F8FB` cool warm-gray
- Surface: `#FFFFFF` crisp white
- Main text: `#292832` ink
- Muted text: `#777281`
- Border: `#E8E7EF`
- Primary: `#6C5CE7` vivid indigo
- Primary soft: `#EEEAFF`
- Success: `#43A978`
- Warning: `#E49A3A`
- Accent coral: `#EF6688`
- Accent cyan: `#38A7C7`

Use colorful accents purposefully for icons, status, and creative tools. Keep
large surfaces neutral and warm.

## Typography

- Pairings: **General Sans / Satoshi** (Preferred Display Headings) & **Inter** (Body/UI)
- Code blocks: **JetBrains Mono**
- Display / Headings: bold/black, tight letter-spacing (`tracking-tight`), optimized heights.
- Body text: balanced line-heights (`1.6`–`1.8`) for readable layouts.
- Labels & Badges: compact, semibold, and balanced.
- Eyebrows: uppercase with tracking-widest spacing.
- Unified Typography Tokens:
  * `.display-xl` / `.display-lg` (72px–80px / 56px–64px, weight 900)
  * `.text-h1` / `.text-h2` / `.text-h3` / `.text-h4` (42px–48px / 30px–36px / 22px–24px / 18px)
  * `.text-subtitle` / `.text-body-lg` / `.text-body` / `.text-body-sm` (16px / 18px / 16px / 14px)
  * `.text-caption` / `.text-overline` / `.text-btn` (12px / 11px uppercase / 13px semibold)
  * `.text-sidebar` / `.text-table-header` / `.text-table-cell` (12px / 11px / 13px)

## Shape, Spacing, and Depth

- Base spacing unit: `4px`
- Common gaps: `8px`, `12px`, `16px`, `24px`, `32px`
- Controls: `10px–14px` corner radius
- Cards: `20px–22px` corner radius
- Borders are subtle and cool-neutral.
- Shadows are soft, broad, and lightly violet-tinted.

## Interaction Guidelines

- Prefer gentle background and border changes over dramatic animation.
- Use `200–300ms` transitions.
- Active navigation uses a soft gradient, slim indicator, and colored icon tile.
- Group navigation into Overview, Create, and Tools.
- Use subtle lift and shadow changes to make interactive surfaces feel polished.
- Collapsed navigation keeps all icons visible and provides tooltips.
- Focus states should use a soft violet ring with clear contrast.
