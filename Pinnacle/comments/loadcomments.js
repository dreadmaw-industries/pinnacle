function allText(node) {
    output = [];
    if (node.nodeType === Node.TEXT_NODE) {
        return [node];
    }
    for (let i = 0; i < node.childNodes.length; i++) {
        output = output.concat(Array.from(allText(node.childNodes[i])));
    }
    return output;
}
function findRange(contextText, selectedText, occurenceIndex) {
    function nthIndex(str, pat, n) {
        // off stack overflow because I can't anymore
        // https://stackoverflow.com/questions/14480345/how-to-get-the-nth-occurrence-in-a-string
        var L= str.length, i= -1;
        while(n-- && i++<L){
            i= str.indexOf(pat, i);
            if (i < 0) break;
        }
        return i;
    }
    function smaller(curScope, contextText) {
        for (let i = 0; i < curScope.childNodes.length; i++) {
            if (numMatches(curScope.childNodes[i].textContent, contextText) == 1) {
                return curScope.childNodes[i];
            }
        }
        return false;
    }
    function collapseText(range, start, end, curTextNodes) {
        newText = [];
        console.log("start", start)
        console.log("end", end)
        console.log(curTextNodes)

        for (let i = 0; i < curTextNodes.length; i++) {
            itemLength = curTextNodes[i].textContent.length
            if (start - itemLength < 0) {
                end += start
                for (let j = i; j < curTextNodes.length; j++) {
                    itemLength = curTextNodes[j].textContent.length
                    newText.push(curTextNodes[j]);
                    if (end - itemLength < 0) {
                        break
                    }
                    end -= itemLength;
                }
                break
            }
            start -= itemLength;
        }
        
        console.log("start", start)
        console.log("end", end)
        console.log(newText)

        range.setStart(newText[0], start);
        range.setEnd(newText[newText.length - 1], end)
        return [start, newText];
    }
    

    curScope = document.body;

    if (numMatches(curScope.textContent, contextText) != 1) {
        return false;
    }
    
    while (smaller(curScope, contextText) != false) {
        curScope = smaller(curScope, contextText);
    }

    curTextNodes = allText(curScope);
    console.log(curTextNodes)
    newText = [];

    range = new Range();
    range.setStart(curTextNodes[0], 0);
    range.setEnd(curTextNodes[curTextNodes.length - 1], autoLength(curTextNodes[curTextNodes.length - 1]))


    aaaa = collapseText(range, range.toString().indexOf(contextText), contextText.length, curTextNodes);

    // I have no idea why this is the workaround I have to employ. Why can't I destructure in peace?
    offset = aaaa[0];
    curTextNodes = aaaa[1]
    // occurenceIndex is 0-indexed
    // newOffset needs to account for the position of 
    newOffset = offset + nthIndex(range.toString(), selectedText, occurenceIndex + 1);
    collapseText(range, newOffset, selectedText.length, curTextNodes);


    return range;
}

function fillRange(range, onClick) {
    function fillNode(node, startOffset, endOffset, onClick) {
        if (node.textContent !== "") {
            let highlight = document.createElement('mark');
            highlight.classList.add('pinnacle-anchor-highlight');
            temp = new Range()
            temp.setStart(node, startOffset);
            temp.setEnd(node, endOffset);
            temp.surroundContents(highlight);
        }
    }
    function fillAllNodesBelow(node, onClick) {
        textNodes = allText(node)
        for (let i = 0; i < textNodes.length; i++) {
            fillNode(textNodes[i], 0, autoLength(textNodes[i]), onClick);
            // onclick stuff happens here
        }
    }
    start = range.startContainer;
    end = range.endContainer;
    
    if (start.isSameNode(end)) {
        fillNode(start, range.startOffset, range.endOffset, onClick);
        return;
    }

    fillNode(start, range.startOffset, autoLength(start), onClick);
    fillNode(end, 0, range.endOffset, onClick);

    start = range.startContainer;
    end = range.endContainer;
    while (!(start.isSameNode(range.commonAncestorContainer))) {
        start = range.startContainer;
        if (start.nextSibling === null) {
            range.setStartAfter(start.parentNode);
        }
        else {
            range.setStartAfter(start.nextSibling);
        }
        // fillAllNodesBelow(range.startContainer, onClick);
        start = range.startContainer;
    }
    while (!(end.isSameNode(range.commonAncestorContainer))) {
        end = range.endContainer;
        if (end.previousSibling === null) {
            range.setEndBefore(end.parentNode);
        }
        else {
            range.setEndBefore(end.previousSibling);
        }
        // fillAllNodesBelow(range.endContainer, onClick);
        end = range.endContainer;
    }
}
function establish_anchor(key, comments) {
    templateComment = comments[0]
    for (let i = 0; i < comments.length; i++) {
        range = findRange(key, comments[i]["selectedText"], comments[i]["occurenceIndex"]);
        fillRange(range, null);
    }
}

async function insert_comments() {
    console.log("is this running?");
    if ('pinnacle__loadedCommentsYet' in localStorage) {
        return;
    } else {
        localStorage['pinnacle__loadedCommentsYet'] = true;
    }
    let pagelocation = window.location.toString().substring(window.location.toString().indexOf('//') + 2);
    let request = {
        cache: 'no-cache',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({  
            pageurl : pagelocation, 
        }),
    };
    let response = await fetch("https://pinnacle.grixisutils.site/get.php", request);
    response.json().then(data => {
        let comments = {};
		//console.log(data);
        for (let i = 0; i < data.length; i++) {
            if (data[i]['pageurl'] == window.location.toString().substring(window.location.toString().indexOf('//') + 2)) {
				let c = {
					"anchorDomPath" : data[i]['divpath'],
					"anchorFocusText" : data[i]['focus_text'],
					"anchorText" : data[i]['commented_text'],
					"anchorOffsets" : [parseInt(data[i]['base_offset']), parseInt(data[i]['extent_offset'])],
					"commentText" : data[i]['comment_content'],
					"timestamp" : parseInt(data[i]['timestamp']),
                    "name" : data[i]['name'],
				};
				if (c["anchorDomPath"] in comments) {
					comments[c["anchorDomPath"]].push(c);
				} else {
					comments[c["anchorDomPath"]] = [c];
				}
			}
        };
        console.log("Server Comments Array: ", comments);
        
        chrome.storage.local.get(['saved_comments'], (result) => {
            //console.log(result);
            //console.log(result['saved_comments']);
            console.log("hiiii")
            if (result['saved_comments'] != undefined) {
                let chromeComments = result['saved_comments'];
                for (let i = 0; i < chromeComments.length; i++) {
                    if (chromeComments[i][0] != pagelocation) {
                        continue;
                    }
                    if (!(chromeComments[i][1] in comments)) {
                        comments[chromeComments[i][1]] = new Array();
                    }
                    console.log(chromeComments[i]);
                    comments[chromeComments[i][1]].push(chromeComments[i][2]);
                }
            }

            console.log(result.saved_comments);
            Object.entries(JSON.parse(result.saved_comments)[pagelocation]).forEach((x) => {
				console.log(x);
                let [key, commentsArray] = x;
                establish_anchor(key, commentsArray);
            });
        });
        /*if (comments != null) { comments = JSON.parse(comments)[pagelocation]; }
        if (comments == null) { comments = {}; }*/
    });
}

/*
anchor is a divpath /w text
dict = {anchor => comments}
for each path
add event listener to path /w display_anchor (comments)

*/

localStorage.removeItem('pinnacle__loadedCommentsYet');
chrome.storage.sync.get(['autoLoad'], (result) => {
    if (result.autoLoad) {
        insert_comments();
    }
});