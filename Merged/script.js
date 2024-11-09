// JavaScript to show the popup when the page loads
window.onload = function() {
    const popup = document.getElementById("instructionPopup");
    popup.style.display = "block"; // Show the popup

    // Hide the popup after 5 seconds
    setTimeout(() => {
        popup.style.display = "none";
    }, 5000);
};