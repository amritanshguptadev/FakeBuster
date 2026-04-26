// FakeBuster Extension — Background Service Worker
// Creates the right-click context menu

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'fakebuster-check',
    title: '🔍 Check with FakeBuster',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'fakebuster-check') {
    const selectedText = info.selectionText?.trim();
    if (!selectedText) return;

    // Store text and open popup
    chrome.storage.session.set({ pendingClaim: selectedText }, () => {
      chrome.action.openPopup();
    });
  }
});
