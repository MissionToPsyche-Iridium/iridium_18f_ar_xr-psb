// Function to load text content from a file
function loadText(filePath) {
    console.log(`Attempting to load file: ${filePath}`);
    
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('popupText').innerText = data;
            document.getElementById('instructionPopup').style.display = 'block';
            console.log(`Loaded content: ${data}`);
        })
        .catch(error => console.error('Error loading text file:', error));
}

// Function to hide the popup
function hidePopup() {
    document.getElementById('instructionPopup').style.display = 'none';
}

// Attach event listeners to orbits with additional debug logs
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('orbit1').addEventListener('click', () => loadText('resources\orbitA.txt'));
    document.getElementById('orbit2').addEventListener('click', () => loadText('resources\orbitB.txt'));
    document.getElementById('orbit3').addEventListener('click', () => loadText('resources\orbitC.txt'));
    document.getElementById('orbit4').addEventListener('click', () => loadText('resources\orbitD.txt'));
    
    document.getElementById('instructionPopup').addEventListener('click', hidePopup);
    console.log('Event listeners set up for each orbit.');
});
