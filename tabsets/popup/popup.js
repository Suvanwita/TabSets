/**
 * TabSets — Named Browser Sessions
 * Popup UI Logic and Storage Architecture
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const AppState = {
    tabSets: [],
    searchQuery: "",
    activeDropdownId: null
  };

  // Default Mock Workspaces (used if storage is empty)
  const INITIAL_MOCK_TABSETS = [
    {
      id: "ts-cybersecurity-01",
      name: "Cybersecurity Project",
      tabCount: 12,
      updatedAt: Date.now() - 1000 * 60 * 45, // 45 minutes ago
      color: "#6366f1",
      tabs: [
        { title: "OWASP Top 10", url: "https://owasp.org" },
        { title: "PortSwigger Web Security Academy", url: "https://portswigger.net" }
      ]
    },
    {
      id: "ts-dsa-02",
      name: "DSA Preparation",
      tabCount: 8,
      updatedAt: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
      color: "#10b981",
      tabs: [
        { title: "LeetCode Problem Set", url: "https://leetcode.com" },
        { title: "NeetCode 150 Roadmap", url: "https://neetcode.io" }
      ]
    },
    {
      id: "ts-research-03",
      name: "Research Paper",
      tabCount: 7,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      color: "#ec4899",
      tabs: [
        { title: "arXiv Research Hub", url: "https://arxiv.org" },
        { title: "Google Scholar", url: "https://scholar.google.com" }
      ]
    },
    {
      id: "ts-placement-04",
      name: "Placement Preparation",
      tabCount: 14,
      updatedAt: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
      color: "#f59e0b",
      tabs: [
        { title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" },
        { title: "GeeksforGeeks", url: "https://geeksforgeeks.org" }
      ]
    }
  ];

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
  // Storage Manager Interface (chrome.storage.local abstraction with fallback)
  // ==========================================================================
  const StorageManager = {
    /**
     * Retrieves saved tab sets array asynchronously.
     */
    async getTabSets() {
      return new Promise((resolve) => {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(["tabSets"], (result) => {
            if (result.tabSets && Array.isArray(result.tabSets) && result.tabSets.length > 0) {
              resolve(result.tabSets);
            } else {
              // Seed default mock sets
              chrome.storage.local.set({ tabSets: INITIAL_MOCK_TABSETS });
              resolve(INITIAL_MOCK_TABSETS);
            }
          });
        } else {
          // LocalStorage fallback for non-extension browser preview
          const localData = localStorage.getItem("tabSets");
          if (localData) {
            try {
              resolve(JSON.parse(localData));
            } catch (e) {
              resolve(INITIAL_MOCK_TABSETS);
            }
          } else {
            localStorage.setItem("tabSets", JSON.stringify(INITIAL_MOCK_TABSETS));
            resolve(INITIAL_MOCK_TABSETS);
          }
        }
      });
    },

    /**
     * Saves tab sets array asynchronously.
     */
    async saveTabSets(tabSets) {
      return new Promise((resolve) => {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ tabSets: tabSets }, () => {
            resolve(true);
          });
        } else {
          localStorage.setItem("tabSets", JSON.stringify(tabSets));
          resolve(true);
        }
      });
    }
  };

  // ==========================================================================
  // Tab API Abstraction (Ready for Phase 2 integration)
  // ==========================================================================
  const TabManager = {
    /**
     * Fetches current browser window open tabs.
     */
    async getCurrentWindowTabs() {
      return new Promise((resolve) => {
        if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
          chrome.tabs.query({ currentWindow: true }, (tabs) => {
            const formattedTabs = tabs.map((t) => ({
              id: t.id,
              title: t.title || "New Tab",
              url: t.url || "chrome://newtab",
              favIconUrl: t.favIconUrl || ""
            }));
            resolve(formattedTabs);
          });
        } else {
          // Fallback mock tabs snapshot
          const mockCurrentTabs = [
            { title: "TabSets Developer Docs", url: "chrome://extensions" },
            { title: "GitHub Repository", url: "https://github.com" },
            { title: "Developer Console", url: "https://developer.chrome.com" },
            { title: "MDN Web Docs", url: "https://developer.mozilla.org" },
            { title: "Stack Overflow", url: "https://stackoverflow.com" }
          ];
          resolve(mockCurrentTabs);
        }
      });
    }
  };

  // ==========================================================================
  // Helper Functions
  // ==========================================================================

  /**
   * Formats timestamp into relative human-readable string (e.g. "Updated 45m ago")
   */
  function formatRelativeTime(timestamp) {
    if (!timestamp) return "Updated recently";
    const elapsedMs = Date.now() - timestamp;
    const minutes = Math.floor(elapsedMs / (1000 * 60));
    const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const days = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Updated just now";
    if (minutes < 60) return `Updated ${minutes}m ago`;
    if (hours < 24) return `Updated ${hours}h ago`;
    if (days === 1) return `Updated 1d ago`;
    return `Updated ${days}d ago`;
  }

  /**
   * Returns a SVG folder icon string with optional color tinting
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
   * Filters and renders the workspace list in the popup UI
   */
  function renderWorkspaces() {
    const query = AppState.searchQuery.trim().toLowerCase();
    
    // Filter workspaces by search term
    const filteredSets = AppState.tabSets.filter((set) =>
      set.name.toLowerCase().includes(query)
    );

    // Update Header Pill Count
    DOM.tabsetCount.textContent = AppState.tabSets.length;

    // Clear previous cards
    DOM.tabsetsList.innerHTML = "";

    if (filteredSets.length === 0) {
      DOM.tabsetsList.classList.add("hidden");
      DOM.emptyState.classList.remove("hidden");

      if (AppState.tabSets.length === 0) {
        DOM.emptyStateTitle.textContent = "No saved tab sets yet";
        DOM.emptyStateSubtitle.textContent = "Save your current browser window to create your first workspace.";
      } else {
        DOM.emptyStateTitle.textContent = "No matching tab sets";
        DOM.emptyStateSubtitle.textContent = `No workspaces found matching "${AppState.searchQuery}". Try a different keyword.`;
      }
      return;
    }

    DOM.emptyState.classList.add("hidden");
    DOM.tabsetsList.classList.remove("hidden");

    // Render cards
    filteredSets.forEach((set) => {
      const card = document.createElement("div");
      card.className = "workspace-card";
      card.dataset.id = set.id;
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      const accentColor = set.color || "#6366f1";

      card.innerHTML = `
        <div class="card-main">
          <div class="card-icon-box" style="background-color: ${accentColor}1a; color: ${accentColor};">
            ${getFolderIconSvg(accentColor)}
          </div>
          <div class="card-info">
            <span class="card-name" title="${escapeHtml(set.name)}">${escapeHtml(set.name)}</span>
            <div class="card-meta">
              <span class="meta-badge">${set.tabCount || (set.tabs ? set.tabs.length : 0)} tabs</span>
              <span class="meta-dot"></span>
              <span class="meta-time">${formatRelativeTime(set.updatedAt)}</span>
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

      // Card click listener (Open action fallback)
      card.addEventListener("click", (e) => {
        if (e.target.closest(".three-dot-btn")) return; // Don't trigger if clicked on menu button
        handleOpenWorkspace(set.id);
      });

      // Three dot button event listener
      const threeDotBtn = card.querySelector(".three-dot-btn");
      threeDotBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleDropdownMenu(e.currentTarget, set.id);
      });

      DOM.tabsetsList.appendChild(card);
    });
  }

  /**
   * Helper to escape HTML characters safely
   */
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ==========================================================================
  // Modal Interactions
  // ==========================================================================

  function openSaveModal() {
    DOM.saveModalBackdrop.classList.remove("hidden");
    DOM.saveModalBackdrop.setAttribute("aria-hidden", "false");
    DOM.workspaceNameInput.value = "";
    DOM.formError.classList.add("hidden");
    closeDropdownMenu();
    setTimeout(() => {
      DOM.workspaceNameInput.focus();
    }, 50);
  }

  function closeSaveModal() {
    DOM.saveModalBackdrop.classList.add("hidden");
    DOM.saveModalBackdrop.setAttribute("aria-hidden", "true");
    DOM.formError.classList.add("hidden");
  }

  async function handleSaveFormSubmit(e) {
    e.preventDefault();
    const name = DOM.workspaceNameInput.value.trim();

    if (!name) {
      DOM.formError.textContent = "Please enter a workspace name";
      DOM.formError.classList.remove("hidden");
      DOM.workspaceNameInput.focus();
      return;
    }

    // Capture current tabs
    const currentTabs = await TabManager.getCurrentWindowTabs();

    const newTabSet = {
      id: `ts-${Date.now()}`,
      name: name,
      tabCount: currentTabs.length,
      updatedAt: Date.now(),
      color: getRandomColor(),
      tabs: currentTabs
    };

    AppState.tabSets.unshift(newTabSet);
    await StorageManager.saveTabSets(AppState.tabSets);

    renderWorkspaces();
    closeSaveModal();
  }

  function getRandomColor() {
    const colors = ["#6366f1", "#10b981", "#ec4899", "#f59e0b", "#0284c7", "#8b5cf6"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // ==========================================================================
  // Dropdown Menu Interaction
  // ==========================================================================

  function toggleDropdownMenu(anchorBtn, tabSetId) {
    if (AppState.activeDropdownId === tabSetId && !DOM.dropdownMenu.classList.contains("hidden")) {
      closeDropdownMenu();
      return;
    }

    AppState.activeDropdownId = tabSetId;

    // Position menu near button
    const btnRect = anchorBtn.getBoundingClientRect();
    const popupRect = document.body.getBoundingClientRect();

    DOM.dropdownMenu.classList.remove("hidden");

    let topPos = btnRect.bottom + 4;
    let leftPos = btnRect.right - 170;

    // Boundary check
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

  // Handle dropdown actions
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

  function handleOpenWorkspace(tabSetId) {
    const set = AppState.tabSets.find((s) => s.id === tabSetId);
    if (!set) return;

    if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.create) {
      // In extension environment, open workspace tabs in new window
      if (set.tabs && set.tabs.length > 0) {
        chrome.windows.create({ url: set.tabs.map((t) => t.url) });
      }
    } else {
      alert(`Opening workspace "${set.name}" (${set.tabCount || (set.tabs ? set.tabs.length : 0)} tabs)`);
    }
  }

  async function handleRenameWorkspace(tabSetId) {
    const set = AppState.tabSets.find((s) => s.id === tabSetId);
    if (!set) return;

    const newName = prompt("Enter new workspace name:", set.name);
    if (newName && newName.trim() && newName.trim() !== set.name) {
      set.name = newName.trim();
      set.updatedAt = Date.now();
      await StorageManager.saveTabSets(AppState.tabSets);
      renderWorkspaces();
    }
  }

  async function handleDeleteWorkspace(tabSetId) {
    const setIndex = AppState.tabSets.findIndex((s) => s.id === tabSetId);
    if (setIndex === -1) return;

    AppState.tabSets.splice(setIndex, 1);
    await StorageManager.saveTabSets(AppState.tabSets);
    renderWorkspaces();
  }

  // ==========================================================================
  // Event Listeners Initialization
  // ==========================================================================

  function initEventListeners() {
    // Open Modal
    DOM.btnOpenSaveModal.addEventListener("click", openSaveModal);

    // Close Modal
    DOM.btnCloseModal.addEventListener("click", closeSaveModal);
    DOM.btnModalCancel.addEventListener("click", closeSaveModal);

    // Click backdrop outside modal card to close
    DOM.saveModalBackdrop.addEventListener("click", (e) => {
      if (e.target === DOM.saveModalBackdrop) {
        closeSaveModal();
      }
    });

    // Modal Form Submission
    DOM.saveForm.addEventListener("submit", handleSaveFormSubmit);

    // Keyboard handling for Modal & Dropdowns
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

    // Close dropdown on click outside
    document.addEventListener("click", (e) => {
      if (!DOM.dropdownMenu.classList.contains("hidden")) {
        if (!e.target.closest(".dropdown-menu") && !e.target.closest(".three-dot-btn")) {
          closeDropdownMenu();
        }
      }
    });

    // Search Input Filtering
    DOM.searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value;
      if (AppState.searchQuery.length > 0) {
        DOM.btnClearSearch.classList.remove("hidden");
      } else {
        DOM.btnClearSearch.classList.add("hidden");
      }
      renderWorkspaces();
    });

    // Clear Search Button
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
    AppState.tabSets = await StorageManager.getTabSets();
    renderWorkspaces();
  }

  init();
});
