let refreshIntervals = {}; // Object to store intervals for multiple tabs
const options = {
    day: '2-digit', // e.g., "21"
    month: '2-digit', // e.g., "09"
    year: 'numeric', // e.g., "2024"
    hour: '2-digit', // e.g., "02"
    minute: '2-digit', // e.g., "29"
    second: '2-digit', // e.g., "38"
  };

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "start") {
        const interval = message.interval;
        const tabId = message.tabId;

        // Check if the tab is already being refreshed, clear the existing interval if so
        if (refreshIntervals[tabId]) {
            clearInterval(refreshIntervals[tabId]);
            var date = new Date(Date.now())
            console.log(`${date.toLocaleString('en-US', options)}: Cleared existing refresh interval for tab ID: ${tabId}`);
        }

        // Log the tab ID and URL of the tab that will be refreshed
        chrome.tabs.get(tabId, (tab) => {
            if (chrome.runtime.lastError) {
                console.error("Error retrieving tab information: ", chrome.runtime.lastError);
                return;
            }

            var date = new Date(Date.now())
            console.log(`${date.toLocaleString('en-US', options)}: Started auto-refresh on tab every ${interval/1000} seconds with ID: ${tabId} URL: ${tab.url}`);

            // Start refreshing the tab at the specified interval
            refreshIntervals[tabId] = setInterval(() => {
                var date = new Date(Date.now())
                console.log(`${date.toLocaleString('en-US', options)}: Refreshing tab with ID: ${tabId} (URL: ${tab.url})`);
                chrome.tabs.reload(tabId, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Error reloading tab: ", chrome.runtime.lastError);
                    }
                });
            }, interval);
        });

    } else if (message.action === "stop") {
        const tabId = message.tabId;

        // Stop refreshing the specified tab
        if (refreshIntervals[tabId]) {
            clearInterval(refreshIntervals[tabId]);
            delete refreshIntervals[tabId];
            var date = new Date(Date.now())
            console.log(`${date.toLocaleString('en-US', options)}: Stopped auto-refresh for tab with ID: ${tabId}`);
        } else {
            console.log(`No active refresh found for tab with ID: ${tabId}`);
        }
    }
});
