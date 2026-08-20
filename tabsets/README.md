# TabSets — Named Browser Sessions

**TabSets** is a lightweight, modern Manifest V3 Chrome browser extension built to capture, organize, save, and restore browser tab sessions into named workspaces.

---

## 🏗️ Architecture

TabSets follows a clean, decoupled Chrome Extension (Manifest V3) architecture built with **HTML5**, **Vanilla CSS**, and **pure ES6+ JavaScript**:

```
tabsets/
├── manifest.json            # Extension manifest (MV3)
├── popup/
│   ├── index.html           # Popup window HTML structure & modal markup
│   ├── style.css            # Dark mode theme system & CSS component styles
│   └── popup.js             # UI controller, Chrome API tabs/storage handlers
├── background/
│   └── service-worker.js    # Persistent MV3 service worker & storage initializer
├── icons/
│   ├── icon16.png           # 16x16 Toolbar icon
│   ├── icon48.png           # 48x48 Extension manager icon
│   └── icon128.png          # 128x128 Web Store / App icon
└── README.md                # Project documentation
```

### Core Architecture Components:
1. **Popup UI Controller (`popup/popup.js`)**: Manages real-time search filtering, DOM rendering, modal states, input validation, and user interaction.
2. **Storage Helper Abstraction (`popup/popup.js`)**: Provides modular functions (`getTabSets()`, `saveTabSet()`, `deleteTabSet()`, `updateTabSet()`) for interacting with local storage.
3. **Chrome Tabs API Integration (`popup/popup.js`)**: Queries active browser windows, captures tab metadata (`url`, `title`, `favicon`, `index`, `pinned`), and filters out internal, un-restorable browser pages.
4. **Service Worker (`background/service-worker.js`)**: Background script that listens to extension events (`onInstalled`) and seeds initial storage if required.

---

## 💾 Storage Model

TabSets uses Chrome's `chrome.storage.local` API (with fallback to `localStorage` for non-extension browser preview environments).

### Storage Key: `tabsets`

Data is persisted under the `tabsets` key as an array of workspace objects:

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
          "pinned": false
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

### Storage Helpers (`popup/popup.js`):
- `getTabSets()`: Asynchronously retrieves all saved workspaces array from storage.
- `saveTabSet(tabSet)`: Persists a new workspace object (or updates an existing one).
- `deleteTabSet(id)`: Removes a workspace from storage by unique identifier.
- `updateTabSet(tabSet)`: Updates existing workspace name or tab data in storage.

---

## 🔐 Permissions Explanation

TabSets requests only minimal, necessary permissions in `manifest.json`:

| Permission | Purpose |
| :--- | :--- |
| `tabs` | Required to query open browser tabs in the currently active window, read tab titles, URLs, favicons, and restore workspaces in new windows. |
| `storage` | Required to persist saved workspace data locally across browser sessions using `chrome.storage.local`. |

---

## 🚀 Installation Instructions

Follow these steps to load TabSets into Google Chrome, Brave, or any Chromium browser:

1. Open **Google Chrome** or any Chromium-based browser.
2. Navigate to `chrome://extensions` in the address bar.
3. In the top-right corner, enable the **Developer mode** toggle switch.
4. Click the **Load unpacked** button in the top-left toolbar.
5. Select the `tabsets` extension directory:
   ```
   /home/user/TabSets/tabsets
   ```
6. Click **Select Folder**. The **TabSets — Named Browser Sessions** extension is now installed!
7. Pin the extension icon to your Chrome toolbar.

---

## 🧪 Testing Instructions

### 1. Saving Current Window Tabs:
- Open several web pages in your browser window.
- Click the **TabSets** extension icon in your toolbar.
- Click **+ Save Current Tabs**.
- Enter a unique workspace name (e.g., `Cybersecurity Research`) and click **Save** (or press `Enter`).
- Verify that the modal closes automatically, the popup refreshes, and the new workspace card appears instantly at the top of the list!

### 2. Validation & Edge Cases:
- **Empty Name Validation**: Try saving with an empty input or whitespace. Verify that the error message `"Workspace name cannot be empty."` is displayed.
- **Duplicate Name Validation**: Try saving with an existing workspace name (e.g. `Cybersecurity Research`). Verify the error message `"A workspace with this name already exists. Please choose a unique name."`.
- **Internal Pages Handling**: Tabs like `chrome://extensions` or `about:blank` are automatically filtered out to ensure session restoration integrity.

### 3. Workspace Operations:
- **Open Workspace**: Click on any workspace card (or choose **Open Workspace** in the `...` menu) to restore all workspace tabs into a new browser window.
- **Rename Workspace**: Click `...` ➔ **Rename**, enter a new name, and verify the name updates in real time.
- **Delete Workspace**: Click `...` ➔ **Delete Workspace**, confirm deletion, and verify the card is removed from storage.
- **Search Filtering**: Type a keyword in the search box to filter workspaces in real time. Click `X` to clear.

---

## 🔒 Privacy & Security Behavior

- **100% Local Processing**: TabSets operates entirely within your local web browser.
- **Zero Remote Transmission**: No URLs, page titles, favicons, or tab information are ever sent to an external server, backend database, analytics provider, or third party.
- **No External Dependencies**: Built without external API calls, third-party JavaScript libraries, tracking pixels, or remote scripts.
