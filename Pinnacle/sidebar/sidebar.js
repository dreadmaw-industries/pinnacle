function gen_static_elems() { //one day this will take user data as an argument, probably
    let staticDiv = document.createElement("div");
    staticDiv.classList.add("pinnacle-static-sidenav");

    let newButton = document.createElement("button");
    newButton.textContent = "close";
    newButton.id = 'exit-sidebar';
    newButton.classList.add("pinnacle-button");
    newButton.addEventListener("click", empty_sidebar);
    staticDiv.appendChild(newButton);

    return staticDiv
}
function construct_sidebar() {
    /*make the sidebar to load comments */
    const newDiv = document.createElement("div");
    newDiv.classList.add("pinnacle-sidenav");
    newDiv.id = "pinnacle-sidebar";

    newDiv.appendChild(gen_static_elems());

    let changingDiv = document.createElement("div")
    changingDiv.id = "pinnacle-changing";
    changingDiv.classList.add("pinnacle-changing-sidenav");
    newDiv.appendChild(changingDiv);

    document.body.parentElement.insertBefore(newDiv, document.body);
}
function expand_sidebar() {
    document.getElementById("pinnacle-sidebar").style.width = "30%";
}
function collapse_sidebar() {
    document.getElementById("pinnacle-sidebar").style.width = "0%";
}
function empty_changing() {
    document.getElementById("pinnacle-changing").innerHTML = "";
}
function empty_sidebar() {
    collapse_sidebar();
    empty_changing();
}
function fill_sidebar() {
    //returns the contents of pinnacle changing
}

/* sidebar
ALWAYS THERE:
navigation (exit button for now)

*/

/*
1) clear the comments (done!)
2) load all the comments from the anchor
*/
function gen_comment_elem(comment) {
    const li = document.createElement("li");
    li.classList.add("pinnacle-comment");
    li.textContent = comment[2];
    return li;
}
function display_anchor(commentsArray) {
    empty_changing();
    const sidebar = document.getElementById("pinnacle-changing");
    const list = document.createElement("ul");
    list.classList.add("pinnacle-sidebar-list");
    //markup here??
    for (index in commentsArray) {
        let comment = commentsArray[index];
        list.appendChild(gen_comment_elem(comment));
    }
    sidebar.appendChild(list);
    expand_sidebar();
    /* after clicking the highlighted anchor point, display all the comments in the sidebar */
    /*for each comment, generate an element with id pinnacle comment */
}