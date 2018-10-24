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
  console.log("blah");
  let namesSmall = document.querySelector("#names-small");

  if (typeof(run) === "undefined") {
    run = true;
    if (namesHidden()) {
      navAddNames();
    }
    return;
  }

  if (namesHidden()) {
    if (namesSmall) {
      return;
    }

    navFadeOut(navAddNames);
  } else if (namesSmall) {
    navFadeOut(navRemoveNames);
  }
}

window.addEventListener("load", function () { window.setTimeout(function () { run = true; }, 100) });
window.addEventListener("scroll", navHandleNames);
