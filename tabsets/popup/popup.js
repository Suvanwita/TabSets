/**
 * TabSets — Named Browser Sessions
 * Decoupled Architecture: StorageManager, TabManager, RestoreManager, ModalController, ToastController
 */

document.addEventListener("DOMContentLoaded", () => {
  // Default Mock Workspaces (used when storage is uninitialized)
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
          pinned: true
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
    activeDropdownId: null,
    targetWorkspaceId: null // Stores target tabSet ID for Rename/Update/Delete modals
  };

  // DOM Cache
  const DOM = {
    btnOpenSaveModal: document.getElementById("btn-open-save-modal"),
    searchInput: document.getElementById("search-input"),
    btnClearSearch: document.getElementById("btn-clear-search"),
    tabsetCount: document.getElementById("tabset-count"),
    tabsetsList: document.getElementById("tabsets-list"),
    emptyState: document.getElementById("empty-state"),
    emptyStateTitle: document.getElementById("empty-state-title"),
    emptyStateSubtitle: document.getElementById("empty-state-subtitle"),
    
    // Toast Banner
    toastBanner: document.getElementById("toast-banner"),
    toastIcon: document.getElementById("toast-icon"),
    toastMessage: document.getElementById("toast-message"),

    // Save Modal
    saveModalBackdrop: document.getElementById("save-modal-backdrop"),
    btnCloseSaveModal: document.getElementById("btn-close-modal"),
    btnSaveCancel: document.getElementById("btn-modal-cancel"),
    btnSaveSubmit: document.getElementById("btn-modal-save"),
    saveForm: document.getElementById("save-tabset-form"),
    saveWorkspaceNameInput: document.getElementById("workspace-name-input"),
    saveFormError: document.getElementById("form-error"),
    
    // Rename Modal
    renameModalBackdrop: document.getElementById("rename-modal-backdrop"),
    btnCloseRenameModal: document.getElementById("btn-close-rename-modal"),
    btnRenameCancel: document.getElementById("btn-rename-cancel"),
    btnRenameSubmit: document.getElementById("btn-rename-submit"),
    renameForm: document.getElementById("rename-tabset-form"),
    renameWorkspaceNameInput: document.getElementById("rename-workspace-name-input"),
    renameFormError: document.getElementById("rename-form-error"),

    // Update Confirmation Modal
    updateModalBackdrop: document.getElementById("update-modal-backdrop"),
    btnCloseUpdateModal: document.getElementById("btn-close-update-modal"),
    btnUpdateCancel: document.getElementById("btn-update-cancel"),
    btnUpdateConfirm: document.getElementById("btn-update-confirm"),
    updateTargetName: document.getElementById("update-target-name"),

    // Delete Confirmation Modal
    deleteModalBackdrop: document.getElementById("delete-modal-backdrop"),
    btnCloseDeleteModal: document.getElementById("btn-close-delete-modal"),
    btnDeleteCancel: document.getElementById("btn-delete-cancel"),
    btnDeleteConfirm: document.getElementById("btn-delete-confirm"),
    deleteTargetName: document.getElementById("delete-target-name"),

    // Context Dropdown Menu
    dropdownMenu: document.getElementById("card-dropdown-menu")
  };

  // ==========================================================================
  // MODULE 1: Toast Notification Controller
  // ==========================================================================
  let toastTimer = null;

  const ToastController = {
    show(message, type = "success", duration = 3000) {
      if (!DOM.toastBanner) return;

      if (toastTimer) clearTimeout(toastTimer);

      DOM.toastMessage.textContent = message;
      DOM.toastBanner.className = `toast-banner ${type}`;

      if (type === "success") {
        DOM.toastIcon.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
      } else {
        DOM.toastIcon.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        `;
      }

      DOM.toastBanner.classList.remove("hidden");

      toastTimer = setTimeout(() => {
        DOM.toastBanner.classList.add("hidden");
      }, duration);
    }
  };

  // ==========================================================================
  // MODULE 2: Storage Manager Interface (chrome.storage.local key 'tabsets')
  // ==========================================================================
  const StorageManager = {
    async getTabSets() {
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
              chrome.storage.local.set({ tabsets: INITIAL_MOCK_TABSETS }, () => {
                resolve(INITIAL_MOCK_TABSETS);
              });
            }
          });
        } else {
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
    },

    async persistTabSets(tabSetsArray) {
      return new Promise((resolve) => {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ tabsets: tabSetsArray }, () => {
            if (chrome.runtime.lastError) {
              console.error("[TabSets] Error saving to storage:", chrome.runtime.lastError);
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
            console.error("[TabSets] LocalStorage write error:", e);
            resolve(false);
          }
        }
      });
    },

    async saveTabSet(tabSet) {
      if (!tabSet || !tabSet.id || !tabSet.name || !Array.isArray(tabSet.tabs)) {
        console.error("[TabSets] Invalid TabSet object:", tabSet);
        return false;
      }

      const currentTabSets = await this.getTabSets();
      const index = currentTabSets.findIndex((s) => s.id === tabSet.id);

      if (index >= 0) {
        currentTabSets[index] = tabSet;
      } else {
        currentTabSets.unshift(tabSet);
      }

      return this.persistTabSets(currentTabSets);
    },

    async deleteTabSet(id) {
      if (!id) return false;
      const currentTabSets = await this.getTabSets();
      const filtered = currentTabSets.filter((s) => s.id !== id);
      return this.persistTabSets(filtered);
    },

    async updateTabSet(tabSet) {
      return this.saveTabSet(tabSet);
    }
  };

  // Expose storage helpers to window
  window.getTabSets = StorageManager.getTabSets.bind(StorageManager);
  window.saveTabSet = StorageManager.saveTabSet.bind(StorageManager);
  window.deleteTabSet = StorageManager.deleteTabSet.bind(StorageManager);
  window.updateTabSet = StorageManager.updateTabSet.bind(StorageManager);

  // ==========================================================================
  // MODULE 3: Tab Manager (Chrome Tabs API & URL Sanitization)
  // ==========================================================================
  const TabManager = {
    isRestorableUrl(url) {
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
    },

    formatDefaultTitle(url) {
      if (!url) return "Untitled Tab";
      try {
        const parsed = new URL(url);
        return parsed.hostname || "Untitled Tab";
      } catch (e) {
        return "Untitled Tab";
      }
    },

    async getCurrentWindowTabs() {
      return new Promise((resolve) => {
        if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
          chrome.tabs.query({ currentWindow: true }, (tabs) => {
            if (chrome.runtime.lastError || !tabs) {
              console.error("[TabSets] Tabs query error:", chrome.runtime.lastError);
              resolve([]);
              return;
            }

            const validTabs = tabs
              .filter((t) => this.isRestorableUrl(t.url || t.pendingUrl))
              .map((t, idx) => ({
                url: t.url || t.pendingUrl || "",
                title: (t.title && t.title.trim()) ? t.title.trim() : this.formatDefaultTitle(t.url || t.pendingUrl),
                favicon: t.favIconUrl || "",
                index: typeof t.index === "number" ? t.index : idx,
                pinned: Boolean(t.pinned)
              }));

            resolve(validTabs);
          });
        } else {
          // Fallback mock tabs for browser preview mode
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
  };

  // ==========================================================================
  // MODULE 4: Restore Manager (FEATURE 1 — RESTORE)
  // Creates a NEW browser window, restores all valid tabs preserving order & pinned state
  // ==========================================================================
  const RestoreManager = {
    async restoreWorkspace(tabSet) {
      if (!tabSet || !Array.isArray(tabSet.tabs) || tabSet.tabs.length === 0) {
        ToastController.show("This workspace contains no tabs to restore.", "error");
        return;
      }

      // Filter valid URLs and sort by index
      const validTabs = tabSet.tabs
        .filter((t) => TabManager.isRestorableUrl(t.url))
        .sort((a, b) => (a.index || 0) - (b.index || 0));

      if (validTabs.length === 0) {
        ToastController.show("No valid web pages found in this workspace.", "error");
        return;
      }

      if (typeof chrome !== "undefined" && chrome.windows && chrome.windows.create) {
        try {
          // Always create a NEW window with the first tab
          chrome.windows.create({ url: validTabs[0].url }, (newWindow) => {
            if (chrome.runtime.lastError || !newWindow) {
              console.error("[TabSets] Failed to create browser window:", chrome.runtime.lastError);
              ToastController.show("Failed to create new browser window.", "error");
              return;
            }

            // Set pinned status for the first tab if required
            if (validTabs[0].pinned && newWindow.tabs && newWindow.tabs[0]) {
              chrome.tabs.update(newWindow.tabs[0].id, { pinned: true });
            }

            // Restore subsequent tabs sequentially, preserving order & pinned state
            for (let i = 1; i < validTabs.length; i++) {
              const tabData = validTabs[i];
              chrome.tabs.create(
                {
                  windowId: newWindow.id,
                  url: tabData.url,
                  pinned: Boolean(tabData.pinned),
                  index: i
                },
                () => {
                  if (chrome.runtime.lastError) {
                    console.warn(`[TabSets] Failed restoring tab (${tabData.url}):`, chrome.runtime.lastError.message);
                  }
                }
              );
            }

            ToastController.show(`Restored "${tabSet.name}" (${validTabs.length} tabs) in new window.`, "success");
          });
        } catch (err) {
          console.error("[TabSets] Window restoration error:", err);
          ToastController.show("Restoration error occurred.", "error");
        }
      } else {
        // Fallback for standalone browser preview mode
        const tabUrls = validTabs.map((t) => t.url);
        alert(`[Browser Mode] Restoring workspace "${tabSet.name}" in a NEW window (${validTabs.length} tabs):\n` + tabUrls.join("\n"));
        ToastController.show(`Restored "${tabSet.name}" (${validTabs.length} tabs).`, "success");
      }
    }
  };

  // ==========================================================================
  // Relative Timestamp Generator
  // ==========================================================================
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

  function getFolderIconSvg(color = "#6366f1") {
    return `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="${color}" fill-opacity="0.15"/>
      </svg>
    `;
  }

  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ==========================================================================
  // MODULE 5: Workspace List Renderer
  // ==========================================================================
  function renderWorkspaces() {
    const query = AppState.searchQuery.trim().toLowerCase();
    
    const filteredSets = AppState.tabSets.filter((set) =>
      set.name.toLowerCase().includes(query)
    );

    DOM.tabsetCount.textContent = AppState.tabSets.length;
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

      // Clicking card triggers RESTORE in a NEW window
      card.addEventListener("click", (e) => {
        if (e.target.closest(".three-dot-btn")) return;
        RestoreManager.restoreWorkspace(set);
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (e.target.closest(".three-dot-btn")) return;
          e.preventDefault();
          RestoreManager.restoreWorkspace(set);
        }
      });

      const threeDotBtn = card.querySelector(".three-dot-btn");
      threeDotBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleDropdownMenu(e.currentTarget, set.id);
      });

      DOM.tabsetsList.appendChild(card);
    });
  }

  // ==========================================================================
  // MODULE 6: Modal Controller (Save, Rename, Update, Delete)
  // ==========================================================================
  const ModalController = {
    // ---------------- Save Modal ----------------
    openSaveModal() {
      closeDropdownMenu();
      DOM.saveModalBackdrop.classList.remove("hidden");
      DOM.saveModalBackdrop.setAttribute("aria-hidden", "false");
      DOM.saveWorkspaceNameInput.value = "";
      this.hideFormError(DOM.saveFormError);
      setTimeout(() => DOM.saveWorkspaceNameInput.focus(), 50);
    },

    closeSaveModal() {
      DOM.saveModalBackdrop.classList.add("hidden");
      DOM.saveModalBackdrop.setAttribute("aria-hidden", "true");
      this.hideFormError(DOM.saveFormError);
    },

    async handleSaveSubmit(e) {
      e.preventDefault();
      this.hideFormError(DOM.saveFormError);

      const trimmedName = DOM.saveWorkspaceNameInput.value.trim();

      if (!trimmedName) {
        this.showFormError(DOM.saveFormError, "Workspace name cannot be empty.");
        DOM.saveWorkspaceNameInput.focus();
        return;
      }

      const isDuplicate = AppState.tabSets.some(
        (set) => set.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (isDuplicate) {
        this.showFormError(DOM.saveFormError, "A workspace with this name already exists.");
        DOM.saveWorkspaceNameInput.focus();
        return;
      }

      DOM.btnSaveSubmit.disabled = true;

      const activeTabs = await TabManager.getCurrentWindowTabs();

      if (!activeTabs || activeTabs.length === 0) {
        this.showFormError(DOM.saveFormError, "No saveable browser tabs found in current window.");
        DOM.btnSaveSubmit.disabled = false;
        return;
      }

      const now = Date.now();
      const newTabSet = {
        id: `ts-${now}-${Math.random().toString(36).substring(2, 7)}`,
        name: trimmedName,
        createdAt: now,
        updatedAt: now,
        tabs: activeTabs
      };

      const success = await StorageManager.saveTabSet(newTabSet);
      DOM.btnSaveSubmit.disabled = false;

      if (!success) {
        this.showFormError(DOM.saveFormError, "Storage error occurred while saving workspace.");
        return;
      }

      AppState.tabSets = await StorageManager.getTabSets();
      renderWorkspaces();
      this.closeSaveModal();
      ToastController.show(`Workspace "${trimmedName}" saved successfully.`, "success");
    },

    // ---------------- Rename Modal (FEATURE 2 — RENAME) ----------------
    openRenameModal(tabSetId) {
      closeDropdownMenu();
      const set = AppState.tabSets.find((s) => s.id === tabSetId);
      if (!set) return;

      AppState.targetWorkspaceId = tabSetId;
      DOM.renameWorkspaceNameInput.value = set.name;
      this.hideFormError(DOM.renameFormError);

      DOM.renameModalBackdrop.classList.remove("hidden");
      DOM.renameModalBackdrop.setAttribute("aria-hidden", "false");
      setTimeout(() => DOM.renameWorkspaceNameInput.focus(), 50);
    },

    closeRenameModal() {
      DOM.renameModalBackdrop.classList.add("hidden");
      DOM.renameModalBackdrop.setAttribute("aria-hidden", "true");
      this.hideFormError(DOM.renameFormError);
      AppState.targetWorkspaceId = null;
    },

    async handleRenameSubmit(e) {
      e.preventDefault();
      this.hideFormError(DOM.renameFormError);

      const targetId = AppState.targetWorkspaceId;
      const set = AppState.tabSets.find((s) => s.id === targetId);
      if (!set) {
        this.closeRenameModal();
        return;
      }

      const trimmedName = DOM.renameWorkspaceNameInput.value.trim();

      if (!trimmedName) {
        this.showFormError(DOM.renameFormError, "Workspace name cannot be empty.");
        DOM.renameWorkspaceNameInput.focus();
        return;
      }

      const isDuplicate = AppState.tabSets.some(
        (s) => s.id !== targetId && s.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (isDuplicate) {
        this.showFormError(DOM.renameFormError, "A workspace with this name already exists.");
        DOM.renameWorkspaceNameInput.focus();
        return;
      }

      DOM.btnRenameSubmit.disabled = true;

      set.name = trimmedName;
      set.updatedAt = Date.now();

      const success = await StorageManager.updateTabSet(set);
      DOM.btnRenameSubmit.disabled = false;

      if (!success) {
        this.showFormError(DOM.renameFormError, "Failed to update workspace name.");
        return;
      }

      AppState.tabSets = await StorageManager.getTabSets();
      renderWorkspaces();
      this.closeRenameModal();
      ToastController.show(`Renamed workspace to "${trimmedName}".`, "success");
    },

    // ---------------- Update Modal (FEATURE 4 — UPDATE EXISTING SET) ----------------
    openUpdateModal(tabSetId) {
      closeDropdownMenu();
      const set = AppState.tabSets.find((s) => s.id === tabSetId);
      if (!set) return;

      AppState.targetWorkspaceId = tabSetId;
      DOM.updateTargetName.textContent = set.name;

      DOM.updateModalBackdrop.classList.remove("hidden");
      DOM.updateModalBackdrop.setAttribute("aria-hidden", "false");
    },

    closeUpdateModal() {
      DOM.updateModalBackdrop.classList.add("hidden");
      DOM.updateModalBackdrop.setAttribute("aria-hidden", "true");
      AppState.targetWorkspaceId = null;
    },

    async handleUpdateConfirm() {
      const targetId = AppState.targetWorkspaceId;
      const set = AppState.tabSets.find((s) => s.id === targetId);
      if (!set) {
        this.closeUpdateModal();
        return;
      }

      DOM.btnUpdateConfirm.disabled = true;

      const activeTabs = await TabManager.getCurrentWindowTabs();

      if (!activeTabs || activeTabs.length === 0) {
        DOM.btnUpdateConfirm.disabled = false;
        ToastController.show("No saveable tabs found in current window.", "error");
        this.closeUpdateModal();
        return;
      }

      // Replace saved tabs with current window's tabs, updating timestamp while preserving name & ID
      set.tabs = activeTabs;
      set.updatedAt = Date.now();

      const success = await StorageManager.updateTabSet(set);
      DOM.btnUpdateConfirm.disabled = false;

      if (!success) {
        ToastController.show("Failed to update workspace tabs.", "error");
        return;
      }

      AppState.tabSets = await StorageManager.getTabSets();
      renderWorkspaces();
      this.closeUpdateModal();
      ToastController.show(`Updated "${set.name}" with ${activeTabs.length} tabs.`, "success");
    },

    // ---------------- Delete Modal (FEATURE 3 — DELETE) ----------------
    openDeleteModal(tabSetId) {
      closeDropdownMenu();
      const set = AppState.tabSets.find((s) => s.id === tabSetId);
      if (!set) return;

      AppState.targetWorkspaceId = tabSetId;
      DOM.deleteTargetName.textContent = set.name;

      DOM.deleteModalBackdrop.classList.remove("hidden");
      DOM.deleteModalBackdrop.setAttribute("aria-hidden", "false");
    },

    closeDeleteModal() {
      DOM.deleteModalBackdrop.classList.add("hidden");
      DOM.deleteModalBackdrop.setAttribute("aria-hidden", "true");
      AppState.targetWorkspaceId = null;
    },

    async handleDeleteConfirm() {
      const targetId = AppState.targetWorkspaceId;
      const set = AppState.tabSets.find((s) => s.id === targetId);
      if (!set) {
        this.closeDeleteModal();
        return;
      }

      DOM.btnDeleteConfirm.disabled = true;

      const success = await StorageManager.deleteTabSet(targetId);
      DOM.btnDeleteConfirm.disabled = false;

      if (!success) {
        ToastController.show("Failed to delete workspace.", "error");
        return;
      }

      AppState.tabSets = await StorageManager.getTabSets();
      renderWorkspaces();
      this.closeDeleteModal();
      ToastController.show(`Deleted workspace "${set.name}".`, "success");
    },

    // Helpers
    showFormError(element, message) {
      element.textContent = message;
      element.classList.remove("hidden");
    },

    hideFormError(element) {
      element.textContent = "";
      element.classList.add("hidden");
    }
  };

  // ==========================================================================
  // MODULE 7: Context Dropdown Menu Management (FEATURE 5 — CONTEXT MENU)
  // Supports 4 actions: Restore, Update, Rename, Delete
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
    let leftPos = btnRect.right - 160;

    if (leftPos < 10) leftPos = 10;
    if (topPos + 150 > popupRect.bottom) {
      topPos = btnRect.top - 155;
    }

    DOM.dropdownMenu.style.top = `${topPos}px`;
    DOM.dropdownMenu.style.left = `${leftPos}px`;
  }

  function closeDropdownMenu() {
    DOM.dropdownMenu.classList.add("hidden");
    AppState.activeDropdownId = null;
  }

  // Dropdown items click dispatcher
  DOM.dropdownMenu.addEventListener("click", async (e) => {
    const actionItem = e.target.closest(".dropdown-item");
    if (!actionItem) return;

    const action = actionItem.dataset.action;
    const tabSetId = AppState.activeDropdownId;
    closeDropdownMenu();

    if (!tabSetId) return;

    const set = AppState.tabSets.find((s) => s.id === tabSetId);
    if (!set) return;

    if (action === "restore") {
      RestoreManager.restoreWorkspace(set);
    } else if (action === "update") {
      ModalController.openUpdateModal(tabSetId);
    } else if (action === "rename") {
      ModalController.openRenameModal(tabSetId);
    } else if (action === "delete") {
      ModalController.openDeleteModal(tabSetId);
    }
  });

  // ==========================================================================
  // MODULE 8: Event Listeners Initialization
  // ==========================================================================
  function initEventListeners() {
    // ---------------- Save Modal Events ----------------
    DOM.btnOpenSaveModal.addEventListener("click", () => ModalController.openSaveModal());
    DOM.btnCloseSaveModal.addEventListener("click", () => ModalController.closeSaveModal());
    DOM.btnSaveCancel.addEventListener("click", () => ModalController.closeSaveModal());
    DOM.saveForm.addEventListener("submit", (e) => ModalController.handleSaveSubmit(e));
    DOM.saveWorkspaceNameInput.addEventListener("input", () => ModalController.hideFormError(DOM.saveFormError));

    DOM.saveModalBackdrop.addEventListener("click", (e) => {
      if (e.target === DOM.saveModalBackdrop) ModalController.closeSaveModal();
    });

    // ---------------- Rename Modal Events ----------------
    DOM.btnCloseRenameModal.addEventListener("click", () => ModalController.closeRenameModal());
    DOM.btnRenameCancel.addEventListener("click", () => ModalController.closeRenameModal());
    DOM.renameForm.addEventListener("submit", (e) => ModalController.handleRenameSubmit(e));
    DOM.renameWorkspaceNameInput.addEventListener("input", () => ModalController.hideFormError(DOM.renameFormError));

    DOM.renameModalBackdrop.addEventListener("click", (e) => {
      if (e.target === DOM.renameModalBackdrop) ModalController.closeRenameModal();
    });

    // ---------------- Update Modal Events ----------------
    DOM.btnCloseUpdateModal.addEventListener("click", () => ModalController.closeUpdateModal());
    DOM.btnUpdateCancel.addEventListener("click", () => ModalController.closeUpdateModal());
    DOM.btnUpdateConfirm.addEventListener("click", () => ModalController.handleUpdateConfirm());

    DOM.updateModalBackdrop.addEventListener("click", (e) => {
      if (e.target === DOM.updateModalBackdrop) ModalController.closeUpdateModal();
    });

    // ---------------- Delete Modal Events ----------------
    DOM.btnCloseDeleteModal.addEventListener("click", () => ModalController.closeDeleteModal());
    DOM.btnDeleteCancel.addEventListener("click", () => ModalController.closeDeleteModal());
    DOM.btnDeleteConfirm.addEventListener("click", () => ModalController.handleDeleteConfirm());

    DOM.deleteModalBackdrop.addEventListener("click", (e) => {
      if (e.target === DOM.deleteModalBackdrop) ModalController.closeDeleteModal();
    });

    // ---------------- Global Keyboard & Click Outside Handlers ----------------
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!DOM.saveModalBackdrop.classList.contains("hidden")) ModalController.closeSaveModal();
        if (!DOM.renameModalBackdrop.classList.contains("hidden")) ModalController.closeRenameModal();
        if (!DOM.updateModalBackdrop.classList.contains("hidden")) ModalController.closeUpdateModal();
        if (!DOM.deleteModalBackdrop.classList.contains("hidden")) ModalController.closeDeleteModal();
        if (!DOM.dropdownMenu.classList.contains("hidden")) closeDropdownMenu();
      }
    });

    document.addEventListener("click", (e) => {
      if (!DOM.dropdownMenu.classList.contains("hidden")) {
        if (!e.target.closest(".dropdown-menu") && !e.target.closest(".three-dot-btn")) {
          closeDropdownMenu();
        }
      }
    });

    // Search bar listeners
    DOM.searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value;
      if (AppState.searchQuery.length > 0) {
        DOM.btnClearSearch.classList.remove("hidden");
      } else {
        DOM.btnClearSearch.classList.add("hidden");
      }
      renderWorkspaces();
    });

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
