export function initNavigationMenu() {
    const btnToggle = document.querySelector("#btnToggle");
    const hamburgerIcon = document.querySelector("#hamburgerIcon");
    const closeIcon = document.querySelector("#closeIcon");
    const navigationMenu = document.querySelector(".navigation__menu");

    btnToggle.addEventListener("click", () => {
        navigationMenu.classList.toggle("active");
        hamburgerIcon.classList.toggle("hidden");
        closeIcon.classList.toggle("hidden");
    });
}