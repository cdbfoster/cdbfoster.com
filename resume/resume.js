// Determines if the big names at the top of the page are hidden by the header
function namesHidden() {
    let lastName = document.querySelector("#names li:last-of-type");
    let header = document.getElementsByTagName("header")[0];

    return document.documentElement.scrollTop + header.offsetHeight >= lastName.offsetTop + lastName.offsetHeight;
}

function navFadeOut(nextStep) {
    let nav = document.querySelector("nav ul");
    nav.classList.add("fade-out");
    nav.addEventListener("animationend", nextStep);
}

function navAddNames(event) {
    let nav = document.querySelector("nav ul");
    // event will be null if this method was called manually (if we don't want transitions)
    if (event) {
        nav.classList.remove("fade-out");
        nav.removeEventListener("animationend", navAddNames);
    }

    let names = document.getElementById("names");
    namesSmall = names.cloneNode(true);
    namesSmall.id = "names-small";

    let li = document.createElement("li");
    let a = document.createElement("a");
    a.href = "#";
    a.appendChild(namesSmall);
    li.appendChild(a);
    nav.insertBefore(li, nav.childNodes[0]);

    if (event) {
        let header = document.getElementsByTagName("header")[0];
        header.classList.add("expanded");
        nav.classList.add("fade-in");
        nav.addEventListener("animationend", navCleanup);
    }
}

function navRemoveNames() {
    let nav = document.querySelector("nav ul");
    nav.classList.remove("fade-out");
    nav.removeEventListener("animationend", navRemoveNames);

    nav.removeChild(nav.childNodes[0]);

    nav.classList.add("fade-in");
    nav.addEventListener("animationend", navCleanup);
}

function navCleanup() {
    let nav = document.querySelector("nav ul");
    nav.classList.remove("fade-in");
    nav.removeEventListener("animationend", navCleanup);
}

function navHandleNames() {
    // If this is the first scroll event and we haven't waited on the page for 100ms,
    if (typeof(run) === "undefined") {
        run = true;
        // Add the names to the header without transition if they should be visible
        if (namesHidden()) {
            let header = document.getElementsByTagName("header")[0];
            header.style.transition = "none";
            header.classList.add("expanded");
            header.style.height = header.offsetHeight + "px";
            header.style.transition = "";
            navAddNames();
        }
        return;
    }

    let header = document.getElementsByTagName("header")[0];
    header.style.height = "";

    let namesSmall = document.querySelector("#names-small");

    if (namesHidden()) {
        if (namesSmall) {
            return; // We've already added the names to the header
        }

        // The big names are not visible, and we haven't added them to the header,
        // so add them.
        navFadeOut(navAddNames);
    } else if (namesSmall) {
        // The big names are visible, and we've added the names to the header,
        // so remove them from the header.
        let header = document.getElementsByTagName("header")[0];
        header.classList.remove("expanded");
        navFadeOut(navRemoveNames);
    }
}

// If we reload the page at a scrolled position, the scroll event will fire immediately and we
// want to add the names to the header without a transition (in navHandleNames()).
// If we've waited on the page for a bit (100 ms), treat all new scroll events normally and trigger
// transitions where appropriate.
window.addEventListener("load", function () { window.setTimeout(function () { run = true; }, 100) });
window.addEventListener("scroll", navHandleNames);
