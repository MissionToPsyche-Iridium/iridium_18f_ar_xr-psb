let selectedInstrument = null; // Track the currently selected instrument
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;

document.addEventListener("DOMContentLoaded", () => {
    console.log("Instrument View Loaded"); // Debugging check
    const urlParams = new URLSearchParams(window.location.search);
    const orbit = urlParams.get("orbit");

    const instruments = {
        spacecraft: document.querySelector("#spacecraft"),
        gamma: document.querySelector("#gamma-spectrometer"),
        neutron: document.querySelector("#neutron-spectrometer"),
        magnetometer: document.querySelector("#magnetometer"),
        multispectral: document.querySelector("#multispectral-imager"),
        "xband-radio": document.querySelector("#xband-radio")
    };

    const instrumentTitle = document.getElementById("instrument-details");
    const instrumentDetailsText = document.getElementById("instrumentdetails");
    const instrumentDetailsBox = document.querySelector(".instrument-details");
    const seeMoreBtn1 = document.getElementById("see-more-btn1");
    const returnToOrbitButton = document.getElementById("instrumentButton");

    const camera = document.querySelector("[camera]");
    if (camera) {
        camera.setAttribute("look-controls", "enabled", false);
        camera.setAttribute("wasd-controls", "enabled", false);
    }

    setTimeout(() => {
        // Set default view to the spacecraft
        Object.keys(instruments).forEach(id => {
            if (instruments[id]) {
                instruments[id].setAttribute("visible", id === "spacecraft" ? "true" : "false");
            }
        });
        selectedInstrument = instruments.spacecraft;
        loadInstrumentDetails("spacecraft");
        console.log("Checking instrument models after DOM load:", instruments);
    }, 1000);

    function loadInstrumentDetails(instrumentId) {
        const descriptionFile = `texts/${instrumentId}/${instrumentId}Details.txt`;

        fetch(descriptionFile)
            .then(response => {
                if (!response.ok) throw new Error("File not found");
                return response.text();
            })
            .then(data => {
                const instrumentNames = {
                spacecraft: "Psyche Spacecraft Details",
                gamma: "Gamma Ray Spectrometer Details",
                neutron: "Neutron Spectrometer Details",
                magnetometer: "Magnetometer Details",
                multispectral: "Multispectral Imager Details",
                "xband-radio": "X-band Radio Details"
              };

                instrumentTitle.innerText = instrumentNames[instrumentId] || instrumentId.replace(/-/g, " ");
                instrumentDetailsText.innerText = data;

                instrumentDetailsBox.classList.add("show");
                instrumentDetailsBox.classList.remove("expanded");
                instrumentDetailsText.style.maxHeight = "120px";
                instrumentDetailsText.style.overflow = "hidden";

                seeMoreBtn1.style.display = "block";
                seeMoreBtn1.innerText = "See More";
            })

            .catch(error => {
                instrumentDetailsText.innerText = "Instrument information unavailable.";
                console.error("Error loading instrument file:", error);
            });
    }

    const instrumentButtons = document.querySelectorAll("[data-instrument]");
    instrumentButtons.forEach(button => {
        button.addEventListener("click", event => {
            const instrumentId = event.target.getAttribute("data-instrument");
            console.log(`Instrument Selected: ${instrumentId}`);

            Object.keys(instruments).forEach(id => {
                if (instruments[id]) {
                    instruments[id].setAttribute("visible", "false");
                    console.log(`Hiding model: ${id}`);
                }
            });

            if (instruments[instrumentId]) {
                selectedInstrument = instruments[instrumentId];
                selectedInstrument.setAttribute("visible", "true");
                loadInstrumentDetails(instrumentId);
            } else {
                console.warn(`No model found for ${instrumentId}`);
            }
        });
    });

    if (returnToOrbitButton) {
        returnToOrbitButton.addEventListener("click", () => {
            console.log("Returning to orbit view");
            window.location.href = "index.html"; // Update this to the correct orbit view page if needed // Ensure this is the correct path to orbit view
        });
    } else {
        console.warn("Return to Orbit button not found!");
    }

    document.addEventListener("mousedown", (event) => {
        isDragging = true;
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });

    document.addEventListener("mousemove", (event) => {
        event.preventDefault(); // Prevent unintended camera movement
        if (isDragging && selectedInstrument) {
            const deltaX = event.clientX - previousMouseX;
            const deltaY = event.clientY - previousMouseY;
            previousMouseX = event.clientX;
            previousMouseY = event.clientY;

            let currentRotation = selectedInstrument.getAttribute("rotation") || { x: 0, y: 0, z: 0 };
            if (typeof currentRotation === "string") {
                let rotationParts = currentRotation.split(" ").map(Number);
                currentRotation = { x: rotationParts[0] || 0, y: rotationParts[1] || 0, z: rotationParts[2] || 0 };
            }

            currentRotation.x -= deltaY * 0.5;
            currentRotation.y -= deltaX * 0.5;
            selectedInstrument.setAttribute("rotation", `${currentRotation.x} ${currentRotation.y} ${currentRotation.z}`);
        }
    });
});
