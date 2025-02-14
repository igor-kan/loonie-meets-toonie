import './offline-handler';
import './settings-handler';
import './sync-handler';

document.addEventListener('DOMContentLoaded', () => {
    const scanButton = document.getElementById('scanPage');
    const shoppingListsButton = document.getElementById('shoppingLists');
    const bestSellersButton = document.getElementById('bestSellers');

    scanButton?.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'SCAN_PAGE' });
            }
        });
    });

    shoppingListsButton?.addEventListener('click', () => {
        console.log('Shopping Lists clicked');
    });

    bestSellersButton?.addEventListener('click', () => {
        console.log('Best Sellers clicked');
    });
});

export {}; 