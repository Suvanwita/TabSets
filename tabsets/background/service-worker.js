/**
 * TabSets - Service Worker (Background Script)
 * Manifest V3 Extension Service Worker
 */

// Default mock tab sets initialized on first install
const INITIAL_MOCK_TABSETS = [
  {
    id: "ts-cybersecurity-01",
    name: "Cybersecurity Project",
    tabCount: 12,
    updatedAt: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    color: "#6366f1", // Indigo
    tabs: [
      { id: 101, title: "OWASP Top 10 Web Application Security Risks", url: "https://owasp.org/www-project-top-ten/" },
      { id: 102, title: "Burp Suite Suite Documentation", url: "https://portswigger.net/burp/documentation" },
      { id: 103, title: "NVD - Search Vulnerability Database", url: "https://nvd.nist.gov/" },
      { id: 104, title: "GitHub - Network Security Tools", url: "https://github.com/topics/network-security" }
    ]
  },
  {
    id: "ts-dsa-02",
    name: "DSA Preparation",
    tabCount: 8,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    color: "#10b981", // Emerald
    tabs: [
      { id: 201, title: "LeetCode Top Interview Questions", url: "https://leetcode.com/problemset/all/" },
      { id: 202, title: "NeetCode 150 Roadmap", url: "https://neetcode.io/roadmap" },
      { id: 203, title: "Visualizing Algorithms - VisuAlgo", url: "https://visualgo.net/en" }
    ]
  },
  {
    id: "ts-research-03",
    name: "Research Paper",
    tabCount: 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    color: "#ec4899", // Pink
    tabs: [
      { id: 301, title: "arXiv: Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762" },
      { id: 302, title: "Google Scholar Search", url: "https://scholar.google.com" },
      { id: 303, title: "Papers with Code - AI Benchmarks", url: "https://paperswithcode.com/" }
    ]
  },
  {
    id: "ts-placement-04",
    name: "Placement Preparation",
    tabCount: 14,
    updatedAt: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    color: "#f59e0b", // Amber
    tabs: [
      { id: 401, title: "System Design Primer - GitHub", url: "https://github.com/donnemartin/system-design-primer" },
      { id: 402, title: "GeeksforGeeks Interview Corner", url: "https://geeksforgeeks.org/" },
      { id: 403, title: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/" }
    ]
  }
];

// Initialize default storage on installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log(`[TabSets] Extension installed/updated: ${details.reason}`);

  chrome.storage.local.get(["tabSets"], (result) => {
    if (!result.tabSets || !Array.isArray(result.tabSets)) {
      chrome.storage.local.set({ tabSets: INITIAL_MOCK_TABSETS }, () => {
        console.log("[TabSets] Initialized mock workspaces in chrome.storage.local.");
      });
    }
  });
});

// Listener for runtime messages from popup or options scripts (Phase 2 extension interface)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PING") {
    sendResponse({ status: "OK", timestamp: Date.now() });
    return true;
  }

  // Handle active window tab query helper for future phases
  if (request.action === "GET_CURRENT_WINDOW_TABS") {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      sendResponse({ tabs: tabs });
    });
    return true; // Keep channel open for async response
  }
});
