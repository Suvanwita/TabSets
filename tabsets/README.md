# TabSets — Named Browser Sessions

**TabSets** is a lightweight, modern Manifest V3 Chrome browser extension built to organize, save, and restore browser tab sessions into named workspaces.

---

## 📁 Project Folder Structure

```
tabsets/
├── manifest.json
├── popup/
│   ├── index.html
│   ├── style.css
│   └── popup.js
├── background/
│   └── service-worker.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## ⚙️ How Each File Works

### 1. `manifest.json`
- Configures the extension using Chrome Manifest V3 specifications.
- Declares extension metadata (name, description, version, icons).
- Sets `popup/index.html` as the default popup action window.
- Registers `background/service-worker.js` as the persistent event listener background script.
- Requests minimal permissions: `tabs` (to capture open browser tab URLs & titles) and `storage` (to save workspaces locally).

### 2. `popup/index.html`
- Defines the HTML5 structure for the 380px wide extension popup window.
- Header with extension branding title and subtitle.
- Prominent `+ Save Current Tabs` main CTA button.
- Real-time search input with clear button.
- Dynamically rendered list container for saved workspace cards.
- Integrated polished empty state for when no tab sets exist or search returns 0 results.
- Accessible modal dialog for creating a new named workspace.
- Contextual three-dot dropdown action menu template.

### 3. `popup/style.css`
- Custom CSS design system adhering to modern developer-tool aesthetics.
- Palette built around curated HSL/hex dark slate theme tokens using CSS variables (`:root`).
- Typography system with clean font hierarchy, badge indicators, subtle glassmorphism overlay effects, and custom scrollbars.
- Micro-interactions for buttons, hover states, input focus rings, and animated modal pop-in transitions.
- Fully responsive layout constrained to extension popup dimensions.

### 4. `popup/popup.js`
- Core UI interactivity and state management written in pure vanilla JavaScript (ES6+).
- **Storage Manager**: Abstraction over `chrome.storage.local` with automatic fallback to `localStorage` when testing directly in a normal browser tab.
- **Tab Manager**: Interface for `chrome.tabs.query` to capture active window tabs, fallback to mock data during local development.
- **Modal Controller**: Handles opening, closing, keyboard `Escape` closing, backdrop click closing, and input autofocus/validation.
- **Search & Filter Engine**: Filters tab sets dynamically as you type in the search bar.
- **Card Context Menu**: Manages three-dot popup menus for opening, renaming, and deleting workspaces.

### 5. `background/service-worker.js`
- Manifest V3 background service worker script.
- Listens for extension installation (`chrome.runtime.onInstalled`) and seeds initial mock workspace data into `chrome.storage.local` if no previous data exists.
- Ready to handle background tab restoration and cross-window sync messages in future phases.

### 6. `icons/` (`icon16.png`, `icon48.png`, `icon128.png`)
- Custom-designed icon assets for Chrome extension toolbar, context menus, and extension manager grid.

---

## 🚀 How to Load the Extension into Chrome

Follow these simple steps to load TabSets as an unpacked extension:

1. Open **Google Chrome**, **Brave**, or any Chromium-based browser.
2. Navigate to `chrome://extensions` in the address bar (or go to **Menu ➔ Extensions ➔ Manage Extensions**).
3. In the top-right corner of the Extensions page, enable **Developer mode** toggle.
4. Click the **"Load unpacked"** button in the top-left toolbar.
5. In the file picker dialog, select the `tabsets` directory:
   ```
   /home/user/TabSets/tabsets
   ```
6. Click **Select Folder**. The **TabSets — Named Browser Sessions** extension is now installed!
7. Pin the extension icon to your Chrome toolbar for easy access.

---

## 🧪 How to Test the Popup

### Testing in Chrome Popup Mode:
1. Click the **TabSets** icon in your browser toolbar to open the popup.
2. **View Default Workspaces**: Verify the list displays example workspaces (*Cybersecurity Project*, *DSA Preparation*, *Research Paper*, *Placement Preparation*).
3. **Search Filtering**: Type `DSA` or `Research` in the search bar to see instant card filtering. Click the `X` icon to clear search.
4. **Saving a Workspace**:
   - Click `+ Save Current Tabs`.
   - The modal overlay will appear with the input focused.
   - Enter a workspace name (e.g. `Sprint 3 Standup`) and click **Save** (or press `Enter`).
   - Notice the new workspace immediately added to the top of the list!
5. **Three-Dot Card Options**:
   - Click the `...` menu button on any workspace card.
   - Test **Rename** to change a workspace name.
   - Test **Delete Workspace** to remove a card from `chrome.storage.local`.
6. **Empty State**:
   - Delete all workspaces or search for a non-existent word like `xyz123` to inspect the polished empty state layout.
7. **Modal Dismissal**:
   - Open the save modal and click outside on the dark backdrop or press `Escape` key to verify smooth closure.
