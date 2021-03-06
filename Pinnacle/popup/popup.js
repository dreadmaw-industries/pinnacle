const commentButton = document.getElementById('addCommentButton');
const viewButton = document.getElementById('viewCommentsButton');
const commentText = document.getElementById('commentText');
const clearButton = document.getElementById('clearComments');

const tabPromise = chrome.tabs.query({ active: true, currentWindow: true });


commentButton.addEventListener('click', async () => {
    let [tab] = await tabPromise;
    chrome.storage.local.set({
        'comment': commentText.value.trimEnd()
    });
    console.log("set the comments")
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/comments/createCommentHelpers.js'],
    });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/comments/createComment.js'],
    });
});

clearComments.addEventListener('click', async () => {
    let [tab] = await tabPromise;
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: clearCommentsFunction,
    });
    chrome.storage.local.set({'saved_comments' : JSON.stringify({})});
});

function clearCommentsFunction() {
    delete localStorage['comments'];
}

viewButton.addEventListener('click', loadComments);

async function loadComments() {
    let [tab] = await tabPromise;
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/comments/loadHelper.js'],
    });
}