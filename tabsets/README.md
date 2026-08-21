# TabSets — Named Browser Sessions

**TabSets** is a lightweight, modern Manifest V3 Chrome browser extension built to capture, organize, save, update, restore, and manage browser tab sessions into named workspaces.

---

## 🏗️ Architecture & Modules

TabSets follows a clean, decoupled Chrome Extension (Manifest V3) architecture built with **HTML5**, **Vanilla CSS**, and **pure ES6+ JavaScript**:

```
tabsets/
├── manifest.json            # Extension manifest (MV3 specifications)
├── popup/
│   ├── index.html           # Popup UI layout, Save/Rename/Update/Delete modals & Toast banner
│   ├── style.css            # Dark slate theme system, CSS variables, modal & toast styles
│   └── popup.js             # UI controller, StorageManager, TabManager, RestoreManager & ModalController
├── background/
│   └── service-worker.js    # Persistent MV3 service worker & storage initializer
├── icons/
│   ├── icon16.png           # 16x16 Toolbar icon
│   ├── icon48.png           # 48x48 Extension manager icon
│   └── icon128.png          # 128x128 Web Store / App icon
└── README.md                # Complete documentation
```

### Core Modules Breakdown (`popup/popup.js`):
1. **`StorageManager`**: Handles `getTabSets()`, `saveTabSet()`, `deleteTabSet()`, `updateTabSet()` asynchronously using `chrome.storage.local` under the `tabsets` key.
2. **`TabManager`**: Interacts with `chrome.tabs.query`, captures tab attributes (`url`, `title`, `favicon`, `index`, `pinned`), and filters un-restorable internal pages (`chrome://`, `about:`, `edge://`).
3. **`RestoreManager`**: Restores saved workspaces by always creating a **NEW browser window** (`chrome.windows.create`), preserving original tab order, restoring pinned state (`pinned: true`), and skipping invalid URLs gracefully.
4. **`ModalController`**: Manages modal open/close transitions, input focus, validation, and confirmation handling for Save, Rename, Update, and Delete actions.
5. **`ToastController`**: Displays animated visual feedback toasts for all major user actions.

---

## ⚙️ Complete Workspace Management Features

### 1. 🚀 Restore Workspace
- **Action**: Click any workspace card or select **Restore** from its three-dot context menu.
- **Behavior**: Always creates a **NEW browser window** (`chrome.windows.create`) without overwriting the active window.
- **Tab Preservation**: Preserves tab order (`index`), restores every valid URL, and preserves pinned tab status (`pinned: true`).
- **Resilience**: Un-restorable URLs are skipped gracefully while continuing to restore remaining tabs.

### 2. ✏️ Rename Workspace
- **Action**: Select **Rename** from the workspace card's three-dot menu.
- **Behavior**: Opens the "Rename Tab Set" modal pre-filled with the current workspace name.
- **Validation**: Enforces non-empty names (trimmed) and prevents duplicate names (case-insensitive).
- **Persistence**: Updates the stored `name` and `updatedAt` timestamp, refreshes the popup, and displays a success toast.

### 3. 🗑️ Delete Workspace
- **Action**: Select **Delete** from the workspace card's three-dot menu.
- **Behavior**: Displays a styled confirmation modal displaying the workspace name and warning text.
- **Persistence**: Removes the workspace from `chrome.storage.local` upon user confirmation and shows feedback.

### 4. 🔄 Update Existing Workspace
- **Action**: Select **Update** from the workspace card's three-dot menu.
- **Behavior**: Opens a confirmation modal. Upon confirmation, captures all open tabs from the currently active browser window.
- **Tab Replacement**: Replaces saved tabs while preserving `url`, `title`, `favicon`, `index`, and `pinned` state.
- **Timestamp**: Updates `updatedAt` timestamp while maintaining the original workspace ID and name.

### 5. 📋 Context Menu & UX Polish
- **Context Menu**: Every card features a three-dot menu with four options: `Restore`, `Update`, `Rename`, `Delete`.
- **Dismissal**: Closes automatically when clicking outside, selecting another menu, or pressing Escape.
- **Accidental Action Prevention**: Modals require explicit user confirmation before destructive or overwriting operations.
- **Non-Intrusive Toasts**: Displays visual success and error toast banners for feedback.

---

## 💾 Storage Model

Data is stored locally in `chrome.storage.local` under the `tabsets` storage key:

```json
{
  "tabsets": [
    {
      "id": "ts-1725894234567-a1b2c",
      "name": "Cybersecurity Project",
      "createdAt": 1725894234567,
      "updatedAt": 1725894234567,
      "tabs": [
        {
          "url": "https://owasp.org/www-project-top-ten/",
          "title": "OWASP Top 10 Web Application Security Risks",
          "favicon": "https://owasp.org/assets/images/favicon.ico",
          "index": 0,
          "pinned": true
        },
        {
          "url": "https://portswigger.net/burp/documentation",
          "title": "Burp Suite Documentation",
          "favicon": "https://portswigger.net/favicon.ico",
          "index": 1,
          "pinned": false
        }
      ]
    }
  ]
}
```

---

## 🔐 Permissions Explanation

| Permission | Purpose |
| :--- | :--- |
| `tabs` | Required to query open browser tabs in the active window, capture tab titles, URLs, favicons, pinned states, and restore workspaces in new windows. |
| `storage` | Required to persist saved workspace data locally using `chrome.storage.local`. |

---

## 🚀 Installation Instructions

1. Open **Google Chrome** or any Chromium-based browser (Brave, Edge).
2. Navigate to `chrome://extensions` in the address bar.
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked** in the top-left toolbar.
5. Select the `tabsets` directory:
   ```
   /home/user/TabSets/tabsets
   ```
6. Click **Select Folder**. The extension is now loaded!

---

## 🧪 Comprehensive Test Suite (10 Test Cases)

### Test Case 1: Save Workspace
1. Click **+ Save Current Tabs**.
2. Enter a workspace name (e.g. `Sprint Planning`).
3. Click **Save**. Verify the modal closes, popup refreshes, and the card appears at the top.

### Test Case 2: Restore Workspace
1. Click on a saved workspace card or select **Restore** from its `...` menu.
2. Verify a **NEW browser window** opens containing all saved tabs.
3. Verify the original browser window remains untouched.

### Test Case 3: Rename Workspace
1. Click `...` ➔ **Rename** on any workspace card.
2. Enter a new workspace name in the modal.
3. Click **Rename**. Verify the card title and updated relative timestamp update immediately.

### Test Case 4: Delete Workspace
1. Click `...` ➔ **Delete** on a workspace card.
2. Confirm deletion in the warning modal.
3. Verify the workspace is removed from the popup and storage.

### Test Case 5: Update Workspace
1. Open new tabs in your current browser window.
2. Click `...` ➔ **Update** on an existing workspace card.
3. Confirm update in the modal. Verify the tab count badge updates to match your current window.

### Test Case 6: Refresh Popup
1. Close the popup window and click the extension icon again to reopen.
2. Verify all saved workspaces persist intact from `chrome.storage.local`.

### Test Case 7: Close/Reopen Chrome
1. Restart Google Chrome completely.
2. Open the extension popup and verify saved workspaces remain preserved.

### Test Case 8: Restore Multiple Tabs
1. Save a workspace containing 10+ tabs.
2. Click **Restore**. Verify all 10+ tabs are created in sequential order in a new window.

### Test Case 9: Restore Pinned Tabs
1. Pin the first tab in your browser window and save the workspace.
2. Click **Restore**. Verify the pinned tab restores in pinned state in the new window.

### Test Case 10: Invalid/Unrestorable URL Handling
1. Open a browser tab with `chrome://extensions` alongside standard web pages and save workspace.
2. Click **Restore**. Verify standard web pages restore cleanly while internal pages are safely skipped without throwing unhandled exceptions.

---

## 🔒 Privacy & Security Behavior

- **100% Local Processing**: All workspace data stays strictly on your machine in `chrome.storage.local`.
- **Zero Remote Transmission**: No URLs, tab titles, or favicons are sent to any external server or backend.
- **No External Libraries**: Pure vanilla JavaScript implementation with zero tracking scripts or analytics.
