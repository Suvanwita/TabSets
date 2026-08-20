/**
 * TabSets — Named Browser Sessions
 * Popup UI Logic, Storage Helpers & Chrome Tabs Integration
 */

document.addEventListener("DOMContentLoaded", () => {
  // Default Mock Workspaces (used when storage is initialized for the first time)
  const INITIAL_MOCK_TABSETS = [
    {
      id: "ts-cybersecurity-01",
      name: "Cybersecurity Project",
      createdAt: Date.now() - 1000 * 60 * 45,
      updatedAt: Date.now() - 1000 * 60 * 45, // 45 minutes ago
      tabs: [
        {
          url: "https://owasp.org/www-project-top-ten/",
          title: "OWASP Top 10 Web Application Security Risks",
          favicon: "https://owasp.org/assets/images/favicon.ico",
          index: 0,
          pinned: false
        },
        {
          url: "https://portswigger.net/burp/documentation",
          title: "Burp Suite Documentation",
          favicon: "https://portswigger.net/favicon.ico",
          index: 1,
          pinned: false
        },
        {
          url: "https://nvd.nist.gov/",
          title: "NVD - Search Vulnerability Database",
          favicon: "",
          index: 2,
          pinned: false
        },
        {
          url: "https://github.com/topics/network-security",
          title: "GitHub - Network Security Tools",
          favicon: "https://github.githubassets.com/favicons/favicon.png",
          index: 3,
          pinned: false
        }
      ]
    },
    {
      id: "ts-dsa-02",
      name: "DSA Preparation",
      createdAt: Date.now() - 1000 * 60 * 60 * 3,
      updatedAt: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
      tabs: [
        {
          url: "https://leetcode.com/problemset/all/",
          title: "LeetCode Top Interview Questions",
          favicon: "https://leetcode.com/favicon.ico",
          index: 0,
          pinned: false
        },
        {
          url: "https://neetcode.io/roadmap",
          title: "NeetCode 150 Roadmap",
          favicon: "https://neetcode.io/favicon.ico",
          index: 1,
          pinned: false
        },
        {
          url: "https://visualgo.net/en",
          title: "Visualizing Algorithms - VisuAlgo",
          favicon: "",
          index: 2,
          pinned: false
        }
      ]
    },
    {
      id: "ts-research-03",
      name: "Research Paper",
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      tabs: [
        {
          url: "https://arxiv.org/abs/1706.03762",
          title: "arXiv: Attention Is All You Need",
          favicon: "https://arxiv.org/favicon.ico",
          index: 0,
          pinned: false
        },
        {
          url: "https://scholar.google.com",
          title: "Google Scholar Search",
          favicon: "",
          index: 1,
          pinned: false
        },
        {
          url: "https://paperswithcode.com/",
          title: "Papers with Code - AI Benchmarks",
          favicon: "",
          index: 2,
          pinned: false
        }
      ]
    },
    {
      id: "ts-placement-04",
      name: "Placement Preparation",
      createdAt: Date.now() - 1000 * 60 * 60 * 48,
      updatedAt: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
      tabs: [
        {
          url: "https://github.com/donnemartin/system-design-primer",
          title: "System Design Primer - GitHub",
          favicon: "https://github.githubassets.com/favicons/favicon.png",
          index: 0,
          pinned: false
        },
        {
          url: "https://geeksforgeeks.org/",
          title: "GeeksforGeeks Interview Corner",
          favicon: "",
          index: 1,
          pinned: false
        },
        {
          url: "https://www.techinterviewhandbook.org/",
          title: "Tech Interview Handbook",
          favicon: "",
          index: 2,
          pinned: false
        }
      ]
    }
  ];

  // Application State
  const AppState = {
    tabSets: [],
    searchQuery: "",
    activeDropdownId: null
  };

  // DOM Elements Reference
  const DOM = {
    btnOpenSaveModal: document.getElementById("btn-open-save-modal"),
    searchInput: document.getElementById("search-input"),
    btnClearSearch: document.getElementById("btn-clear-search"),
    tabsetCount: document.getElementById("tabset-count"),
    tabsetsList: document.getElementById("tabsets-list"),
    emptyState: document.getElementById("empty-state"),
    emptyStateTitle: document.getElementById("empty-state-title"),
    emptyStateSubtitle: document.getElementById("empty-state-subtitle"),
    
    // Modal Elements
    saveModalBackdrop: document.getElementById("save-modal-backdrop"),
    btnCloseModal: document.getElementById("btn-close-modal"),
    btnModalCancel: document.getElementById("btn-modal-cancel"),
    saveForm: document.getElementById("save-tabset-form"),
    workspaceNameInput: document.getElementById("workspace-name-input"),
    formError: document.getElementById("form-error"),
    
    // Shared Dropdown Menu
    dropdownMenu: document.getElementById("card-dropdown-menu")
  };

  // ==========================================================================
  // Storage Helper Functions (chrome.storage.local under key 'tabsets')
  // ==========================================================================

  /**
   * Retrieves array of saved TabSet objects asynchronously.
   * Key: { tabsets: [...] }
   */
  async function getTabSets() {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(["tabsets"], (result) => {
          if (chrome.runtime.lastError) {
            console.error("[TabSets] Storage error:", chrome.runtime.lastError);
            resolve(INITIAL_MOCK_TABSETS);
            return;
          }
          if (result && Array.isArray(result.tabsets)) {
            resolve(result.tabsets);
          } else {
            // Seed initial mock tabsets if storage key is empty
            chrome.storage.local.set({ tabsets: INITIAL_MOCK_TABSETS }, () => {
              resolve(INITIAL_MOCK_TABSETS);
            });
          }
        });
      } else {
        // Fallback for local browser testing without extension context
        try {
          const localData = localStorage.getItem("tabsets");
          if (localData) {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed)) {
              resolve(parsed);
              return;
            }
          }
          localStorage.setItem("tabsets", JSON.stringify(INITIAL_MOCK_TABSETS));
          resolve(INITIAL_MOCK_TABSETS);
        } catch (e) {
          console.error("[TabSets] LocalStorage fallback error:", e);
          resolve(INITIAL_MOCK_TABSETS);
        }
      }
    });
  }

  /**
   * Internal helper to persist array of tabsets to chrome.storage.local
   */
  async function persistTabSets(tabSetsArray) {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ tabsets: tabSetsArray }, () => {
          if (chrome.runtime.lastError) {
            console.error("[TabSets] Error persisting tabsets:", chrome.runtime.lastError);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      } else {
        try {
          localStorage.setItem("tabsets", JSON.stringify(tabSetsArray));
          resolve(true);
        } catch (e) {
          console.error("[TabSets] LocalStorage persist error:", e);
          resolve(false);
        }
      }
    });
  }

  /**
   * Saves or updates a single TabSet object into storage.
   * @param {Object} tabSet
   * @returns {Promise<boolean>}
   */
  async function saveTabSet(tabSet) {
    if (!tabSet || !tabSet.id || !tabSet.name || !Array.isArray(tabSet.tabs)) {
      console.error("[TabSets] Invalid TabSet object:", tabSet);
      return false;
    }

    const currentTabSets = await getTabSets();
    const index = currentTabSets.findIndex((s) => s.id === tabSet.id);

    if (index >= 0) {
      currentTabSets[index] = tabSet;
    } else {
      currentTabSets.unshift(tabSet);
    }

    return persistTabSets(currentTabSets);
  }

  /**
   * Deletes a TabSet object by ID from storage.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async function deleteTabSet(id) {
    if (!id) return false;
    const currentTabSets = await getTabSets();
    const filtered = currentTabSets.filter((s) => s.id !== id);
    return persistTabSets(filtered);
  }

  /**
   * Updates an existing TabSet object in storage.
   * @param {Object} tabSet
   * @returns {Promise<boolean>}
   */
  async function updateTabSet(tabSet) {
    return saveTabSet(tabSet);
  }

  // Expose storage helpers to global window scope for modular access & testing
  window.getTabSets = getTabSets;
  window.saveTabSet = saveTabSet;
  window.deleteTabSet = deleteTabSet;
  window.updateTabSet = updateTabSet;

  // ==========================================================================
  // Chrome Tabs API Integration & URL Filtering
  // ==========================================================================

  /**
   * Checks if URL is a standard web page suitable for restoration.
   * Ignores un-restorable internal Chrome pages (chrome://, chrome-extension://, etc.)
   */
  function isRestorableUrl(url) {
    if (!url || typeof url !== "string") return false;
    const trimmed = url.trim().toLowerCase();
    if (
      trimmed.startsWith("chrome://") ||
      trimmed.startsWith("chrome-extension://") ||
      trimmed.startsWith("about:") ||
      trimmed.startsWith("edge://") ||
      trimmed.startsWith("view-source:")
    ) {
      return false;
    }
    return true;
  }

  /**
   * Formats a missing tab title safely.
   */
  function formatDefaultTitle(url) {
    if (!url) return "Untitled Tab";
    try {
      const parsed = new URL(url);
      return parsed.hostname || "Untitled Tab";
    } catch (e) {
      return "Untitled Tab";
    }
  }

  /**
   * Queries current active browser window for open tabs using chrome.tabs.query.
   * Captures for each tab: url, title, favicon, index, pinned.
   */
  async function getCurrentWindowTabs() {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          if (chrome.runtime.lastError || !tabs) {
            console.error("[TabSets] Tabs query error:", chrome.runtime.lastError);
            resolve([]);
            return;
          }

          const validTabs = tabs
            .filter((t) => isRestorableUrl(t.url || t.pendingUrl))
            .map((t, idx) => ({
              url: t.url || t.pendingUrl || "",
              title: (t.title && t.title.trim()) ? t.title.trim() : formatDefaultTitle(t.url || t.pendingUrl),
              favicon: t.favIconUrl || "",
              index: typeof t.index === "number" ? t.index : idx,
              pinned: Boolean(t.pinned)
            }));

          resolve(validTabs);
        });
      } else {
        // Fallback mock tabs when testing popup UI directly in browser
        const mockCurrentTabs = [
          {
            url: "https://owasp.org/www-project-top-ten/",
            title: "OWASP Top 10 Web Application Security Risks",
            favicon: "https://owasp.org/assets/images/favicon.ico",
            index: 0,
            pinned: true
          },
          {
            url: "https://github.com/topics/network-security",
            title: "GitHub - Network Security Tools",
            favicon: "https://github.githubassets.com/favicons/favicon.png",
            index: 1,
            pinned: false
          },
          {
            url: "https://leetcode.com/problemset/all/",
            title: "LeetCode Top Interview Questions",
            favicon: "https://leetcode.com/favicon.ico",
            index: 2,
            pinned: false
          }
        ];
        resolve(mockCurrentTabs);
      }
    });
  }

  // ==========================================================================
  // Relative Timestamp Generator
  // ==========================================================================

  /**
   * Formats timestamp into relative human-readable string.
   * Returns: "Just now", "1 minute ago", "5 minutes ago", "1 hour ago", "2 hours ago", "Yesterday", "3 days ago"
   */
  function formatRelativeTime(timestamp) {
    if (!timestamp) return "Just now";
    const elapsedMs = Date.now() - timestamp;
    if (elapsedMs < 0) return "Just now";

    const seconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
      return "Just now";
    } else if (minutes < 60) {
      return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    } else if (hours < 24) {
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    } else if (days === 1) {
      return "Yesterday";
    } else {
      return `${days} days ago`;
    }
  }

  /**
   * Folder icon SVG helper with color tint
   */
  function getFolderIconSvg(color = "#6366f1") {
    return `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="${color}" fill-opacity="0.15"/>
      </svg>
    `;
  }

  // ==========================================================================
  // Render Logic
  // ==========================================================================

  /**
   * Filters and renders the workspace cards list in the popup UI
   */
  function renderWorkspaces() {
    const query = AppState.searchQuery.trim().toLowerCase();
    
    // Filter workspaces by search term
    const filteredSets = AppState.tabSets.filter((set) =>
      set.name.toLowerCase().includes(query)
    );

    // Update Header Pill Count
    DOM.tabsetCount.textContent = AppState.tabSets.length;

    // Clear existing cards
    DOM.tabsetsList.innerHTML = "";

    if (filteredSets.length === 0) {
      DOM.tabsetsList.classList.add("hidden");
      DOM.emptyState.classList.remove("hidden");

      if (AppState.tabSets.length === 0) {
        DOM.emptyStateTitle.textContent = "No saved tab sets yet";
        DOM.emptyStateSubtitle.textContent = "Save your current browser window to create your first workspace.";
      } else {
        DOM.emptyStateTitle.textContent = "No matching tab sets";
        DOM.emptyStateSubtitle.textContent = `No workspaces found matching "${escapeHtml(AppState.searchQuery)}". Try a different keyword.`;
      }
      return;
    }

    DOM.emptyState.classList.add("hidden");
    DOM.tabsetsList.classList.remove("hidden");

    // Render workspace cards
    filteredSets.forEach((set) => {
      const card = document.createElement("div");
      card.className = "workspace-card";
      card.dataset.id = set.id;
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      const accentColor = "#6366f1";
      const tabCount = set.tabs ? set.tabs.length : 0;
      const relativeTime = formatRelativeTime(set.updatedAt);

      card.innerHTML = `
        <div class="card-main">
          <div class="card-icon-box" style="background-color: ${accentColor}1a; color: ${accentColor};">
            ${getFolderIconSvg(accentColor)}
          </div>
          <div class="card-info">
            <span class="card-name" title="${escapeHtml(set.name)}">${escapeHtml(set.name)}</span>
            <div class="card-meta">
              <span class="meta-badge">${tabCount} ${tabCount === 1 ? "tab" : "tabs"}</span>
              <span class="meta-dot"></span>
              <span class="meta-time">${relativeTime}</span>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <button type="button" class="btn-icon-only three-dot-btn" aria-label="Workspace options for ${escapeHtml(set.name)}" data-id="${set.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>
      `;

      // Card click listener (Open workspace)
      card.addEventListener("click", (e) => {
        if (e.target.closest(".three-dot-btn")) return;
        handleOpenWorkspace(set.id);
      });

      // Card keyboard Enter/Space key listener
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (e.target.closest(".three-dot-btn")) return;
          e.preventDefault();
          handleOpenWorkspace(set.id);
        }
      });

      // Three-dot options menu listener
      const threeDotBtn = card.querySelector(".three-dot-btn");
      threeDotBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleDropdownMenu(e.currentTarget, set.id);
      });

      DOM.tabsetsList.appendChild(card);
    });
  }

  /**
   * Escape HTML to prevent XSS issues
   */
  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ==========================================================================
  // Form Error Handling & Validation
  // ==========================================================================

  function showFormError(message) {
    DOM.formError.textContent = message;
    DOM.formError.classList.remove("hidden");
  }

  function hideFormError() {
    DOM.formError.textContent = "";
    DOM.formError.classList.add("hidden");
  }

  // ==========================================================================
  // Modal Interaction Handlers
  // ==========================================================================

  function openSaveModal() {
    DOM.saveModalBackdrop.classList.remove("hidden");
    DOM.saveModalBackdrop.setAttribute("aria-hidden", "false");
    DOM.workspaceNameInput.value = "";
    hideFormError();
    closeDropdownMenu();
    setTimeout(() => {
      DOM.workspaceNameInput.focus();
    }, 50);
  }

  function closeSaveModal() {
    DOM.saveModalBackdrop.classList.add("hidden");
    DOM.saveModalBackdrop.setAttribute("aria-hidden", "true");
    hideFormError();
  }

  /**
   * Handles Save Modal Form submission
   */
  async function handleSaveFormSubmit(e) {
    e.preventDefault();
    hideFormError();

    const rawName = DOM.workspaceNameInput.value;
    const trimmedName = rawName.trim();

    // 1. Validate empty name
    if (!trimmedName) {
      showFormError("Workspace name cannot be empty.");
      DOM.workspaceNameInput.focus();
      return;
    }

    // 2. Validate duplicate names (case-insensitive)
    const isDuplicate = AppState.tabSets.some(
      (set) => set.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      showFormError("A workspace with this name already exists. Please choose a unique name.");
      DOM.workspaceNameInput.focus();
      return;
    }

    // 3. Query current active browser window tabs
    const activeTabs = await getCurrentWindowTabs();

    if (!activeTabs || activeTabs.length === 0) {
      showFormError("No saveable browser tabs found in the current window.");
      return;
    }

    // 4. Construct TabSet object
    const now = Date.now();
    const newTabSet = {
      id: `ts-${now}-${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      createdAt: now,
      updatedAt: now,
      tabs: activeTabs
    };

    // 5. Persist to storage using saveTabSet helper
    const success = await saveTabSet(newTabSet);
    if (!success) {
      showFormError("Storage error occurred while saving the workspace.");
      return;
    }

    // 6. Refresh state & UI immediately
    AppState.tabSets = await getTabSets();
    renderWorkspaces();
    closeSaveModal();
  }

  // ==========================================================================
  // Dropdown Context Menu Interaction
  // ==========================================================================

  function toggleDropdownMenu(anchorBtn, tabSetId) {
    if (AppState.activeDropdownId === tabSetId && !DOM.dropdownMenu.classList.contains("hidden")) {
      closeDropdownMenu();
      return;
    }

    AppState.activeDropdownId = tabSetId;

    const btnRect = anchorBtn.getBoundingClientRect();
    const popupRect = document.body.getBoundingClientRect();

    DOM.dropdownMenu.classList.remove("hidden");

    let topPos = btnRect.bottom + 4;
    let leftPos = btnRect.right - 170;

    if (leftPos < 10) leftPos = 10;
    if (topPos + 120 > popupRect.bottom) {
      topPos = btnRect.top - 125;
    }

    DOM.dropdownMenu.style.top = `${topPos}px`;
    DOM.dropdownMenu.style.left = `${leftPos}px`;
  }

  function closeDropdownMenu() {
    DOM.dropdownMenu.classList.add("hidden");
    AppState.activeDropdownId = null;
  }

  // Handle dropdown action selections
  DOM.dropdownMenu.addEventListener("click", async (e) => {
    const actionItem = e.target.closest(".dropdown-item");
    if (!actionItem) return;

    const action = actionItem.dataset.action;
    const tabSetId = AppState.activeDropdownId;
    closeDropdownMenu();

    if (!tabSetId) return;

    if (action === "open") {
      handleOpenWorkspace(tabSetId);
    } else if (action === "rename") {
      handleRenameWorkspace(tabSetId);
    } else if (action === "delete") {
      handleDeleteWorkspace(tabSetId);
    }
  });

  /**
   * Opens workspace tabs in a new browser window
   */
  function handleOpenWorkspace(tabSetId) {
    const set = AppState.tabSets.find((s) => s.id === tabSetId);
    if (!set || !set.tabs || set.tabs.length === 0) {
      alert("This workspace contains no tabs to open.");
      return;
    }

    const urls = set.tabs
      .map((t) => t.url)
      .filter((url) => isRestorableUrl(url));

    if (urls.length === 0) {
      alert("No valid web URLs found in this workspace.");
      return;
    }

    if (typeof chrome !== "undefined" && chrome.windows && chrome.windows.create) {
      chrome.windows.create({ url: urls }, () => {
        if (chrome.runtime.lastError) {
          console.error("[TabSets] Error restoring window:", chrome.runtime.lastError);
        }
      });
    } else {
      alert(`[Browser Preview Mode] Opening workspace "${set.name}" with ${urls.length} tabs:\n` + urls.join("\n"));
    }
  }

  /**
   * Handles workspace renaming
   */
  async function handleRenameWorkspace(tabSetId) {
    const set = AppState.tabSets.find((s) => s.id === tabSetId);
    if (!set) return;

    const inputName = prompt("Enter new workspace name:", set.name);
    if (inputName === null) return; // User cancelled

    const trimmed = inputName.trim();

    if (!trimmed) {
      alert("Workspace name cannot be empty.");
      return;
    }

    const isDuplicate = AppState.tabSets.some(
      (s) => s.id !== tabSetId && s.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      alert("A workspace with this name already exists.");
      return;
    }

    set.name = trimmed;
    set.updatedAt = Date.now();

    await updateTabSet(set);
    AppState.tabSets = await getTabSets();
    renderWorkspaces();
  }

  /**
   * Handles workspace deletion
   */
  async function handleDeleteWorkspace(tabSetId) {
    const set = AppState.tabSets.find((s) => s.id === tabSetId);
    if (!set) return;

    const confirmed = confirm(`Are you sure you want to delete workspace "${set.name}"?`);
    if (!confirmed) return;

    await deleteTabSet(tabSetId);
    AppState.tabSets = await getTabSets();
    renderWorkspaces();
  }

  // ==========================================================================
  // Event Listeners Initialization
  // ==========================================================================

  function initEventListeners() {
    // Open Modal button
    DOM.btnOpenSaveModal.addEventListener("click", openSaveModal);

    // Close Modal buttons
    DOM.btnCloseModal.addEventListener("click", closeSaveModal);
    DOM.btnModalCancel.addEventListener("click", closeSaveModal);

    // Click backdrop to close
    DOM.saveModalBackdrop.addEventListener("click", (e) => {
      if (e.target === DOM.saveModalBackdrop) {
        closeSaveModal();
      }
    });

    // Form input error reset on typing
    DOM.workspaceNameInput.addEventListener("input", () => {
      if (!DOM.formError.classList.contains("hidden")) {
        hideFormError();
      }
    });

    // Save Form Submission
    DOM.saveForm.addEventListener("submit", handleSaveFormSubmit);

    // Escape key closing
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!DOM.saveModalBackdrop.classList.contains("hidden")) {
          closeSaveModal();
        }
        if (!DOM.dropdownMenu.classList.contains("hidden")) {
          closeDropdownMenu();
        }
      }
    });

    // Click outside dropdown to close
    document.addEventListener("click", (e) => {
      if (!DOM.dropdownMenu.classList.contains("hidden")) {
        if (!e.target.closest(".dropdown-menu") && !e.target.closest(".three-dot-btn")) {
          closeDropdownMenu();
        }
      }
    });

    // Search input filtering
    DOM.searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value;
      if (AppState.searchQuery.length > 0) {
        DOM.btnClearSearch.classList.remove("hidden");
      } else {
        DOM.btnClearSearch.classList.add("hidden");
      }
      renderWorkspaces();
    });

    // Clear search button
    DOM.btnClearSearch.addEventListener("click", () => {
      DOM.searchInput.value = "";
      AppState.searchQuery = "";
      DOM.btnClearSearch.classList.add("hidden");
      DOM.searchInput.focus();
      renderWorkspaces();
    });
  }

  // ==========================================================================
  // App Initialization
  // ==========================================================================

  async function init() {
    initEventListeners();
    AppState.tabSets = await getTabSets();
    renderWorkspaces();
  }

  init();
});
