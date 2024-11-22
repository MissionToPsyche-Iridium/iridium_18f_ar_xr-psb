
const btnToggle = document.getElementById("btnToggle");
const hamburgerIcon = document.getElementById("hamburgerIcon");
const closeIcon = document.getElementById("closeIcon");
const navigationMenu = document.querySelector(".navigation__menu");

const collapse = new bootstrap.Collapse(navigationMenu, {
    toggle: false // Don't toggle on page load
});

export function initNavigationMenu() {

    btnToggle.addEventListener("click", () => {
        //navigationMenu.classList.toggle("active");
        collapse.toggle(); 
        hamburgerIcon.classList.toggle("hidden");
        closeIcon.classList.toggle("hidden");
    });
}

export function toggleMenu() {
    collapse.toggle();
    hamburgerIcon.classList.toggle("hidden");
    closeIcon.classList.toggle("hidden");
}
