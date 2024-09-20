document.getElementById('start').addEventListener('click', () => {
    const interval = parseInt(document.getElementById('interval').value) * 1000;
    if (isNaN(interval) || interval < 1000) {
        alert('Please enter a valid number of seconds.');
        return;
    }

    // Query the active tab and send a message to the background script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.runtime.sendMessage({ action: "start", interval: interval, tabId: tabId });
    });
});

document.getElementById('stop').addEventListener('click', () => {
    // Query the active tab and send a message to the background script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.runtime.sendMessage({ action: "stop", tabId: tabId });
    });
});
