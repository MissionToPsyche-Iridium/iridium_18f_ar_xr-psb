// menu_script.js

const btnToggle = document.getElementById("btnToggle");
const hamburgerIcon = document.getElementById("hamburgerIcon");
const closeIcon = document.getElementById("closeIcon");
const navigationMenu = document.querySelector(".navigation__menu");
const collapse = new bootstrap.Collapse(navigationMenu, {
    toggle: false // Don't toggle on page load
});

// Initialize menu
export function initNavigationMenu() {
    btnToggle.addEventListener("click", () => {
        collapse.toggle(); 
        hamburgerIcon.classList.toggle("hidden");
        closeIcon.classList.toggle("hidden");
    });
}

// Expand/collapse menu
export function toggleMenu() {
    collapse.toggle();
    hamburgerIcon.classList.toggle("hidden");
    closeIcon.classList.toggle("hidden");
}
