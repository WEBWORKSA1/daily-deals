// Background service worker — handles extension lifecycle

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.tabs.create({ url: 'https://daily.deals?utm_source=extension&utm_campaign=install' })
  }
})

// Open popup on icon click handled by manifest's action.default_popup
