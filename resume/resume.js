// Keeps track of which elements have which animation callbacks set
var animationSteps = {};

// Each element will be assigned a unique ID that we can use to keep track of current animation steps
(function () {
    var nextID = 1;

    if (Document.prototype.hasOwnProperty('uniqueID')) {
        return;
    }

    // Define a property on the document that will generate a unique ID each time it is called
    Object.defineProperty(Document.prototype, 'uniqueID', {
        get: function () {
            return nextID++;
        },
        enumerable: false,
        configurable: false
    });

    // Define a property on the element that will return a unique ID the first time it is called
    Object.defineProperty(Element.prototype, 'uniqueID', {
        get: function () {
            // Redefine the property so that the generator will not be called again
            Object.defineProperty(this, 'uniqueID', {
                value: document.uniqueID,
                writable: false,
                enumerable: false,
                configurable: false
            });

            return this.uniqueID;
        },
        enumerable: false,
        configurable: true
    });
}());

// A callback that runs when an element completes its animation
function animationStep(element, animationNumber, step) {
    element.removeEventListener("animationend", this[animationNumber]);
    delete this[animationNumber];

    if (step) {
        step();
    }
}

// Queue a callback to run after animation on the element completes
function nextAnimationStep(element, step) {
    let animationNumber = 1;
    if (animationSteps[element.uniqueID]) {
        animationNumber = Object.keys(animationSteps[element.uniqueID]).length + 1;
    } else {
        // Create the dictionary for this element if it's the first time it's been animated
        animationSteps[element.uniqueID] = {};
    }

    let nextStep = animationStep.bind(animationSteps[element.uniqueID], element, animationNumber, step);
    animationSteps[element.uniqueID][animationNumber] = nextStep;
    element.addEventListener("animationend", nextStep);
}

// Fade out, run step, fade in
function contentsFadeTransition(element, step) {
    element.classList.add("fade-out");
    nextAnimationStep(element, function () {
        element.classList.remove("fade-out");

        if (step) {
            step();
        }

        element.classList.add("fade-in");
        nextAnimationStep(element, function () {
            element.classList.remove("fade-in");
        });
    });
}

// Fade in, run step
function fadeIn(element, step) {
    element.classList.add("fade-in");
    nextAnimationStep(element, function () {
        element.classList.remove("fade-in");

        if (step) {
            step();
        }
    });
}

// Determines if the big names at the top of the page are hidden by the header
function namesHidden() {
    let lastName = document.querySelector("#names li:last-of-type");
    let header = document.getElementsByTagName("header")[0];

    return document.documentElement.scrollTop + header.offsetHeight >= lastName.offsetTop + lastName.offsetHeight;
}

function addNamesToNav() {
    if (document.querySelector("#names-small")) {
        return;
    }

    let nav = document.querySelector("nav ul");

    let names = document.getElementById("names");
    namesSmall = names.cloneNode(true);
    namesSmall.id = "names-small";
    namesSmall.style.display = "flex";

    let li = document.createElement("li");
    let a = document.createElement("a");
    a.href = "#";
    a.appendChild(namesSmall);
    li.appendChild(a);
    nav.insertBefore(li, nav.childNodes[0]);
}

function removeNamesFromNav() {
    if (document.querySelector("#names-small")) {
        let nav = document.querySelector("nav > ul");
        nav.removeChild(nav.childNodes[0]);
    }
}

function expandHeader() {
    let header = document.getElementsByTagName("header")[0];
    header.classList.add("expanded");
    addNamesToNav();
}

function unexpandHeader() {
    removeNamesFromNav();
    let header = document.getElementsByTagName("header")[0];
    header.classList.remove("expanded");
}

function handleHeaderExpansion() {
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
            addNamesToNav();
        }
        return;
    }

    // Necessary to clear the fixed height that gets set upon a page reload to expand the header without transitions.
    let header = document.getElementsByTagName("header")[0];
    header.style.height = "";

    let expanded = document.querySelector(".expanded");
    let transitionInitiated = document.querySelector("nav ul.fade-out");

    if (namesHidden()) {
        if (expanded || transitionInitiated) {
            return; // We've already added the names to the header or begun to do so
        }

        // The big names are not visible, and we haven't added them to the header,
        // so add them.
        contentsFadeTransition(document.querySelector("nav ul"), expandHeader);
    } else if (expanded && !transitionInitiated) {
        // The big names are visible, and we've added the names to the header,
        // so remove them from the header.
        contentsFadeTransition(document.querySelector("nav ul"), unexpandHeader);
    }
}

// If we reload the page at a scrolled position, the scroll event will fire immediately and we
// want to add the names to the nav without a transition (in handleHeaderExpansion).
// If we've waited on the page for a bit (100 ms), treat all new scroll events normally and trigger
// transitions where appropriate.
window.addEventListener("load", function () { window.setTimeout(function () { run = true; }, 100) });
window.addEventListener("scroll", handleHeaderExpansion);

window.addEventListener("load", function () {
    if (window.matchMedia("(max-width: 870px)").matches) {
        handleHeaderExpansion();
        let header = document.getElementsByTagName("header")[0];
        header.style.height = "";
    }
});

var navOpen = false;

function openNav() {
    let header = document.getElementsByTagName("header")[0];

    // Necessary to clear the fixed height that gets set upon a page reload to expand the header without transitions.
    header.style.height = "";

    header.classList.add("nav-open");
    navOpen = true;
    addNamesToNav();

    if (!document.querySelector(".expanded #names-small")) {
        fadeIn(document.querySelector("#names-small"));
    }

    for (let element of document.querySelectorAll("nav > ul > :not(:first-child)")) {
        fadeIn(element);
    }

    fadeIn(document.querySelector("#external-links"));
}

function closeNav() {
    let header = document.getElementsByTagName("header")[0];
    header.classList.remove("nav-open");
    navOpen = false;
    // Wait a little bit and then recheck whether or not we should expand the header
    window.setTimeout(function () { handleHeaderExpansion() }, 200);
}

// Close the nav if we scroll anywhere
window.addEventListener("scroll", function () {
    if (navOpen) {
        closeNav();
    }
});

// Detect a click on the hamburger menu inside the header
document.querySelector("header").addEventListener("click", function (event) {
    // The header hamburger menu is only available on small screens
    if (!window.matchMedia("(max-width: 870px)").matches) {
        return;
    }

    let nav = document.querySelector("nav");
    if (!navOpen && event.offsetX > nav.offsetLeft + nav.offsetWidth) {
        openNav();
    } else if (navOpen) {
        closeNav();
    }
});

for (let element of document.querySelectorAll("#technologies h3")) {
    element.addEventListener("click", function (event) {
        if (!window.matchMedia("(max-width: 870px)").matches) {
            return;
        }

        if (event.offsetX >= element.offsetLeft + element.offsetWidth - 100 && event.offsetX <= element.offsetLeft + element.offsetWidth) {
            if (!element.parentNode.classList.contains("show-desire")) {
                element.parentNode.classList.add("show-desire");
            } else {
                element.parentNode.classList.remove("show-desire");
            }
        }
    });
}
