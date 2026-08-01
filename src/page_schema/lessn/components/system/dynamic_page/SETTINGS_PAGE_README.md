# Generic Settings Page System

Production-ready, config-driven settings architecture for DynamicPage — Shopify Admin-style multi-section settings with section-level persistence, server hooks, and FormManagement field ownership.

## Architecture Overview

```
Route (Page HJSON)
  ↓
DynamicPage (pageMode: "settings")
  ↓
SettingsPageContent (orchestration)
  ↓
SettingsSectionRenderer (registry-driven)
  ↓
SettingsSectionCard | Accordion | Tabs
  ↓
FormManagement (fields, validation, field state)
  ↓
settingsAdapter → loadSettingsPage / saveSettingsSection
  ↓
Settings Engine (server) → SettingsSectionDocument (Neo4j)
```

### Ownership Rules (Critical)

| Layer | Owns | Does NOT Own |
|-------|------|--------------|
| **Settings System** | Orchestration, sidebar, save bar, dirty tracking, adapters | Field rendering, validation rules |
| **FormManagement** | Fields, validation, field state | Page layout, persistence |
| **Settings Engine (server)** | Validation, transforms, persistence, audit | UI rendering |

**RULE: Never render fields directly inside Settings components. Always delegate to FormManagement.**

---

## Quick Start

### 1. Page HJSON

```hjson
{
  vertexes: [
    {
      id: "page_root",
      L: "Page",
      P: {
        key: "MySettingsPage",
        url: "/settings",
        title: "Settings",
        fns: '''
return {
  enabled: () => true,
  executeYTOFunction: (functionName, contextData) =>
    _.executeNamedServerFunction({ functionName, contextData: contextData || {} })
};
'''
      }
    },
    {
      id: "dynamic_page",
      L: "Attr",
      P: {
        displayOrder: 1,
        componentName: "DynamicPage",
        props: '''
const settingsPageId = _.searchParams?.page;
return {
  pageMode: "settings",
  settingsPageId,
  loadFromSetting: true,
  scope: { vertexLabel: "User", matchProperty: "uuid", idParam: "scopeId" }
};
'''
      }
    }
  ],
  edges: [{ id: "e1", T: "Attr", S: "page_root", E: "dynamic_page" }]
}
```

### 2. Run Migration

```javascript
await executeNamedServerFunction({
  functionName: "migrateDynamicPageSettings",
  contextData: { dryRun: false }
});
```

### 3. Open Page

Navigate to `/settings?page=general` — sidebar, sections, save bar render from config.

---

## Config Schema Reference

### SettingsPageConfig

Stored in Neo4j `Setting` vertex:
- **Key:** `{settingsPageId}_settings_page_default`
- **Type:** `settings_page_config`
- **Config:** Function body returning page config object

```javascript
return {
  pageMode: "settings",           // Required — tells DynamicPage to use settings renderer
  id: "general",                  // Page identifier (matches settingsPageId)
  route: "/settings?page=general",
  title: "General",
  description: "Manage store details and preferences.",
  version: 3,                     // Config version for migrations

  // Scope — who owns these settings
  scope: {
    vertexLabel: "User",          // or "ShopifyShop", "Store", etc.
    matchProperty: "uuid",        // Property to match scopeId
    idParam: "scopeId"            // URL param name for scope override
  },

  saveStrategy: {
    mode: "section",              // "section" | "page" | "auto"
    debounceMs: 1200,
    autosave: false,
    showSaveBar: true,
    warnOnLeave: true
  },

  audit: {
    enabled: true,
    resource: "settings.general",
    includeDiff: true
  },

  sidebar: { /* SettingsSidebarConfig */ },
  sections: [ /* SettingsSectionConfig[] */ ],
  hooks: { /* SettingsHookContext */ },
  loaders: { /* SettingsLoader map */ },
  permissions: { anyOf: ["settings.general.read"] },
  featureFlags: ["settings_enabled"],
  migrations: [ /* version migrations */ ],
  extensions: {
    allowExternalSections: true,
    sectionInjectionPoints: ["beforeDangerZone"]
  }
};
```

### SettingsSectionConfig

```javascript
{
  id: "storeDetails",              // Required — used for section-level save/load
  type: "card",                    // "card" | "accordion" | "tabs" | "group"
  title: "Store details",
  description: "Basic store identity.",
  collapsible: false,
  variant: "default",              // "default" | "danger"

  permissions: { anyOf: ["settings.general.write"] },
  featureFlags: ["advanced_settings"],

  saveStrategy: { mode: "section" },

  hooks: {
    beforeSave: "return { values: ctx.values };"  // Server-side hook name or inline
  },

  // FormManagement owns all fields — NEVER define fields outside form
  form: {
    gridColumns: 2,
    groups: [{
      key: "storeDetailsForm",
      title: "",
      gridColumns: 2,
      fields: [
        {
          key: "storeName",
          label: "Store name",
          dataType: "text",
          renderer: "text",
          required: true,
          colSpan: 2,
          defaultValue: "My Store",
          validation: { minLength: 3, maxLength: 100 },
          transform: "trim"
        },
        {
          key: "supportEmail",
          label: "Support email",
          dataType: "email",
          renderer: "text",
          required: true,
          validation: { email: true }
        }
      ]
    }]
  },

  // Nested sections (recursive)
  sections: [ /* child SettingsSectionConfig[] */ ]
}
```

### SettingsFieldConfig

Fields use **FormManagement schema** — not custom settings field types:

```javascript
{
  key: "country",                    // Storage key in section values JSON
  label: "Country",
  dataType: "text",                  // Semantics: text, email, number, boolean, relation
  renderer: "text",                  // UI: text, textArea, checkbox, multiSelect, etc.
  required: true,
  defaultValue: "US",
  colSpan: 1,
  tooltip: "Two-letter country code",

  validation: {
    minLength: 2,
    maxLength: 2,
    email: false,
    pattern: "^[A-Z]{2}$",
    patternMessage: "Use ISO 3166-1 alpha-2 code"
  },

  // Conditional visibility (FormManagement rules)
  visible: "ctx.values.enableAdvanced === true",
  disabled: "ctx.mode === 'view'",
  required: "ctx.values.country === 'US'",

  // Async options via settings loaders (resolved at render time)
  optionsLoader: "countries",

  selectConfig: {
    relationshipType: "UserRole",
    edgeOnly: true
  }
}
```

### SettingsSidebarConfig

```javascript
sidebar: {
  title: "Settings",
  groups: [
    {
      id: "store",
      label: "Store",
      permissions: { anyOf: ["settings.read"] },
      items: [
        {
          id: "general",
          label: "General",
          path: "/settings?page=general",
          icon: "settings",
          permissions: { anyOf: ["settings.general.read"] },
          featureFlags: ["settings_enabled"]
        },
        {
          id: "billing",
          label: "Billing",
          path: "/settings?page=billing",
          icon: "billing"
        }
      ]
    }
  ]
}
```

---

## Server Functions

| Function | Purpose |
|----------|---------|
| `getSettingsPageConfig` | Load page config from Setting vertex |
| `loadSettingsPage` | Load all section values for a page |
| `loadSettingsSection` | Load single section (lazy/tabs) |
| `saveSettingsSection` | Save section with version check + audit |
| `resetSettingsSection` | Reset section to config defaults |
| `validateSettingsSection` | Server-side config-driven validation |
| `settingsEngineHelpers` | Shared validation, transforms, defaults, audit diff |

### Generic Save Payload

```javascript
{
  pageId: "general",
  sectionId: "regionalDefaults",
  values: { timezone: "UTC", currency: "USD" },
  version: 12,
  scopeVertexLabel: "User",
  scopeId: "user-uuid-here",
  sectionConfig: { /* section config for validation */ },
  pageConfig: { /* page config for audit resource */ }
}
```

### Graph Storage

```
(User)-[:UserHasSettingsSection]->(SettingsSectionDocument)
(ShopifyShop)-[:ShopifyShopHasSettingsSection]->(SettingsSectionDocument)
```

**SettingsSectionDocument properties:**
```javascript
{
  pageId: "general",
  sectionId: "regionalDefaults",
  scopeVertexLabel: "User",
  scopeId: "user-uuid",
  values: "{ \"timezone\": \"UTC\", \"currency\": \"USD\" }",  // JSON string
  version: 12,
  type: "settings_section",
  createdAt: "...",
  updatedAt: "...",
  updatedBy: "user-uuid"
}
```

Edge naming: `{FromLabel}HasSettingsSection` (e.g. `ShopifyShopHasSettingsSection`).

---

## Save Lifecycle

```
User clicks Save (SaveBar or section)
  ↓
FormManagement.validate()
  ↓
settingsAdapter.saveSection({ sectionId, values, version })
  ↓
saveSettingsSection (server)
  ↓
settingsEngineHelpers.transformValues
  ↓
settingsEngineHelpers.validateSection
  ↓
Version concurrency check (409 on conflict)
  ↓
Persist SettingsSectionDocument
  ↓
Audit diff (if enabled)
  ↓
Return { values, version, audit }
  ↓
markSectionClean(sectionId)
  ↓
Hide SaveBar
```

---

## Settings Adapter Layer

**Never call APIs directly from UI components.**

```javascript
// WRONG
fetch("/api/settings?page=general&section=regionalDefaults", { method: "POST", body: JSON.stringify(values) });

// CORRECT — via DynamicPage fns
await _.fns.settingsAdapter.saveSection({
  sectionId: "regionalDefaults",
  sectionConfig,
  values,
  version: sectionState.version
});
```

Available on DynamicPage `_.fns`:
- `settingsAdapter.loadPage()`
- `settingsAdapter.saveSection(payload)`
- `settingsAdapter.resetSection(payload)`
- `saveSettingsSection(payload)` — shorthand
- `loadSettingsPageData()`
- `handleSaveAllDirtySections()`
- `handleDiscardChanges()`
- `dirtyTracker.hasDirty()`
- `getSectionState(sectionId)`

---

## Dirty Tracking

Each section registers via `FormManagement.onFnsReady`. A reactive effect compares current form vertex `P` values against `initialValues`:

```javascript
// Automatic in SettingsSectionCard
_.createEffect(() => {
  const currentJson = JSON.stringify(formVertex.P);
  const initialJson = JSON.stringify(sectionState.initialValues);
  if (currentJson !== initialJson) _.fns.markSectionDirty(sectionId);
});
```

SaveBar visibility: `dirtyTracker.hasDirty() === true`

---

## Section Renderers (Registry-Driven)

| type | Component | Use Case |
|------|-----------|----------|
| `card` | SettingsSectionCard | Standard settings block |
| `accordion` | SettingsSectionAccordion | Collapsible nested sections |
| `tabs` | SettingsSectionTabs | Tabbed nested sections |
| `group` | SettingsSectionCard | Alias for card |

Recursive: `section.sections?.map(...)` in Accordion/Tabs renderers.

---

## Plugin / Extension Architecture

```javascript
extensions: {
  allowExternalSections: true,
  sectionInjectionPoints: [
    "beforeDangerZone",
    "afterRegionalDefaults"
  ]
}
```

Plugins register sections at injection points without modifying core config:

```javascript
// Plugin adds section dynamically (future: settingsRegistry.injectSection)
settingsRegistry.injectSection("beforeDangerZone", {
  id: "pluginAnalytics",
  type: "card",
  title: "Analytics Integration",
  form: { groups: [{ fields: [...] }] }
});
```

---

## Settings Consumption (Runtime Layer)

Settings saved generically must be consumed through a runtime layer — not scattered DB queries.

```
Graph DB
  ↓
Persistence Adapter (loadSettingsSection)
  ↓
Settings Runtime Cache (future: settingsRuntime.getSection)
  ↓
Domain Settings API (future: storeSettings.getTimezone)
  ↓
Application / Workers / UI
```

**Recommended access patterns:**

```javascript
// Generic layer
const timezone = await settingsRuntime.getField({
  scopeId, page: "general", section: "regionalDefaults", field: "timezone"
});

// Domain layer (preferred for business logic)
const timezone = await storeSettings.getTimezone(scopeId);
```

---

## Production Patterns

### Loading States
- `settingsLoading` on DynamicPageUiState
- SettingsPageContent shows LoadingSpinner while loading

### Optimistic Updates
- Save returns new version; client updates `settingsSectionStateMap`
- On conflict (version mismatch): show error, reload section

### Partial Failures
- Section-level save — one section failure doesn't block others
- SaveBar saves all dirty sections sequentially

### Concurrency Conflicts
```javascript
if (dbVersion !== payloadVersion) {
  return { success: false, errorCode: "CONFLICT", data: { currentVersion } };
}
```

### Stale Data Prevention
- Version field on every SettingsSectionDocument
- Reload after conflict or external `settings.saved` event

---

## Testing Strategy

1. **Migration:** Run `migrateDynamicPageSettings` with `dryRun: true`, verify counts
2. **Load:** Call `loadSettingsPage` — verify defaults merged
3. **Save:** Save section, verify version increment
4. **Conflict:** Save with stale version, expect CONFLICT
5. **Reset:** Call `resetSettingsSection`, verify defaults restored
6. **UI:** Playwright — navigate sections, edit field, verify SaveBar, save, reload

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why | Instead |
|--------------|-----|---------|
| Custom API per settings page | Doesn't scale | Generic `saveSettingsSection` |
| Fields in Settings components | Breaks ownership | FormManagement only |
| `saveEntirePage()` | Large payloads, poor UX | Section-level save |
| Direct DB queries for settings | No cache, inconsistent | Settings runtime layer |
| Switch statements for renderers | Not extensible | Registry-driven renderers |
| `fetch()` from UI | Tight coupling | `settingsAdapter` |
| Trusting frontend validation | Security gap | Server validates from same config |

---

## Tradeoffs

| Decision | Benefit | Cost |
|----------|---------|------|
| Section-level documents | Independent save, smaller payloads | More vertices than single JSON blob |
| Config in Setting vertices | Same pattern as table_config | Config as string requires eval |
| FormManagement for fields | Reuse validation/renderers | Must map config to form schema |
| Version concurrency | Safe multi-admin editing | Clients must handle conflicts |
| User scope by default | Simple setup | Store-scoped needs scope config |

---

## File Reference

### Components
- `components/dynamic_page/DynamicPage.hjson` — Extended with `pageMode: "settings"`
- `components/dynamic_page/settings/layout/SettingsSidebar.hjson`
- `components/dynamic_page/settings/layout/SettingsPageContent.hjson`
- `components/dynamic_page/settings/layout/SettingsSaveBar.hjson`
- `components/dynamic_page/settings/sections/SettingsSectionRenderer.hjson`
- `components/dynamic_page/settings/sections/SettingsSectionCard.hjson`
- `components/dynamic_page/settings/sections/SettingsSectionAccordion.hjson`
- `components/dynamic_page/settings/sections/SettingsSectionTabs.hjson`

### Server Functions
- `functions/dynamic_page/main_functions/settings/config/getSettingsPageConfig.hjson`
- `functions/dynamic_page/main_functions/settings/sections/loadSettingsPage.hjson`
- `functions/dynamic_page/main_functions/settings/sections/loadSettingsSection.hjson`
- `functions/dynamic_page/main_functions/settings/sections/saveSettingsSection.hjson`
- `functions/dynamic_page/main_functions/settings/sections/resetSettingsSection.hjson`
- `functions/dynamic_page/main_functions/settings/sections/validateSettingsSection.hjson`
- `functions/dynamic_page/main_functions/settings/helpers/settingsEngineHelpers.hjson`

### Migration & Example
- `functions/dynamic_page/main_functions/migration/migrateDynamicPageSettings.hjson`
- `pages/shopify/admin/ShopifySettingsGeneral.hjson`

---

## Adding a New Settings Page

1. Add config to `migrateDynamicPageSettings.hjson` → `settingsPageConfigs` array
2. Use a Page HJSON with `pageMode: "settings"` and `settingsPageId` from `_.searchParams?.page`
3. Add sidebar navigation item pointing to `/settings?page=<settingsPageId>`
4. Run migration
5. (Optional) Add domain accessor for runtime consumption

No new APIs, routes, or DB schema required.
