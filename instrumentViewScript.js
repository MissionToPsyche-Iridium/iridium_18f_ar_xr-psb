document.addEventListener("DOMContentLoaded", () => {
    const satellite = document.querySelector("#spacecraft");
    const instruments = {
      gamma: document.querySelector("#gamma-spectrometer"),
      neutron: document.querySelector("#neutron-spectrometer"),
      magnetometer: document.querySelector("#magnetometer"),
      multispectral: document.querySelector("#multispectral-imager"),
      xband: document.querySelector("#xband-radio")
    };
  
    const dataBox = document.querySelector(".Sample.Data");
    const instrumentDetailsBox = document.querySelector(".instrument-details");
    const menuButton = document.querySelector("#btnToggleInstrument");
    const closeIconInstrument = document.querySelector("#closeIconInstrument");
    const hamburgerIconInstrument = document.querySelector("#hamburgerIconInstrument");
    
    //logic for Orbit view button
    if (instrumentButton) {
      console.log("Orbit View Button Found!"); // Debugging log
      instrumentButton.addEventListener("click", function() {
          window.location.href = "index.html";
      });
  } else {
      console.log("Orbit View Button NOT Found! Check your HTML.");
  }
  
    // Instrument data array
    const instrumentsData = [
      {
        id: "gamma",
        name: "Gamma Ray Spectrometer",
        modelId: "gamma-spectrometer",
        description: "The Gamma Ray Spectrometer detects gamma rays emitted from Psyche, helping to determine the elemental composition of the asteroid's surface and subsurface."
      },
      {
        id: "neutron",
        name: "Neutron Spectrometer",
        modelId: "neutron-spectrometer",
        description: "The Neutron Spectrometer helps in analyzing neutron emissions from Psyche to better understand the asteroid's composition."
      },
      {
        id: "magnetometer",
        name: "Magnetometer",
        modelId: "magnetometer",
        description: "The Magnetometer measures the magnetic field around Psyche to investigate its internal structure and history."
      },
      {
        id: "multispectral",
        name: "Multispectral Imager",
        modelId: "multispectral-imager",
        description: "The Multispectral Imager captures high-resolution images in different wavelengths to analyze Psyche's surface composition and features."
      },
      {
        id: "xband",
        name: "X-band Radio",
        modelId: "xband-radio",
        description: "The X-band Radio Telecommunications System measures Psyche's gravity field to high precision."
      }
    ];
  
    // Modular function to toggle visibility of any element
    function toggleVisibility(element, isVisible) {
      element.setAttribute("visible", isVisible ? "true" : "false");
    }
  
    // Function to handle instrument visibility toggling and showing details
    function handleInstrumentToggle(instrumentKey) {
      // Hide all instruments first
      Object.values(instruments).forEach(instrument => toggleVisibility(instrument, false));
  
      // If an instrument is selected, show it and update details
      const selectedInstrument = instrumentsData.find(inst => inst.id === instrumentKey);
  
      if (selectedInstrument) {
        toggleVisibility(instruments[instrumentKey], true);
  
        // Update the data box with the appropriate text
        document.querySelector("#Sample\\ Data").textContent = `${selectedInstrument.name} Data`;
  
        // Update the instrument details box with the appropriate name and description
        instrumentDetailsBox.innerHTML = `
          <h2>${selectedInstrument.name}</h2>
          <p>${selectedInstrument.description}</p>
        `;
        
        instrumentDetailsBox.style.display = "none"; // Keep it hidden initially
      }
    }
  
    // Function to handle the satellite visibility toggle
    function handleSatelliteToggle() {
      const isVisible = satellite.getAttribute("visible") === "true";
      toggleVisibility(satellite, !isVisible);
    }
  
    // Attach event listeners to menu items to toggle visibility of instruments
    document.querySelectorAll(".navigation__links a").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        const instrumentKey = event.target.dataset.instrument;
        
        // Hide the satellite initially
        toggleVisibility(satellite, false);
  
        // Handle the instrument visibility based on selection
        handleInstrumentToggle(instrumentKey);
      });
    });
  
    // Initially hide the data box and instrument details
    dataBox.style.display = "none";
    instrumentDetailsBox.style.display = "none";
  
    // Toggle the visibility of the menu and data box when clicking the menu button
    menuButton.addEventListener("click", () => {
      const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        // Close the menu
        hamburgerIconInstrument.classList.toggle("hidden");
        closeIconInstrument.classList.toggle("hidden");
  
        // Hide the data box and instrument details until X is clicked
        dataBox.style.display = "none";
        instrumentDetailsBox.style.display = "none";
      } else {
        // Show the data box and instrument details only when the X icon is clicked
        hamburgerIconInstrument.classList.toggle("hidden");
        closeIconInstrument.classList.toggle("hidden");
      }
    });
  
    // Ensure the menu gets closed and data box is shown when clicking on the "Toggle Satellite" button
    const toggleSatelliteButton = document.querySelector("#toggle-satellite");
    toggleSatelliteButton.addEventListener("click", handleSatelliteToggle);
  
    // Close the menu and show the data box and instrument details when clicking the close icon
    closeIconInstrument.addEventListener("click", () => {
      // Close the menu and toggle icons
      hamburgerIconInstrument.classList.toggle("hidden");
      closeIconInstrument.classList.toggle("hidden");
  
      // Show the data box and instrument details after closing the menu
      dataBox.style.display = "block";
      instrumentDetailsBox.style.display = "block";
    });
  });
  