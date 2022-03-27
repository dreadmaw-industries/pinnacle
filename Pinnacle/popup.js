const commentButton = document.getElementById('addCommentButton');
const viewButton = document.getElementById('viewCommentsButton');
const commentText = document.getElementById('commentText');
const clearButton = document.getElementById('clearComments');

const tabPromise = chrome.tabs.query({ active: true, currentWindow: true });
async function insertCustomCSS() {
    let [tab] = await tabPromise;
    chrome.scripting.insertCSS({
        target : {tabId : tab.id},
        files : ['pinnacle.css'],
    });
    chrome.storage.sync.get(['enableHover'], (result) => {
        if (result.enableHover) {
            chrome.scripting.insertCSS({
                target : {tabId : tab.id},
                files : ['pinnacle_hover.css'],
            });
        }
    });
}

insertCustomCSS();

chrome.storage.sync.get(['autoLoad'], (result) => {
    if (result.autoLoad) {
        loadComments();
    }
});

commentButton.addEventListener('click', async () => {  
    let [tab] = await tabPromise;
    chrome.storage.sync.set({
        'comment' : commentText.value.trimEnd()
    });
	chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files : ['functions.js'],
    });
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files : ['createcomments.js'],
    });
});

clearComments.addEventListener('click', async () => {  
    let [tab] = await tabPromise;
	chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: clearCommentsFunction,
    });
});

function clearCommentsFunction() {
    delete localStorage['comments'];
}

viewButton.addEventListener('click', loadComments); 

async function loadComments() {
    let [tab] = await tabPromise;
	chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files : ['functions.js'],
    });
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files : ['getcomments.js'],
    });
}