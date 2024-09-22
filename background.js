let refreshIntervals = {}; // Object to store intervals for multiple tabs
let countdownTimers = {};   // Object to store the countdown values for each tab
let storedIntervals = {};   // Object to store the intervals (in milliseconds) for each tab
const options = {
    day: '2-digit', // e.g., "21"
    month: '2-digit', // e.g., "09"
    year: 'numeric', // e.g., "2024"
    hour: '2-digit', // e.g., "02"
    minute: '2-digit', // e.g., "29"
    second: '2-digit', // e.g., "38"
  };

function updateBadge(tabId, secondsLeft) {
    // Update the badge text to show the countdown (seconds left until refresh)
    if (secondsLeft !== null) {
        chrome.action.setBadgeText({ text: secondsLeft.toString(), tabId: tabId });
    } else {
        chrome.action.setBadgeText({ text: null, tabId: tabId });
    }
}  

function startCountdown(tabId, interval) {
    let secondsLeft = interval / 1000;  // Convert milliseconds to seconds

    // Clear any existing countdown for this tab
    clearInterval(countdownTimers[tabId]);

    // Create a new countdown timer
    countdownTimers[tabId] = setInterval(() => {
        // Decrement the countdown
        secondsLeft--;

        // Update the badge text with the remaining seconds
        updateBadge(tabId, secondsLeft);

        // When the countdown reaches 0, reset the countdown
        if (secondsLeft <= 0) {
            var date = new Date(Date.now());
            console.log(`${date.toLocaleString('en-US', options)}: Resetting timer for tab with ID: ${tabId}`);
            secondsLeft = interval / 1000;
        }
    }, 1000);  // Update every second
}

function stopCountdown(tabId) {
    updateBadge(tabId, null);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "start") {
        const interval = message.interval;
        const tabId = message.tabId;

        // Check if the tab is already being refreshed, clear the existing interval if so
        if (refreshIntervals[tabId]) {
            clearInterval(refreshIntervals[tabId]);
            clearInterval(countdownTimers[tabId]);
            var date = new Date(Date.now());
            console.log(`${date.toLocaleString('en-US', options)}: Cleared existing refresh interval for tab ID: ${tabId}`);
        }

        // Log the tab ID and URL of the tab that will be refreshed
        chrome.tabs.get(tabId, (tab) => {
            if (chrome.runtime.lastError) {
                console.error("Error retrieving tab information: ", chrome.runtime.lastError);
                return;
            }

            var date = new Date(Date.now());
            console.log(`${date.toLocaleString('en-US', options)}: Started auto-refresh on tab every ${interval/1000} seconds with ID: ${tabId} URL: ${tab.url}`);

            // Start refreshing the tab at the specified interval
            refreshIntervals[tabId] = setInterval(() => {
                var date = new Date(Date.now());
                console.log(`${date.toLocaleString('en-US', options)}: Refreshing tab with ID: ${tabId} (URL: ${tab.url})`);
                chrome.tabs.reload(tabId, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Error reloading tab: ", chrome.runtime.lastError);
                    }
                });
            }, interval);

            startCountdown(tabId, interval);

            storedIntervals[tabId] = interval;

            date = new Date(Date.now());
            console.log(`${date.toLocaleString('en-US', options)}: no. of tabs being refreshed: ${Object.keys(refreshIntervals).length}`);
        });

    } else if (message.action === "stop") {
        const tabId = message.tabId;

        // Stop refreshing the specified tab
        if (refreshIntervals[tabId]) {
            stopRefresh(tabId);
            stopCountdown(tabId);
        } else {
            console.log(`No active refresh found for tab with ID: ${tabId}`);
        }
    } else if (message.action === "getInterval") {
        const tabId = message.tabId;
        if (refreshIntervals[tabId]) {
            sendResponse({ interval: storedIntervals[tabId] });
        } else {
            sendResponse({ interval: null });
        }
        return true;
    }

    return false;
});

chrome.tabs.onRemoved.addListener(function (tabId) {
    if (refreshIntervals[tabId]) {
        stopRefresh(tabId);
    }
})

function stopRefresh(tabID) {
    clearInterval(refreshIntervals[tabID]);
    clearInterval(countdownTimers[tabID]);
    delete refreshIntervals[tabID];
    delete countdownTimers[tabID];
    delete storedIntervals[tabID];
    var date = new Date(Date.now());
    console.log(`${date.toLocaleString('en-US', options)}: Stopped auto-refresh for tab with ID: ${tabID}`);
    console.log(`${date.toLocaleString('en-US', options)}: no. of tabs still being refreshed: ${Object.keys(refreshIntervals).length}`);
    console.log(`${date.toLocaleString('en-US', options)}: no. of timers: ${Object.keys(countdownTimers).length}`);    
}
