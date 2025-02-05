
const orbitLinks = document.querySelectorAll('[data-orbit]');

// Event listeners for each navigation menu link
orbitLinks.forEach(link => {
    link.addEventListener('click', (event) => {

        event.preventDefault();  // Prevent default link behavior (page reload)
        event.stopPropagation();
        const orbitId = link.getAttribute('data-orbit');
        console.log(orbitId);

        sessionStorage.setItem("selectedOrbit", orbitId);

        if(window.location.pathname.includes("References.html")){
            window.location.href = "index.html"
            return;
        }

        toggleMenu();
        highlightOrbit(orbitId);
        transitionToOrbit(orbitId);
        updateBannerText(orbitId);
        panToPsyche(orbitId);
        orbitPopupText(orbitId);
    });
});