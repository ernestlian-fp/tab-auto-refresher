document.addEventListener('DOMContentLoaded', () => {
    // Query the active tab when the popup is opened
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;

        chrome.storage.local.get([tabId.toString()], (result) => {
            if (result && result[tabId]) {
                document.getElementById('interval').value = result[tabId].interval;
            }
        });

        // Send a message to the background script to get the interval for the current tab
        chrome.runtime.sendMessage({ action: "getInterval", tabId: tabId }, (response) => {
            if (response && response.interval) {
                // Convert the interval from milliseconds to seconds and display it
                document.getElementById('current-interval').innerText = `Current interval: ${response.interval / 1000}s`;
            } else {
                document.getElementById('current-interval').innerText = 'Current interval: 0s';
            }
        });
    });

    // Event listener for the start button
    document.getElementById('start').addEventListener('click', () => {
        const interval = parseInt(document.getElementById('interval').value) * 1000;
        if (isNaN(interval) || interval < 1000) {
            alert('Please enter a valid number of seconds.');
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0].id;
            chrome.runtime.sendMessage({ action: "start", interval: interval, tabId: tabId }, () => {
                document.getElementById('current-interval').innerText = `Current interval: ${interval / 1000} s`;
            });
            chrome.storage.local.set({
                [tabId.toString()]: {
                    interval: interval / 1000
                }
            });
        });
    });

    // Event listener for the stop button
    document.getElementById('stop').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0].id;
            chrome.runtime.sendMessage({ action: "stop", tabId: tabId }, () => {
                document.getElementById('current-interval').innerText = 'Current interval: 0s';
            });
        });
    });
});
