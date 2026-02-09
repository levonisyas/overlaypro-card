# Overlay Pro Card — Engine Powering Overlay Popup UI Layers

[![HACS Default](https://raw.githubusercontent.com/levonisyas/overlaypro-card/main/badges/hacs-default.svg)](https://hacs.xyz/) [![License](https://raw.githubusercontent.com/levonisyas/overlaypro-card/main/badges/license.svg)](LICENSE) [![Latest Release](https://img.shields.io/github/v/release/levonisyas/overlaypro-card)](https://github.com/levonisyas/overlaypro-card/releases)  

<img src="https://raw.githubusercontent.com/levonisyas/overlaypro-card/main/demo/demo.jpg" width="1200" alt="Overlay Pro Card">

---

>## 🔗 Overlay Pro Card (source & documentation):
>- **<https://github.com/levonisyas/overlaypro-card>**
>- **<https://community.home-assistant.io/t/overlay-pro-card-engine-powering-overlay-popup-ui-layers/>**

---

**Overlay Pro Card is an evolution of the Picture Elements concept:**

- Instead of placing icons or images on top of a dashboard…
- It places **real Lovelace cards** as floating popup overlays
- Using a portal-mode UI layer system (menu + embedded popups)

This card is designed as the overlay engine for future **Dashboard3D** ecosystem.

---

## ⭐ What is Overlay Pro Card?

Overlay Pro Card provides:

- A floating popup card system
- A portal-mode overlay layer (does not break clicks behind it)
- A built-in menu button launcher
- Manual embed targeting with simple IDs (`001–999`)
- Multi-popup dashboards with full positioning control

---

## Features

- ✅ Embed any Lovelace card dynamically
- ✅ Embed cards from any dashboard to any dashboard
- ✅ Works across dashboards/views
- ✅ Floating popup overlays with fixed positioning
- ✅ Built-in menu button launcher
- ✅ Manual ID targeting system (001–999)
- ✅ Scroll support for long cards
- ✅ Hidden overlays do not block clicks behind them
- ✅ Floor3D / Dashboard3D ready

---

## Project Vision

**Overlay Pro Card is part of a future 3-module ecosystem:**

>- Floor3D Pro Card → 3D Scene Engine  
>- Overlay Pro Card → UI Overlay Engine  
>- Scene3D → Full Interactive 3D Dashboard Platform

---

## Installation

### Method 1: HACS (Recommended)

1. Open **HACS** in Home Assistant.
2. Search for: **Overlay Pro Card**.
3. Select the repository and click **Download**.
4. **Restart Home Assistant.**

After installation, HACS will automatically register the card as a Lovelace resource.

---

### Manual Install

1. Download:

   `overlaypro-card.js`

2. Copy into:

   `/config/www/community/overlaypro-card/`

3. Add as Lovelace resource:

```yaml
resources:
  - url: /local/community/overlaypro-card/overlaypro-card.js
    type: module
```

---

### Notes

* No custom repository setup is required, Overlay Pro is in the official **HACS Default Repository Store**.  
* Manual installation is only recommended for advanced or offline setups.  

---

## Core Concept

Overlay Pro Card becomes fully functional as soon as it is installed through HACS, because the card already includes a **working demo configuration** inside its YAML editor.  
Users only need to adjust the **REQUIRED** fields correctly, and the popups will work immediately.

To successfully open a popup, **four YAML fields must match**:

- `icon: EMBED#001` in the **source card**  
- `target: "001"` in the **menu button**  
- `embed_id: "001"` in the **embedder entry**  
- `dashboard: lovelace` in the **embedder entry** — must match the **exact view URL path**

When all four values are correct, Overlay Pro can locate the source card and display it as a popup.

Overlay Pro operates in **two simple steps**:

---

## Step 1 — Define a SOURCE Card

Any Lovelace card can become an embeddable “source card” by adding:

```yaml
icon: EMBED#001
```

### Universal SOURCE Card Template (Global)

This can be **any Lovelace card type**:

```yaml
type: <Your_Card_Type> 
title: <Your_Card_Name>          
icon: EMBED#001  # REQUIRED: Add this line *IMPORTANT* Embed source ID (001–999)        
```

The only required rule is:

```yaml
icon: EMBED#001
```

This marks the card as a **SOURCE** that Overlay Pro can locate and open as a popup.

---

## Step 2 — Open it as an Overlay Popup

Overlay Pro Card automatically searches the dashboard for the matching SOURCE card and displays it as a floating popup.

To open a popup, the following values must match:

- `icon: EMBED#001` in the source card  
- `target: "001"` in the menu button  
- `embed_id: "001"` in the embedder entry 
- `dashboard: lovelace` in the embedder entry — use the exact view URL path (this is what appears in the browser address bar)

All four must align for the popup to function.

---

### A) Add a target to a menu button

```yaml
  buttons:
    - label: <Your_Buton_Label>  
      icon: mdi:<Your_Buton_Icon>
      target: "001"  # REQUIRED: Must match embed_id below *IMPORTANT*
```

---

### B) Add the matching embedder settings

```yaml
embedders:
  - embed_id: "001"      # REQUIRED: 3-digit ID (001-999) *IMPORTANT*
    dashboard: lovelace  # REQUIRED: Dashboard name/path — must match the view’s URL path exactly (case‑sensitive) *IMPORTANT*
```

---

If these three values match (`EMBED#001` → `target: "001"` → `embed_id: "001"`) **and the `dashboard` value correctly matches the view’s URL path**, the popup opens instantly — no extra setup required.

---

### ⭐ NEW STANDARD  — Single Card Engine  

Instead of creating multiple embedder cards,
you now define everything inside one Overlay Pro Card card:

Menu buttons

Popup definitions (embedders["])

Positioning per popup

---

## Full YAML Configuration (Menu + Popups)

```yaml
type: custom:overlaypro-card
portal_mode: global / local  # OPTIONAL: global MODE Mounts UI layers into document.body. // local MODE Mounts overlay layers inside the card itself
multi_mode: true / false     # OPTIONAL: Enables multi-popup mode (multiple embedders can be open at the same time). When true, URL hash is disabled.
                             # NOTE: Open popups are restored after a browser refresh / page reload as long as the URL hash is present
overlay_log: true / false
# ----------------------------
# MENU SETTINGS (OPTIONAL)
# ----------------------------
menu:
  enabled: true            # OPTIONAL: Enable menu buttons (default: false)

  position:                # OPTIONAL: Menu CSS style
    mode: fixed            # OPTIONAL: fixed | absolute (default: fixed)
    bottom: 15%            # OPTIONAL: Vertical position (use either top OR bottom). Accepts CSS values: %, px, vh, rem...
    right: 10%             # OPTIONAL: Horizontal position (use either left OR right). Accepts CSS values: %, px, vw, rem...
    z_index: 1100          # OPTIONAL: Menu layer priority (default: 1100)

  button_style: |          # OPTIONAL: Static button CSS style
    background: black;
    color: white;

  buttons:
    - label: Lights        # OPTIONAL: Button label
      icon: mdi:lightbulb  # OPTIONAL: Button icon
      target: "001"        # REQUIRED: Must match embed_id below *IMPORTANT*

    - label: Climate
      icon: mdi:thermostat
      target: "002"

# ----------------------------
# EMBEDDER POPUPS (REQUIRED)
# ----------------------------
embedders:
  - embed_id: "001"        # REQUIRED: 3-digit ID (001-999) *IMPORTANT*
    dashboard: lovelace    # REQUIRED: Source dashboard name/path *IMPORTANT*
    show_title: false      # OPTIONAL: Hide source card title (default: true)
    enable_scroll: true    # OPTIONAL: Enable scrolling for long content (default: true)
    card_size: 2           # OPTIONAL: Card height scale 1-10 (default: 1)
    show_close: true       # OPTIONAL: Show close (X) button in header (default: false)
    embedder_title: ""     # OPTIONAL: Custom popup title string (default: empty)
    default_visible: false # OPTIONAL: Initial visibility on load (default: false)

    content:
      position:            # OPTIONAL: Popup CSS style
        mode: fixed        # OPTIONAL: fixed | absolute (default: fixed)
        top: 15%           # OPTIONAL: Vertical position (use either top OR bottom). Accepts CSS values: %, px, vh, rem...
        right: 5%          # OPTIONAL: Horizontal position (use either left OR right). Accepts CSS values: %, px, vw, rem...
        width: 380px       # OPTIONAL: Popup width
        height: 300px      # OPTIONAL: Popup height
        z_index: 1000      # OPTIONAL: Popup layer priority (default: 1000)

  - embed_id: "002"
    dashboard: lovelace
    show_title: true
    enable_scroll: true
    show_close: true
    embedder_title: "Climate"
    default_visible: false

    content:
      position:
        mode: fixed
        top: 15%
        right: 45%
        width: 380px
        height: 300px
        z_index: 1000
```

---

### Portal Mode Support (Global vs Local)

Overlay Pro supports two mounting behaviors:

#### `portal_mode: global` (Default)

For most dashboards:
Mounts UI layers into `document.body`.

* Best for true fullscreen overlays
* Works like a system-wide popup engine

```yaml
portal_mode: global
```

#### `portal_mode: local` (Closed System Mode)

For embedded environments (Scene dashboards):
Mounts overlay layers inside the card itself.

* Prevents cross-view overlay persistence
* Useful for Scene3D integration or container dashboards

```yaml
portal_mode: local
```

---

### Multi Mode Support (Single vs Multi Popup)

Overlay Pro supports two popup behaviors:

#### `multi_mode: false` (Default)

Single-popup mode:
Only one embedder can be open at a time.

* Uses URL hash state (`#embed_001`) for deterministic open/close
* Works like a classic single-overlay system

```yaml
multi_mode: false
```

#### `multi_mode: true` (Multi Popup Engine)  

Multi-popup mode:
Multiple embedders can be open at the same time.

* URL hash is used for deterministic state management (`#embed_001,003`)
* Each `embed_id` gets its own isolated popup root
* **Open popups are restored after a browser refresh / page reload as long as the URL hash is present**

```yaml
multi_mode: true
```

---

### Improved Cleanup on View Change

When leaving a dashboard view, Overlay Pro now properly tears down:

* Hash listeners
* Menu layer roots
* Popup content layers

This prevents:

* Ghost menus staying visible
* Home Assistant sidebar becoming unclickable
* UI leftovers after navigation

---

**Visual Editor Notes**

Overlay Pro Card uses `icon: EMBED#001` as the embed marker
because other custom fields often break the Visual Editor.

**CSS Position Units**
```
Position accepts any valid CSS unit:
- %, e.g., top: 15%
- px, e.g., right: 120px
- vh/vw, rem, em, etc.
Use *either* top OR bottom and *either* left OR right to avoid conflicts.
```

**Z-Index Guide**
```
## Z-Index Notes
You can override menu and popup z_index to control stacking.
Menu default: 1100
Popup default: 1000
```

**Overlay Trigger API**
```js
window.dispatchEvent(new CustomEvent('overlaypro-card-open', {
  detail: { target: '001' }
}));
```
```
## JS API (Optional)
Overlay Pro Card listens for:
- overlaypro-card-open { target: "001" }
- overlaypro-card-close { target: "001" }
```

---

## Manual Matching Rule

Buttons always open the popup with the same ID:

```yaml
target: "001"
embed_id: "001"
```

Overlay Pro Card does not auto-match.
Manual control is intentional for stability.
It only shows status + logs if missing.

---

## Important Notes

- Source cards MUST include:

  `icon: EMBED#001`

- Dashboard names are case-sensitive
- Maximum supported IDs:

  `001 → 999`

- Hidden overlays use:

  `display: none`

So they do not block clicks behind them.

---

## Support

Found a bug?

Open an issue on GitHub:

<https://github.com/levonisyas/overlaypro-card>

## 🚨 ERROR CONDITIONS:
No embed_id: "Overlay Pro Card requires both embed_id AND dashboard parameters"
Dashboard not found: "Dashboard 'dashboard_name' not found or inaccessible"
Card not found: "Card with embed ID #XXX not found in dashboard 'dashboard_name'"
Invalid embed_id format: "embed_id must be a 3-digit number (001-999)"


## ✅ SUCCESS MESSAGE (console):
"Overlay Pro Card successfully embedded card #XXX"
"Dashboard: dashboard_name"
"Scroll enabled: true/false"

## 🛠 TROUBLESHOOTING:
Add icon to source card: icon: 'EMBED#001'
Correctly write dashboard name
Make embed_id unique (001-999)
Ctrl+F5 + Home Assistant restart
- “Card not found” → check dashboard name (case sensitive)
- “Overlay behind sidebar” → increase z_index
- “Position not applying” → ensure only one of top/bottom and one of left/right are defined

## ❌ "Card not found" error
1. Verify source card has `icon: EMBED#001` (exact format)
2. Check dashboard name spelling (case-sensitive)
3. Ensure embed ID is unique (001-999)

## ❌ "Dashboard not found" error  
1. Verify dashboard exists and is accessible
2. Check URL path if using custom dashboard names
3. Try with `dashboard: lovelace` for main dashboard

## ❌ Visual Editor shows "Unsupported"
This is normal! Overlay Pro Card uses standard `icon:` property which Visual Editor fully supports. You can still edit the source card normally.

## Stack Compatibility
Works with vertical-stack, horizontal-stack, and grid layouts. Embed ID can be placed in any card within a stack.

## ⚠️ Limitations & Notes

- Maximum 999 unique embed IDs per installation (001-999)
- Source card must be in same Home Assistant instance
- Dashboard names are case-sensitive
- Works with all standard and most custom cards
- Not compatible with cards that dynamically change their `icon:` property


## 🤝 Enjoy ⭐ Support  

I build these projects for **my own needs** and share them so others can benefit.  
I don’t use donation links — so **please don’t buy me coffee** ☕  

>If you enjoy this project, simply **⭐ star the repository**.  
>Your feedback and contributions matter more than coffee.


## Development Notes
This project was developed with a focus on:
- Visual Editor compatibility
- Simple, intuitive configuration
- Maximum compatibility with existing setups
  
*"From blueprints to code - building better solutions for smart homes."*
