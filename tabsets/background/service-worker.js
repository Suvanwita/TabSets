/**
 * TabSets - Service Worker (Background Script)
 * Manifest V3 Extension Service Worker
 */

// Initial seed mock tab sets format using the standard tabsets storage schema
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

// Initialize default storage on extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log(`[TabSets] Service Worker initialized: ${details.reason}`);

  chrome.storage.local.get(["tabsets"], (result) => {
    if (!result.tabsets || !Array.isArray(result.tabsets)) {
      chrome.storage.local.set({ tabsets: INITIAL_MOCK_TABSETS }, () => {
        console.log("[TabSets] Seeded initial mock workspaces in chrome.storage.local under key 'tabsets'.");
      });
    }
  });
});

// Listener for runtime messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PING") {
    sendResponse({ status: "OK", timestamp: Date.now() });
    return true;
  }

  if (request.action === "GET_CURRENT_WINDOW_TABS") {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      sendResponse({ tabs: tabs || [] });
    });
    return true; // Asynchronous channel open
  }
});
