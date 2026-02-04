// ============================================================================
// Overlay Pro Card for Home Assistant
// ============================================================================

class overlayprocard extends HTMLElement {
    // --------------------------------------------------------------------------
    // SETTING: STUB_CONFIG (HACS DEMO)
    // - Visual editor "Show code editor" için demo config üretir
    // - Floor3D örneği gibi /hacsfiles veya /local/community yolunu otomatik seçer
    // --------------------------------------------------------------------------
    static getStubConfig(hass, entities, entitiesFallback) {
      void hass;
      void entities;
      void entitiesFallback;

      const url = new URL(import.meta.url);
      let asset = url.pathname.split('/').pop();
      let path = url.pathname.replace(asset, '');

      // HACS install path auto-detect
      if (path.includes('hacsfiles')) {
        path = '/local/community/overlaypro-card/';
      }

      // DEMO: ready-to-paste style (works best if you add source cards with icon: EMBED#001, EMBED#002)
      return {
        // overlay_log: false => default OFF (no debug spam)
        overlay_log: false,

        // portal_mode: "global" => default (you can set "local")
        portal_mode: 'global',

        menu: {
          enabled: true,
          position: {
            mode: 'fixed',
            bottom: '15%',
            right: '10%',
            z_index: 1100
          },
          buttons: [
            { label: 'Lights', icon: 'mdi:lightbulb', target: '001' },
            { label: 'Climate', icon: 'mdi:thermostat', target: '002' }
          ]
        },

        // NOTE: dashboards are examples - change if needed
        embedders: [
          {
            embed_id: '001',
            dashboard: 'lovelace',
            embedder_title: 'Lights',
            show_close: true,
            show_title: true,
            default_visible: false,
            enable_scroll: true,
            content: {
              position: {
                mode: 'fixed',
                bottom: '35%',
                right: '15%',
                width: '280px',
                height: '100px',
                z_index: 1000
              }
            }
          },
          {
            embed_id: '002',
            dashboard: 'lovelace',
            embedder_title: 'Climate',
            show_close: true,
            show_title: true,
            default_visible: false,
            enable_scroll: true,
            content: {
              position: {
                mode: 'fixed',
                top: '15%',
                right: '35%',
                width: '380px',
                height: '300px',
                z_index: 1000
              }
            }
          }
        ]
      };
    }

    // --------------------------------------------------------------------------
    // SETTING: OVERLAY_LOG
    // --------------------------------------------------------------------------
    _log(...args) {
      try {
        const enabled = !!(this._config && this._config.overlay_log === true);
        if (enabled) console.log(...args);
      } catch (e) {}
    }
    _warn(...args) {
      try {
        const enabled = !!(this._config && this._config.overlay_log === true);
        if (enabled) console.warn(...args);
      } catch (e) {}
    }
    _error(...args) {
      try {
        console.error(...args);
      } catch (e) {}
    }

    // --------------------------------------------------------------------------
    // Configuration Setup - optimized validation
    // --------------------------------------------------------------------------
    setConfig(config) {
      // --------------------------------------------------------------------------
      // SETTING: CONFIG_VALIDATION (Etap.1)
      // - Menu does NOT require dashboard
      // - Embedded content supports Floor3D-style list: embedders[]
      // - Backward compatible: single embed_id + dashboard
      // --------------------------------------------------------------------------

      const menuOnly = config.menu_only === true;

      // NEW: embedders[] support (single card, multiple popups)
      const hasEmbedders = Array.isArray(config.embedders) && config.embedders.length > 0;

      // Backward compatibility: old single-embed requires dashboard + embed_id (unless menu_only)
      // New mode: dashboard can be per-embedder (global dashboard optional)
      if (!hasEmbedders) {
        // legacy path
        if (!menuOnly) {
          if (!config.dashboard) {
            throw new Error('Overlay Pro Card requires dashboard parameter (legacy mode)');
          }
          if (!config.embed_id) {
            throw new Error('Overlay Pro Card requires embed_id (unless menu_only: true)');
          }
          const embedIdRegex = /^\d{3}$/;
          if (!embedIdRegex.test(config.embed_id.toString())) {
            throw new Error('embed_id must be a 3-digit number (001-999)');
          }
        }
      } else {
        // new path: validate each embedder entry
        const embedIdRegex = /^\d{3}$/;
        const globalDash = config.dashboard ? String(config.dashboard) : null;

        config.embedders.forEach((e, idx) => {
          const id = e && e.embed_id != null ? String(e.embed_id) : '';
          if (!embedIdRegex.test(id)) {
            throw new Error(`embedders[${idx}].embed_id must be a 3-digit number (001-999)`);
          }
          const dash = (e && e.dashboard != null) ? String(e.dashboard) : globalDash;
          if (!dash) {
            throw new Error(`embedders[${idx}].dashboard is required (or set global dashboard)`);
          }
        });
      }

      // Normalize embedders[] (store stable defaults per embedder)
      const normalizedEmbedders = hasEmbedders
        ? config.embedders.map((e) => {
            const globalDash = config.dashboard ? String(config.dashboard) : null;
            const embedId = String(e.embed_id).padStart(3, '0');
            const dash = (e.dashboard != null) ? String(e.dashboard) : globalDash;

            return {
              ...e,
              embed_id: embedId,
              dashboard: dash,
              embedder_title: (e.embedder_title != null ? String(e.embedder_title) : ''),
              show_close: (e.show_close === true),
              show_title: (e.show_title !== false),
              default_visible: (e.default_visible === true),
              enable_scroll: (e.enable_scroll !== false),
              content: {
                position: {
                  mode: (e.content && e.content.position && e.content.position.mode) || 'fixed',
                  // IMPORTANT: content defaults should NOT force right/bottom unless user sets
                  top: (e.content && e.content.position && e.content.position.top) ?? null,
                  left: (e.content && e.content.position && e.content.position.left) ?? null,
                  right: (e.content && e.content.position && e.content.position.right) ?? null,
                  bottom: (e.content && e.content.position && e.content.position.bottom) ?? null,
                  z_index: (e.content && e.content.position && e.content.position.z_index) ?? 1000,
                  width: (e.content && e.content.position && e.content.position.width) ?? 520,
                  height: (e.content && e.content.position && e.content.position.height) ?? 420
                }
              }
            };
          })
        : [];

      // Store configuration with new parameters
      this._config = {
        ...config,
        menu_only: menuOnly,
        embedders: normalizedEmbedders,              // NEW: single card multi-embed list
        enable_scroll: config.enable_scroll !== false, // legacy single-embed default: true
        // SETTING: OVERLAY_LOG
        // Controls: console log/warn verbosity
        // YAML:
        //   overlay_log: true  => ON (legacy)
        //   overlay_log: []    => OFF (default)
        //   overlay_log: [...] => ON (future flags)
        // SETTING: OVERLAY_LOG
        // YAML:
        //   overlay_log: true|false
        overlay_log: (config.overlay_log === true),

        // SETTING: PORTAL_MODE
        // YAML:
        //   portal_mode: "global" | "local"
        portal_mode: (config.portal_mode === 'local') ? 'local' : 'global',

        // Legacy header defaults (only used when NOT using embedders[])
        show_close: config.show_close || false,
        embedder_title: config.embedder_title || '',
        show_title: config.show_title !== false,
        default_visible: config.default_visible !== false,

        // NEW: Sabit menü + overlay içerik (tek card içinde)
        menu: {
          enabled: (config.menu && config.menu.enabled === true), // Default: false
          position: {
            mode: (config.menu && config.menu.position && config.menu.position.mode) || 'fixed',
            // IMPORTANT: top/right default ZORLA gelmesin; user bottom/right verirse top boş kalmalı
            top: (config.menu && config.menu.position && config.menu.position.top) ?? null,
            left: (config.menu && config.menu.position && config.menu.position.left) ?? null,
            right: (config.menu && config.menu.position && config.menu.position.right) ?? null,
            bottom: (config.menu && config.menu.position && config.menu.position.bottom) ?? null,
            z_index: (config.menu && config.menu.position && config.menu.position.z_index) ?? 1100
          },
          buttons: (config.menu && Array.isArray(config.menu.buttons)) ? config.menu.buttons : [],

          // NEW: Button styling (global) - ONLY STATIC (no hover)
          button_style: (config.menu && typeof config.menu.button_style === 'string') ? config.menu.button_style : null
        },

        // NEW: İçerik overlay pozisyonu (card-mod yok)
        content: {
          position: {
            mode: (config.content && config.content.position && config.content.position.mode) || 'fixed',
            top: (config.content && config.content.position && config.content.position.top) ?? null,
            left: (config.content && config.content.position && config.content.position.left) ?? null,
            right: (config.content && config.content.position && config.content.position.right) ?? null,
            bottom: (config.content && config.content.position && config.content.position.bottom) ?? null,
            z_index: (config.content && config.content.position && config.content.position.z_index) ?? 1000,
            width: (config.content && config.content.position && config.content.position.width) ?? 520,
            height: (config.content && config.content.position && config.content.position.height) ?? 420
          }
        }
      };

      // NOT: hass setter daha sonra set ediliyor; ama edit-save sonrası hass zaten set olabilir.
      // hass'ı burada sıfırlamayalım; state reset yapıp yeniden render edelim.
      this._loaded = false;
      // SETTING: OVERLAY_LOG (global flag for helper functions too)
      window.__OVERLAY_PRO_LOG = !!(this._config && this._config.overlay_log === true);

      // --------------------------------------------------------------------------
      // SETTING: VIEW_VISIBILITY_GUARD (Etap.1 Fix)
      // Prevents:
      // - menu flash on other views
      // - sidebar clicks blocked by stale overlay/content
      // --------------------------------------------------------------------------
      this._viewIO = null;
      this._boundLocationChanged = null;
      this._portalActive = true;

      // Portal/layer refs reset (edit/save sonrası kaybolmayı engeller)
      try {
        if (this._menuRoot && this._menuRoot.parentNode) this._menuRoot.parentNode.removeChild(this._menuRoot);
        if (this._contentRoot && this._contentRoot.parentNode) this._contentRoot.parentNode.removeChild(this._contentRoot);
        if (this._portalRoot && this._portalRoot.parentNode) this._portalRoot.parentNode.removeChild(this._portalRoot);
      } catch (e) {}

      this._portalRoot = null;
      this._menuRoot = null;
      this._contentRoot = null;

      // Host temizle (ama portal body'de olduğu için asıl UI zaten orada)
      this.innerHTML = '';

      // Eğer hass zaten geldiyse (edit/save sonrası sık olur) yeniden yükle
      if (this._hass) {
        Promise.resolve().then(() => this._loadCard());
      } else {
        // hass gelmeden de menüyü kur (menu-only veya genel menü)
        Promise.resolve().then(() => {
          if (typeof this._ensureLayerRoots === 'function') {
            this._ensureLayerRoots();
            // default visible content sadece embed modda anlamlı
            if (this._config && this._config.default_visible) {
              this._showContentLayer();
            } else {
              this._hideContentLayer();
            }
          }
        });
      }
    }
    // --------------------------------------------------------------------------
    // SETTING: VIEW_VISIBILITY_GUARD (Etap.1 Fix)
    // Hide menu/content when this card is not visible in current view.
    // --------------------------------------------------------------------------
    _setPortalActive(active) {
      this._portalActive = !!active;

      // If roots not created yet, nothing to do
      if (!this._menuRoot && !this._contentRoot) return;

      // Menu: only show if enabled AND portal active
      if (this._menuRoot) {
        const enabled = !!(this._config && this._config.menu && this._config.menu.enabled);
        this._menuRoot.style.display = (this._portalActive && enabled) ? 'block' : 'none';
      }

      // Content: when portal inactive => force-hide (prevents click-block / stale overlays)
      if (this._contentRoot) {
        if (!this._portalActive) {
          this._contentRoot.style.display = 'none';
        } else {
          // When active again, respect hash/default logic
          try {
            if (typeof this._checkHash === 'function') {
              this._checkHash();
            }
          } catch (e) {}
        }
      }
    }

    _setupViewVisibilityGuard() {
      try {
        // Clear previous observer/listeners
        if (this._viewIO) {
          this._viewIO.disconnect();
          this._viewIO = null;
        }

        // Observe card visibility
        this._viewIO = new IntersectionObserver((entries) => {
          const visible = !!(entries && entries.some(e => e.isIntersecting && e.intersectionRatio > 0));
          this._setPortalActive(visible);
        }, { threshold: 0.01 });

        this._viewIO.observe(this);

        // Also react to route/view changes
        if (!this._boundLocationChanged) {
          // FIX: Seed route key so the FIRST hashchange does NOT trigger guard flow.
          // Otherwise first menu click can cause duplicate _checkHash() / duplicate logs.
          this._lastRouteKey = window.location.pathname + window.location.search;

          this._boundLocationChanged = () => {
            // FIX: Ignore hash-only changes (menu buttons change hash; should NOT trigger view-guard)
            // Route key excludes hash to prevent duplicate _checkHash() / duplicate logs.
            const routeKey = window.location.pathname + window.location.search;
            if (this._lastRouteKey === routeKey) return;
            this._lastRouteKey = routeKey;

            setTimeout(() => {
              // “isConnected + offsetParent” = pratik görünürlük check
              // Always hide first (prevents menu sticking on other dashboards)
              this._setPortalActive(false);

              // Then re-check after HA finishes rendering new view
              setTimeout(() => {
                const visible = !!(this.isConnected && this.offsetParent !== null);
                this._setPortalActive(visible);
              }, 50);
            }, 0);
          };

          window.addEventListener('location-changed', this._boundLocationChanged);
          // EXTRA: HA navigation sometimes does not trigger IntersectionObserver correctly
          // Force-hide portal UI on all navigation events
          window.addEventListener('popstate', this._boundLocationChanged);
          window.addEventListener('hashchange', this._boundLocationChanged);

        }
      } catch (e) {
        // fail-safe: hide everything to avoid blocking HA UI
        this._setPortalActive(false);
      }
    }

    _teardownViewVisibilityGuard() {
      try {
        if (this._viewIO) {
          this._viewIO.disconnect();
          this._viewIO = null;
        }
        if (this._boundLocationChanged) {
          window.removeEventListener('location-changed', this._boundLocationChanged);
          window.removeEventListener('popstate', this._boundLocationChanged);
          window.removeEventListener('hashchange', this._boundLocationChanged);

          this._boundLocationChanged = null;
        }
      } catch (e) {}
    }


    // --------------------------------------------------------------------------
    // SETTING: EDIT_SAVE_LIFECYCLE_FIX
    // Lovelace edit/save reload stability (re-attach portal + layers)
    // --------------------------------------------------------------------------

    connectedCallback() {
      // Lovelace edit/save sonrası element yeniden bağlanabilir.
      // Menü her zaman görünür olmalı.
      try {
        this._ensureLayerRoots();

        // SETTING: VIEW_VISIBILITY_GUARD
        this._setupViewVisibilityGuard();

        // content başlangıç görünürlüğü
        if (this._config && this._config.default_visible) {
          this._showContentLayer();
        } else {
          this._hideContentLayer();
        }

        // ensure correct state immediately
        const visible = !!(this.isConnected && this.offsetParent !== null);
        this._setPortalActive(visible);

      } catch (e) {}
    }
  
    // --------------------------------------------------------------------------
    // Home Assistant Integration
    // --------------------------------------------------------------------------
    set hass(hass) {
      this._hass = hass;
      if (!this._loaded) {
        this._loadCard();
      } else if (this._contentElement) {
        this._contentElement.hass = hass;
      }
    }
    // --------------------------------------------------------------------------
    // Layer Root Setup (Menu: always visible, Content: overlay toggles)
    // --------------------------------------------------------------------------
    // --------------------------------------------------------------------------
    // SETTING: PORTAL_MODE
    // Menu/content mounted to document.body for Lovelace stability
    // --------------------------------------------------------------------------

    _ensureLayerRoots() {
      // PORTAL: Lovelace layout/overflow/transform yüzünden fixed elemanlar görünmez olabiliyor.
      // Çözüm: Menü + content katmanlarını document.body altına taşımak.
      // SETTING: PORTAL_MODE
      // global (default) => document.body
      // local            => this (card container)
      const mode = (this._config && this._config.portal_mode) ? this._config.portal_mode : 'global';

      // CLOSED SYSTEM:
      // local  => mount inside this card (true local viewport)
      // global => mount to document.body (legacy)
      const mountTarget = (mode === 'local') ? this : document.body;
      // =========================================================================
      // DEBUG: Portal mount mode log (ALWAYS visible, once)
      // =========================================================================
      if (!this._portalModeLogged) {
        this._portalModeLogged = true;

        const targetName =
          (mountTarget === document.body)
            ? 'document.body'
            : (mountTarget.tagName ? mountTarget.tagName.toLowerCase() : 'local-container');

        console.info(
          `pro.[OVERLAY] portal_mode:"${mode}" mounted to → ${targetName}`
        );
      }

      if (!this._portalRoot) {
        this._portalRoot = document.createElement('div');
        this._portalRoot.className = 'overlaypro-card-portal';
        // Sadece cleanup için marker
        this._portalRoot.style.cssText = `display: none;`;
        mountTarget.appendChild(this._portalRoot);
      }

      if (!this._menuRoot) {
        this._menuRoot = document.createElement('div');
        this._menuRoot.className = 'overlaypro-card-menu-root';
        this._menuRoot.style.pointerEvents = 'auto';

        // LOCAL: roots overlay inside this card viewport
        if (mode === 'local') {
          this._menuRoot.style.position = 'absolute';
          this._menuRoot.style.inset = '0';
        }

        mountTarget.appendChild(this._menuRoot);
      }
      this._applyMenuPositioning();

      if (!this._contentRoot) {
        this._contentRoot = document.createElement('div');
        this._contentRoot.className = 'overlaypro-card-content-root';
        this._contentRoot.style.pointerEvents = 'auto';

        // LOCAL: roots overlay inside this card viewport
        if (mode === 'local') {
          this._contentRoot.style.position = 'absolute';
          this._contentRoot.style.inset = '0';
        }

        mountTarget.appendChild(this._contentRoot);
      }
      // IMPORTANT: In embedders[] mode, do NOT override active popup positioning.
      // If an embedder is active, apply its positioning; otherwise use global/default.
      this._applyContentPositioning(this._getActiveEmbedderSettings());

      // Render menu always (even if content hidden)
      this._renderMenu();
    }
    // --------------------------------------------------------------------------
    // SETTING: MENU_POSITION
    // Controls: menu top/left/right/bottom/z-index/mode
    // --------------------------------------------------------------------------

    _applyMenuPositioning() {
      const p = (this._config.menu && this._config.menu.position) ? this._config.menu.position : {};
      const toPx = (v) => (typeof v === 'number' ? `${v}px` : v);

      this._menuRoot.style.position = p.mode || 'fixed';
      this._menuRoot.style.zIndex = String(p.z_index ?? 1100);

      // reset
      this._menuRoot.style.top = '';
      this._menuRoot.style.left = '';
      this._menuRoot.style.right = '';
      this._menuRoot.style.bottom = '';

      // Fallback: user hiç konum vermediyse sağ üst
      const hasVertical = (p.top != null) || (p.bottom != null);
      const hasHorizontal = (p.left != null) || (p.right != null);

      if (!hasVertical) this._menuRoot.style.top = '100px';
      if (!hasHorizontal) this._menuRoot.style.right = '20px';

      if (p.top != null) this._menuRoot.style.top = toPx(p.top);
      if (p.left != null) this._menuRoot.style.left = toPx(p.left);
      if (p.right != null) this._menuRoot.style.right = toPx(p.right);
      if (p.bottom != null) this._menuRoot.style.bottom = toPx(p.bottom);
    }
    // --------------------------------------------------------------------------
    // SETTING: CONTENT_POSITION
    // Controls: popup width/height/top/left/z-index
    // --------------------------------------------------------------------------

    _applyContentPositioning(active = null) {
      const cfgPos =
        (active && active.content && active.content.position)
          ? active.content.position
          : ((this._config.content && this._config.content.position) ? this._config.content.position : {});

      const p = cfgPos || {};
      const toPx = (v) => (typeof v === 'number' ? `${v}px` : v);

      this._contentRoot.style.position = p.mode || 'fixed';
      this._contentRoot.style.zIndex = String(p.z_index ?? 1000);

      // reset
      this._contentRoot.style.top = '';
      this._contentRoot.style.left = '';
      this._contentRoot.style.right = '';
      this._contentRoot.style.bottom = '';
      this._contentRoot.style.width = '';
      this._contentRoot.style.height = '';

      // Fallback: user hiç konum vermediyse varsayılan ver
      // IMPORTANT: user bottom/right verirse top/left zorlanmaz (menu ile aynı mantık)
      const hasVertical = (p.top != null) || (p.bottom != null);
      const hasHorizontal = (p.left != null) || (p.right != null);

      if (!hasVertical) this._contentRoot.style.top = '80px';
      if (!hasHorizontal) this._contentRoot.style.left = '50px';

      if (p.top != null) this._contentRoot.style.top = toPx(p.top);
      if (p.left != null) this._contentRoot.style.left = toPx(p.left);
      if (p.right != null) this._contentRoot.style.right = toPx(p.right);
      if (p.bottom != null) this._contentRoot.style.bottom = toPx(p.bottom);

      if (p.width != null) this._contentRoot.style.width = toPx(p.width);
      if (p.height != null) this._contentRoot.style.height = toPx(p.height);
    }

    _showContentLayer() {
      if (!this._contentRoot) return;
      this._contentRoot.style.display = 'block';
    }

    _hideContentLayer() {
      if (!this._contentRoot) return;
      // IMPORTANT: display:none => 3D tıklamaları engellenmez
      this._contentRoot.style.display = 'none';
    }

    _clearHash() {
      try {
        const url = window.location.pathname + window.location.search;
        history.replaceState(null, '', url);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      } catch (e) {
        // fallback
        window.location.hash = '';
      }
    }

    _toggleHash(embedId) {
      const myHash = `#embed_${embedId}`;
      if (window.location.hash === myHash) {
        this._clearHash();
      } else {
        window.location.hash = myHash;
      }
    }

    _renderMenu() {
      if (!this._menuRoot) return;

      // Menü kapalıysa bile root durur; sadece görünüm yönetimi
      const enabled = !!(this._config.menu && this._config.menu.enabled);
      if (!enabled) {
        this._menuRoot.style.display = 'none';
        return;
      }

      this._menuRoot.style.display = 'block';
      this._menuRoot.innerHTML = '';
      // ------------------------------------------------------------------------
      // SETTING: MENU_CONTAINER_STYLE
      // Controls: wrapper background, padding, gap, border-radius, shadow
      // ------------------------------------------------------------------------

      const wrap = document.createElement('div');
      wrap.className = 'overlaypro-card-menu';
      wrap.style.cssText = `
        display: flex;
        gap: 8px;
        padding: 8px;
        border-radius: 0px;
        background: transparent;
        box-shadow: none;
        align-items: center;
      `;

      const buttons = (this._config.menu && Array.isArray(this._config.menu.buttons)) ? this._config.menu.buttons : [];
      buttons.forEach((b) => {
        const target = b.target || b.embed_id;
        if (!target) return;
        // ----------------------------------------------------------------------
        // SETTING: BUTTON_STYLE
        // Controls: button background, color, radius, font, spacing
        // ----------------------------------------------------------------------

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'overlaypro-card-menu-button';
        const baseStyle = `
          border: none;
          cursor: pointer;
          padding: 8px 10px;
          border-radius: 0px;
          background: var(--primary-color);
          color: var(--text-primary-color, #fff);
          font-weight: 600;
          display: inline-flex;
          gap: 6px;
          align-items: center;
        `;
        // ----------------------------------------------------------------------
        // SETTING: BUTTON_STYLE_OVERRIDE
        // YAML: menu.button_style (global) or buttons[].style (per button)
        // ----------------------------------------------------------------------

        // Static override (per-button > global)
        const overrideStyle =
          (b.style && typeof b.style === 'string' ? b.style : '') ||
          (this._config.menu && typeof this._config.menu.button_style === 'string'
            ? this._config.menu.button_style
            : '');

        btn.style.cssText = baseStyle + (overrideStyle ? `\n${overrideStyle}` : '');

        // Optional icon support (mdi:...)
        if (b.icon) {
          const iconEl = document.createElement('ha-icon');
          iconEl.setAttribute('icon', b.icon);
          iconEl.style.cssText = `
            width: 18px;
            height: 18px;
            color: inherit;
          `;
          btn.appendChild(iconEl);
        }

        const labelSpan = document.createElement('span');
        labelSpan.textContent = b.label || target;
        btn.appendChild(labelSpan);

        btn.addEventListener('click', () => {
          this._toggleHash(String(target).padStart(3, '0'));
        });

        wrap.appendChild(btn);
      });

      this._menuRoot.appendChild(wrap);
    }
  
    // --------------------------------------------------------------------------
    // Main Loading Function - optimized performance
    // --------------------------------------------------------------------------
    async _loadCard() {
      // Clean host setup
      // SETTING: PORTAL_MODE (local = closed system viewport, global = click-through)
      const mode = (this._config && this._config.portal_mode) ? this._config.portal_mode : 'global';

      this.style.display = 'block';
      this.style.position = 'relative';
      this.style.padding = '0';
      this.style.margin = '0';
      this.style.borderRadius = '0';

      if (mode === 'local') {
        // LOCAL: host is the viewport container
        this.style.width = '100%';
        this.style.height = '100%';
        this.style.minHeight = '1px';
        this.style.pointerEvents = 'auto';
      } else {
        // GLOBAL: host is click-through (0x0)
        this.style.width = '0';
        this.style.height = '0';
        this.style.minHeight = '0';
        this.style.pointerEvents = 'none'; // host kesinlikle click yakalamasın
      }


      // Prepare layer roots (menu always visible, content toggles)
      this.innerHTML = '';
      this._ensureLayerRoots();

      // Loading indicator goes to content layer only
      this._showContentLayer();
      const initIdRaw =
        (this._config && this._config.embed_id != null)
          ? String(this._config.embed_id).padStart(3, '0')
          : null;

      const initIcon = initIdRaw ? `EMBED#${initIdRaw}` : null;

      this._contentRoot.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--primary-color);">
          <div style="font-style: italic; margin-bottom: 10px;">
            Overlay Pro Card initializing...
          </div>
          <div style="font-size: 0.9em; color: var(--secondary-text-color);">
            ${initIcon
              ? `Searching for source card (icon): <strong>${initIcon}</strong>`
              : `Waiting for menu selection...`
            }
          </div>
          ${initIcon ? `
          <div style="margin-top: 10px; font-size: 0.85em; color: var(--secondary-text-color);">
            If not found, add to your source card:<br>
            <code>icon: ${initIcon}</code>
          </div>
          ` : ``}
        </div>
      `;

  
      try {
        // Menü her durumda kurulsun (menu sabit)
        this._ensureLayerRoots();

        // NEW: If embedders[] exists, this single card manages multiple popups
        const hasList = this._hasEmbeddersList();

        // menu_only legacy: only menu + hash (NO content) if there is no embedders list
        if (this._config.menu_only && !hasList) {
          this._setupHashControl();
          this._hideContentLayer();
          this._loaded = true;
          this._log('🎛️ Overlay Pro Card: menu_only mode active (legacy - no embedded content)');
          return;
        }

        // HASH CONTROL (works for both legacy and list)
        this._setupHashControl();

        if (hasList) {
          // If any embedder has default_visible: true, open it without forcing hash
          const defId = this._getDefaultVisibleEmbedderId();
          if (defId) {
            await this._openEmbedderById(defId, { fromHash: false });
            this._showContentLayer();
          } else {
            this._hideContentLayer();
          }
          this._loaded = true;
          return;
        }

        // Legacy single-embed behavior
        const cardConfig = await this._findCardByEmbedId(this._config.dashboard, this._config.embed_id, this._config.show_title);
        await this._createCardContent(cardConfig);

        // default visibility now only affects CONTENT layer (menu stays visible)
        if (this._config.default_visible) {
          this._showContentLayer();
        } else {
          this._hideContentLayer();
        }
        
      } catch (error) {
        // User-friendly error messages (content layer only; menu remains)
        this._ensureLayerRoots();
        this._showContentLayer();

        this._contentRoot.innerHTML = `
          <div style="color: var(--error-color); padding: 20px; text-align: center;">
            <div style="font-size: 1.2em; margin-bottom: 10px;">
              🔍 Embedding Failed
            </div>
            <div style="margin-bottom: 15px;">
              ${error.message}
            </div>
            <div style="font-size: 0.9em; color: var(--secondary-text-color);">
              <strong>Troubleshooting tips:</strong><br>
              1. Add <code>icon: EMBED#${(this._activeEmbedId || this._config.embed_id || '001')}</code> to your source card<br>
              2. Verify dashboard name: "${((this._getActiveEmbedderSettings && this._getActiveEmbedderSettings()) ? (this._getActiveEmbedderSettings().dashboard || this._config.dashboard) : (this._config.dashboard))}"<br>
              3. Ensure embed_id is unique (001-999)
            </div>
          </div>
        `;
      }
    }
    // --------------------------------------------------------------------------
    // SETTING: EMBEDDERS_LIST (Etap.1)
    // Controls: single card contains multiple embedder definitions (Floor3D style)
    // - menu.buttons[].target -> embedders[].embed_id
    // - dashboard is per-embedder (global dashboard optional)
    // --------------------------------------------------------------------------

    _hasEmbeddersList() {
      return !!(this._config && Array.isArray(this._config.embedders) && this._config.embedders.length > 0);
    }

    _getEmbedderDef(embedId) {
      if (!this._hasEmbeddersList()) return null;
      const id = String(embedId || '').padStart(3, '0');
      return this._config.embedders.find(e => String(e.embed_id) === id) || null;
    }

    _getActiveEmbedderSettings(embedIdOverride = null) {
      // Legacy mode (single embed_id)
      if (!this._hasEmbeddersList()) {
        return {
          embed_id: this._config.embed_id,
          dashboard: this._config.dashboard,
          embedder_title: this._config.embedder_title || '',
          show_close: !!this._config.show_close,
          show_title: (this._config.show_title !== false),
          default_visible: !!this._config.default_visible,
          enable_scroll: (this._config.enable_scroll !== false),
          content: this._config.content
        };
      }

      const id = String(embedIdOverride || this._activeEmbedId || '').padStart(3, '0');
      const def = this._getEmbedderDef(id);

      if (!def) return null;

      return {
        embed_id: def.embed_id,
        dashboard: def.dashboard,
        embedder_title: def.embedder_title || '',
        show_close: (def.show_close === true),
        show_title: (def.show_title !== false),
        default_visible: (def.default_visible === true),
        enable_scroll: (def.enable_scroll !== false),
        content: def.content
      };
    }

    _getDefaultVisibleEmbedderId() {
      if (!this._hasEmbeddersList()) return null;
      const d = this._config.embedders.find(e => e && e.default_visible === true);
      return d ? String(d.embed_id) : null;
    }

    async _openEmbedderById(embedId, { fromHash = false } = {}) {
      const active = this._getActiveEmbedderSettings(embedId);
      if (!active) {
        this._warn(`⚠️ Overlay Pro Card: embedder not defined for ${embedId}`);
        this._hideContentLayer();
        return;
      }

      // Remember active
      this._activeEmbedId = String(active.embed_id).padStart(3, '0');

      // Ensure layers exist
      this._ensureLayerRoots();

      // Apply positioning for this embedder
      this._applyContentPositioning(active);

      // Show loading + render embedded source card
      this._showContentLayer();
      const initId = String(active.embed_id || '').padStart(3, '0');
      const initIcon = `EMBED#${initId}`;

      this._contentRoot.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--primary-color);">
          <div style="font-style: italic; margin-bottom: 10px;">
            Overlay Pro Card initializing...
          </div>

          <div style="font-size: 0.9em; color: var(--secondary-text-color);">
            Searching for source card (icon): <strong>${initIcon}</strong>
          </div>

          <div style="margin-top: 10px; font-size: 0.85em; color: var(--secondary-text-color);">
            If not found, add to your source card:<br>
            <code>icon: ${initIcon}</code>
          </div>
        </div>
      `;

      const cardConfig = await this._findCardByEmbedId(active.dashboard, active.embed_id, active.show_title);
      await this._createCardContent(cardConfig);

      // Multi-embed coordination (other instances)
      this._closeOtherEmbedders();

      // If opened not by hash (default_visible), do NOT force hash
      if (!fromHash) {
        // keep hash unchanged
      }
    }
  
    // --------------------------------------------------------------------------
    // HASH CONTROL FUNCTIONS - YENİ EKLENDİ (BUTON KONTROLÜ)
    // --------------------------------------------------------------------------
    // --------------------------------------------------------------------------
    // SETTING: HASH_CONTROL
    // Controls: #embed_001 open/close logic and multi-embed coordination
    // --------------------------------------------------------------------------

    _setupHashControl() {
      // Hash değişimini dinle (LEAK FIX: bind once)
      if (!this._boundHashChanged) {
        this._boundHashChanged = () => this._checkHash();
        window.addEventListener('hashchange', this._boundHashChanged);
      }

      // FIX: setConfig/_loadCard tekrar çağrılsa bile ilk kontrolü flood etme
      if (this._hashControlInitDone) return;
      this._hashControlInitDone = true;

      // İlk yüklemede kontrol et
      setTimeout(() => this._checkHash(), 100);
    }
    
    _checkHash() {
      const hash = window.location.hash; // Örnek: #embed_001
      // FIX: Duplicate hash processing guard (prevents double logs on first click / refresh)
      // Some flows can call _checkHash twice in quick succession (hashchange + visibility guard / init timer).
      if (this._lastHandledHash === hash && (Date.now() - (this._lastHandledHashAt || 0)) < 250) {
        return;
      }
      this._lastHandledHash = hash;
      this._lastHandledHashAt = Date.now();

      // FIX: Menu'yu her hash değişiminde re-render etme (blink/flash fix)
      // Sadece root'lar yoksa oluştur.
      if (!this._menuRoot || !this._contentRoot || !this._portalRoot) {
        this._ensureLayerRoots();
      }

      // Legacy menu_only ONLY means "no legacy single embed" (but embedders[] can still work)
      const hasList = this._hasEmbeddersList();

      // Parse hash pattern
      const m = /^#embed_(\d{3})$/.exec(hash || '');
      const hashId = m ? m[1] : null;

      // If we have embedders list => open matching embedder from list
      if (hasList) {
        if (hashId && this._getEmbedderDef(hashId)) { 
          this._log(`✅ Overlay Pro Card: Hash matched (list)! Opening embedder ${hashId}`);
          this._openEmbedderById(hashId, { fromHash: true });
        } else {
          // No match => hide
          this._activeEmbedId = null;
          this._hideContentLayer();
        }
        return;
      }

      // Legacy single-embed behavior
      if (this._config.menu_only) {
        this._hideContentLayer();
        return;
      }

      const myHash = `#embed_${this._config.embed_id}`; // #embed_001
      this._log(`🔗 Overlay Pro Card: Hash check - Current: "${hash}", My hash: "${myHash}"`);

      if (hash === myHash) {
        this._log(`✅ Overlay Pro Card: Hash matched! Opening embedder ${this._config.embed_id}`);
        this._showContentLayer();
        this._closeOtherEmbedders();
      } else {
        this._hideContentLayer();
      }
    }
    
    _closeOtherEmbedders() {
      // Aynı view'deki diğer embedder'ları bul
      const view = this.closest('hui-view');
      if (!view) {
        this._log('⚠️ Overlay Pro Card: No view found for closing others');
        return;
      }
      
      const embedders = view.querySelectorAll('overlaypro-card');
      let closedCount = 0;
      
      embedders.forEach(embedder => {
        if (embedder !== this && embedder._config) {
          // Menu sabit kalsın, sadece content kapansın
          if (typeof embedder._hideContentLayer === 'function') {
            embedder._hideContentLayer();
          } else {
            embedder.style.display = 'none';
          }
          closedCount++;
        }
      });
      
      this._log(`📌 Overlay Pro Card: Closed ${closedCount} other embedder(s)`);
    }
  
    // --------------------------------------------------------------------------
    // Card Discovery Function - search algorithm
    // --------------------------------------------------------------------------
    async _findCardByEmbedId(dashboard, targetId, showTitle = true) {
      this._log(`🔍 Overlay Pro Card: Searching for card #${targetId} in '${dashboard}'`);
      
      try {
        // Fetch dashboard configuration
        const lovelaceConfig = await this._hass.connection.sendMessagePromise({
          type: 'lovelace/config',
          url_path: dashboard === 'lovelace' ? null : dashboard
        });
  
        // Search through all views
        const searchResult = this._searchCardInViews(lovelaceConfig.views, targetId);
        
        if (!searchResult.found) {
          throw new Error(`Card with embed ID #${targetId} not found in dashboard '${dashboard}'`);
        }
  
        if (searchResult.duplicate) {
          this._warn(`⚠️ Overlay Pro Card: Duplicate embed ID #${targetId} found! Using first occurrence.`);
        }
  
        this._log(`✅ Overlay Pro Card: Successfully located card #${targetId} in ${dashboard}`);
        
        // Kaynak kartın title'ını gizle (show_title: false ise)
        if (showTitle === false && searchResult.card.title) {
          delete searchResult.card.title;
        }
        
        return searchResult.card;
        
      } catch (err) {
        if (err.message.includes('Not found')) {
          throw new Error(`Dashboard '${dashboard}' not found or inaccessible`);
        }
        throw new Error(`Search error: ${err.message}`);
      }
    }
  
    // --------------------------------------------------------------------------
    // Recursive Card Search -pattern matching algorithm
    // --------------------------------------------------------------------------
    _searchCardInViews(views, targetId) {
      let foundCard = null;
      let duplicateFound = false;
      
      const searchRecursive = (cards, path = '') => {
        if (!cards) return;
        
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const cardPath = path ? `${path}/cards/${i}` : `view_${i}`;
          
          // Check icon property for EMBED#001 format
          if (card && typeof card === 'object') {
            if (card.icon && typeof card.icon === 'string') {
              const iconMatch = card.icon.match(/^EMBED#(\d{3})$/i);
              if (iconMatch && iconMatch[1] === targetId) {
                if (foundCard) {
                  duplicateFound = true;
                } else {
                  foundCard = card;
                  this._log(`   Found at path: ${cardPath} (via icon: ${card.icon})`);
                }
              }
            }
            
            // Recursive search for nested cards
            if (card.cards && Array.isArray(card.cards)) {
              searchRecursive(card.cards, `${cardPath}/cards`);
            }
            
            // Support for vertical/horizontal stacks
            if (card.type && card.type.includes('stack') && card.cards) {
              searchRecursive(card.cards, `${cardPath}/stack`);
            }
          }
        }
      };
      
      // Process all views
      views.forEach((view, viewIndex) => {
        if (view.cards) {
          searchRecursive(view.cards, `view_${viewIndex}`);
        }
      });
      
      return {
        found: !!foundCard,
        card: foundCard,
        duplicate: duplicateFound
      };
    }
  
    // --------------------------------------------------------------------------
    // Card Content Creation - optimized rendering
    // --------------------------------------------------------------------------
    async _createCardContent(cardConfig) {
      const helpers = await window.loadCardHelpers();
      
      // Create card element
      const cardConfigCopy = JSON.parse(JSON.stringify(cardConfig));
      this._contentElement = await helpers.createCardElement(cardConfigCopy);
      this._contentElement.hass = this._hass;
      
      // Ensure roots exist (menu must remain)
      this._ensureLayerRoots();

      // Clean content layer only (menu stays)
      this._contentRoot.innerHTML = '';

      const container = document.createElement('div');
      container.className = 'overlaypro-card-container';
      container.style.padding = '0';
      container.style.margin = '0';
      container.style.height = '100%';
      
      // Card wrapper - HA ORJINAL HEADER YAPISI
      const cardWrapper = document.createElement('ha-card');
      cardWrapper.style.display = 'flex';
      cardWrapper.style.flexDirection = 'column';
      cardWrapper.style.height = '100%';
      cardWrapper.style.width = '100%';
      cardWrapper.style.padding = '0';
      cardWrapper.style.margin = '0';
      cardWrapper.style.borderRadius = '0';
      cardWrapper.style.background = 'none';
      cardWrapper.style.boxShadow = 'none';
      
      const active = this._getActiveEmbedderSettings();
      // HA Header - Sadece embedder_title veya show_close varsa
      if ((active && active.embedder_title) || (active && active.show_close)) {
        const header = document.createElement('div');
        header.className = 'card-header';
        header.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          min-height: 48px;
        `;
        
        // Sol taraf: embedder_title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'name';
        titleDiv.textContent = (active && active.embedder_title) ? active.embedder_title : '';
        titleDiv.style.cssText = `
          font-size: 16px;
          font-weight: 500;
          color: var(--primary-text-color);
          flex: 1;
        `;
        header.appendChild(titleDiv);
        
        // Sağ taraf: X butonu (show_close: true ise)
        if (active && active.show_close) {
          const closeButton = document.createElement('button');
          closeButton.innerHTML = '×';
          closeButton.className = 'close-button';
          closeButton.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--secondary-text-color);
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.3s;
            margin: 0;
          `;
          
          // Hover efekti
          closeButton.addEventListener('mouseenter', () => {
            closeButton.style.backgroundColor = 'var(--divider-color, #e0e0e0)';
          });
          
          closeButton.addEventListener('mouseleave', () => {
            closeButton.style.backgroundColor = 'transparent';
          });
          
          // Kapatma fonksiyonu
          closeButton.addEventListener('click', () => {
            this._hideContentLayer();
            this._clearHash();
            this._log(`❌ Overlay Pro Card: Closed via X button - embed_id: ${(active && active.embed_id) ? active.embed_id : '???'}`);
          });
          
          header.appendChild(closeButton);
        }
        
        cardWrapper.appendChild(header);
      }
         // ------------------------------------------------------------------------
      // SETTING: SCROLL_BEHAVIOR
      // Controls: enable_scroll and overflow handling inside embedded content
      // ------------------------------------------------------------------------
   
      // Content area - minimum yükseklik
      const cardContent = document.createElement('div');
      cardContent.className = 'card-content';
      cardContent.style.cssText = `
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 0;
        overflow: ${(active && active.enable_scroll === false) ? 'visible' : 'auto'};
      `;
      // ------------------------------------------------------------------------
      // SETTING: EMBED_FULL_HEIGHT_FIX
      // Removes bottom empty space inside embedded card container
      // ------------------------------------------------------------------------

      // FIX: Embedded card full-height (removes bottom empty space) WITHOUT breaking scroll
      // Scroll stays on cardContent (overflow:auto). We only make embedded card a proper flex child.
      if (this._contentElement) {
        this._contentElement.style.display = 'flex';
        this._contentElement.style.flexDirection = 'column';
        this._contentElement.style.flex = '1';
        this._contentElement.style.height = '100%';
        this._contentElement.style.minHeight = '0';
        this._contentElement.style.margin = '0';
        this._contentElement.style.padding = '0';
      }
      
      // Assemble the card
      cardContent.appendChild(this._contentElement);
      cardWrapper.appendChild(cardContent);
      container.appendChild(cardWrapper);
      this._contentRoot.appendChild(container);
      
      // Finalization
      this._loaded = true;
      // ------------------------------------------------------------------------
      // SETTING: DEBUG_LOGGING
      // Controls: console.log verbosity for development
      // ------------------------------------------------------------------------
      
      const dbg = this._getActiveEmbedderSettings();
      const dbgId = (dbg && dbg.embed_id) ? dbg.embed_id : (this._config ? this._config.embed_id : '???');
      const dbgDash = (dbg && dbg.dashboard) ? dbg.dashboard : (this._config ? this._config.dashboard : '???');

      this._log(`🎉 Overlay Pro Card successfully embedded card #${dbgId}`);
      this._log(`   Dashboard: ${dbgDash}`);
      this._log(`   Embedder Title: "${(dbg && dbg.embedder_title) ? dbg.embedder_title : ''}"`);
      this._log(`   Show Close: ${!!(dbg && dbg.show_close)}`);
      this._log(`   Show Title: ${(dbg ? (dbg.show_title !== false) : (this._config && this._config.show_title !== false))}`);
      this._log(`   Default Visible (CONTENT): ${!!(dbg && dbg.default_visible)}`);
      this._log(`   Menu Enabled: ${!!(this._config && this._config.menu && this._config.menu.enabled)}`);
      this._log(`   Hash Control: ACTIVE (use #embed_${dbgId})`);
    }
  
    // --------------------------------------------------------------------------
    // Card Size Helper - optimized sizing
    // --------------------------------------------------------------------------
    getCardSize() {
      return this._config.card_size || 1;
    }
    
    // --------------------------------------------------------------------------
    // Public methods for external control
    // --------------------------------------------------------------------------
    show() {
      this._ensureLayerRoots();
      this._showContentLayer();
    }
    
    hide() {
      this._ensureLayerRoots();
      this._hideContentLayer();
      if (typeof this._clearHash === 'function') {
        this._clearHash();
      }
    }

    // --------------------------------------------------------------------------
    // Lifecycle: Cleanup (FIXED - was broken by copy/paste)
    // --------------------------------------------------------------------------
    disconnectedCallback() {
      // SETTING: VIEW_VISIBILITY_GUARD
      this._teardownViewVisibilityGuard();

      // FIX: Hash control listener cleanup
      try {
        if (this._boundHashChanged) {
          window.removeEventListener('hashchange', this._boundHashChanged);
          this._boundHashChanged = null;
        }
        this._hashControlInitDone = false;
      } catch (e) {}

      // Portal cleanup (menu/content kaldır)
      try {
        if (this._menuRoot && this._menuRoot.parentNode) {
          this._menuRoot.parentNode.removeChild(this._menuRoot);
        }
        if (this._contentRoot && this._contentRoot.parentNode) {
          this._contentRoot.parentNode.removeChild(this._contentRoot);
        }
        if (this._portalRoot && this._portalRoot.parentNode) {
          this._portalRoot.parentNode.removeChild(this._portalRoot);
        }
      } catch (e) {}

      this._portalRoot = null;
      this._menuRoot = null;
      this._contentRoot = null;
      // FIX: reset hash dedupe state
      this._lastHandledHash = null;
      this._lastHandledHashAt = 0;

    }
    
    toggle() {
      this._ensureLayerRoots();
      const isHidden = !this._contentRoot || this._contentRoot.style.display === 'none';
      if (isHidden) {
        this._showContentLayer();
      } else {
        this._hideContentLayer();
        if (typeof this._clearHash === 'function') {
          this._clearHash();
        }
      }
    }
  }

// ============================================================================
// Overlay Pro Card - Startup Banner (ALWAYS VISIBLE)
// ============================================================================

const overlayTitle = '  OVERLAY[PRO]-CARD ';
const overlayVersion = '  Version Faz.1    ';

// Longest line width
const overlayWidth = Math.max(overlayTitle.length, overlayVersion.length);

console.info(
  `%c${overlayTitle.padEnd(overlayWidth)}\n%c${overlayVersion.padEnd(overlayWidth)}`,
  'color: lime; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);
 
  // ============================================================================
  // Custom Element Registration - SIMPLE & COMPATIBLE
  // ============================================================================
  if (!customElements.get('overlaypro-card')) {
    customElements.define('overlaypro-card', overlayprocard);
    
    // Lovelace editor integration
    window.customCards = window.customCards || [];
    window.customCards.push({
      type: 'overlaypro-card',
      name: 'Overlay Pro Card',
      preview: true,
      description: 'Engine Powering Overlay Popup UI Layers',
    });
  }
  
  // ============================================================================
  // Helper Functions (Optional - for future enhancements)
  // ============================================================================
  window.embedderHelpers = window.embedderHelpers || {
    // Find unused embed IDs
    findUnusedId: async function(hass, dashboard = 'lovelace') {
      if (window.__OVERLAY_PRO_LOG) console.log('Overlay Pro Card: Analyzing available embed IDs...');
      
      try {
        const config = await hass.connection.sendMessagePromise({
          type: 'lovelace/config',
          url_path: dashboard === 'lovelace' ? null : dashboard
        });
        
        const usedIds = new Set();
        const iconPattern = /^EMBED#(\d{3})$/i;
        
        const collectIds = (cards) => {
          if (!cards) return;
          
          cards.forEach(card => {
            if (card && typeof card === 'object') {
              if (card.icon) {
                const match = iconPattern.exec(card.icon);
                if (match && match[1]) usedIds.add(match[1]);
              }
              
              if (card.cards) {
                collectIds(card.cards);
              }
            }
          });
        };
        
        config.views.forEach(view => collectIds(view.cards));
        
        // Find first unused ID
        for (let i = 1; i <= 999; i++) {
          const id = i.toString().padStart(3, '0');
          if (!usedIds.has(id)) {
            if (window.__OVERLAY_PRO_LOG) console.log(`✅ Available embed ID: ${id}`);
            return id;
          }
        }
        
        if (window.__OVERLAY_PRO_LOG) console.warn('⚠️ All embed IDs (001-999) are in use!');
        return null;
        
      } catch (error) {
        console.error('ID search failed:', error);
        return '001';
      }
    },
    
    // Validate embed ID format
    validateEmbedId: function(id) {
      const regex = /^\d{3}$/;
      if (!regex.test(id)) {
        throw new Error('embed_id must be 3 digits (001-999)');
      }
      
      const num = parseInt(id, 10);
      if (num < 1 || num > 999) {
        throw new Error('embed_id must be between 001 and 999');
      }
      
      return true;
    }
  };
