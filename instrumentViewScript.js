let satellite;

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded");  // Check if this logs to the console
  const urlParams = new URLSearchParams(window.location.search);
  
  const orbit = urlParams.get("orbit");

  satellite = document.querySelector("#spacecraft");
  const dataBox = document.querySelector(".Sample.Data");
  const menuButton = document.querySelector("#btnToggleInstrument");
  const closeIconInstrument = document.querySelector("#closeIconInstrument");
  const hamburgerIconInstrument = document.querySelector("#hamburgerIconInstrument");
  const toggleSatelliteButton = document.querySelector("#toggle-satellite");
  const  seemorebtn1 = document.getElementById("see-more-btn1");
  const instrumentDetailsBox = document.querySelector(".instrument-details");
  const instrumentDetailsText = document.getElementById("instrumentdetails");


  const instruments = {
    gamma: document.querySelector("#gamma-spectrometer"),
    neutron: document.querySelector("#neutron-spectrometer"),
    magnetometer: document.querySelector("#magnetometer"),
    multispectral: document.querySelector("#multispectral-imager"),
    xband: document.querySelector("#xband-radio")


    
  };

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

  //logic for Orbit view button
  if (instrumentButton) {
    //console.log("Orbit View Button Found!"); // Debugging log
    instrumentButton.addEventListener("click", function() {
      window.location.href = "index.html";
    });
  } 
  else {
    console.log("Orbit View Button NOT Found! Check your HTML.");
  }
  
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
      const instrumentKey = event.target.dataset.instrument;

      toggleMenu();
      
      // Hide the satellite initially
      toggleVisibility(satellite, false);

      // Handle the instrument visibility based on selection
      handleInstrumentToggle(instrumentKey);
      
      // Show the data box and instrument details after closing the menu on for instruments
      if(instrumentKey){
        dataBox.style.display = "block";
        instrumentDetailsBox.style.display = "block";
      }
    });
  });
  
  // Initially hide the data box and instrument details
  dataBox.style.display = "none";
  instrumentDetailsBox.style.display = "none";

  const navigationMenu = document.querySelector(".navigation__menu");
  const collapse = new bootstrap.Collapse(navigationMenu, {
    toggle: false // Don't toggle on page load
  });

  function toggleMenu() {
    collapse.toggle();
    hamburgerIconInstrument.classList.toggle("hidden");
    closeIconInstrument.classList.toggle("hidden");
}

  // Toggle the visibility of the menu and data box when clicking the menu button
  menuButton.addEventListener("click", () => {
    //collapse.toggle(); 
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
  toggleSatelliteButton.addEventListener("click", handleSatelliteToggle);

  // Close the menu and show the data box and instrument details when clicking the close icon
  closeIconInstrument.addEventListener("click", () => {
    
    // Close the menu and toggle icons
    hamburgerIconInstrument.classList.toggle("hidden");
    closeIconInstrument.classList.toggle("hidden");

    // Show the data box and instrument details after closing the menu
    dataBox.style.display = "block";
    instrumentDetailsBox.style.display = "block";
    toggleMenu();
  });


  console.log("Orbit parameter:", orbit);
  if (orbit) {
      showInstrument(orbit);
  } else {
      console.log("No orbit parameter found in URL.");
  }

});
  
function loadOrbitDetails(instrumentKey) {
  const descriptionFile = `texts/${instrumentKey}/${instrumentKey}Description.txt`;

  // Get references to the elements for the first box (Sample Data)
  const orbitBox = document.querySelector(".Sample Data");
  const orbitText = document.getElementById("orbitText");
  const seeMoreBtn1 = document.getElementById("see-more-btn-1");

  // Get references to the elements for the second box (Instrument Details)
  const instrumentDetailsBox = document.querySelector(".instrument-details");
  const instrumentDetailsText = document.getElementById("instrumentdetails");
  const seeMoreBtn2 = document.getElementById("see-more-btn-2");

  // Fetch description data
  fetch(descriptionFile)
    .then(response => {
      if (!response.ok) throw new Error("File not found");
      return response.text();
    })
    .then(data => {
      orbitText.innerText = data;
      instrumentDetailsText.innerText = data;  // Assuming both boxes use the same data
    })
    .catch(error => {
      orbitText.innerText = "Orbit information unavailable.";
      instrumentDetailsText.innerText = "Instrument information unavailable.";
      console.error("Error loading orbit file:", error);
    })
    .finally(() => {
      // Ensure both boxes and buttons are displayed
      orbitBox.style.display = "block";
      seeMoreBtn1.style.display = "block";
      instrumentDetailsBox.style.display = "block";
      seeMoreBtn2.style.display = "block";
      
      // Set initial collapsed state for both boxes
      orbitBox.classList.remove("expanded");
      instrumentDetailsBox.classList.remove("expanded");
      orbitText.style.maxHeight = "120px";
      orbitText.style.overflow = "hidden";
      instrumentDetailsText.style.maxHeight = "120px";
      instrumentDetailsText.style.overflow = "hidden";
      
      seemorebtn1.innerText = "See More";
      seeMoreBtn2.innerText = "See More";
    });
  }

  // Toggle See More button functionality for the first box (Sample Data)
  seemorebtn1.addEventListener("click", () => {
    if (orbitBox.classList.contains("expanded")) {
      orbitBox.classList.remove("expanded");
      seeMoreBtn1.innerText = "See More";
      orbitText.style.maxHeight = "120px";
      orbitText.style.overflow = "hidden";
    } else {
      orbitBox.classList.add("expanded");
      seeMoreBtn1.innerText = "See Less";
      orbitText.style.maxHeight = "none";
      orbitText.style.overflow = "visible";
    }
  });


  
  seemorebtn1.addEventListener("click", () => {
    console.log("Button clicked!"); // Debug line to check if the event fires
  
    if (instrumentDetailsBox.classList.contains("expanded")) {
      instrumentDetailsBox.classList.remove("expanded");
      seemorebtn1.innerText = "See More";
      instrumentDetailsText.style.maxHeight = "120px";
      instrumentDetailsText.style.overflow = "hidden";
    } else {
      instrumentDetailsBox.classList.add("expanded");
      seemorebtn1.innerText = "See Less";
      instrumentDetailsText.style.maxHeight = "none";
      instrumentDetailsText.style.overflow = "visible";
    }
  });
  





// Function to toggle instrument visibility based on orbit
function showInstrument(orbit) {
    // Hide all instruments first
    const instruments = document.querySelectorAll("[id$='-spectrometer'], #magnetometer, #multispectral-imager, #xband-radio");
    instruments.forEach(inst => inst.setAttribute("visible", "false"));

    // Select the correct instrument to show
    let instrumentId;
    switch (orbit) {
        case "orbitA":
            instrumentId = "magnetometer";
            break;
        case "orbitB":
          console.log("displaying multispectral");
            instrumentId = "multispectral-imager";
            break;
        case "orbitC":
            instrumentId = "#xband-radio";
            console.log("displaying xband");
            break;
        case "orbitD":
            instrumentId = "gamma-spectrometer";
            console.log("displaying gamma");
            break;
        default:
          if (satellite) {
            satellite.setAttribute("visible", "true");
        }
            console.log("Invalid orbit parameter.");
            return;
    }

    // Make the selected instrument visible
    const selectedInstrument = document.getElementById(instrumentId);
    if (selectedInstrument) {
        selectedInstrument.setAttribute("visible", "true");
        console.log(`Showing: ${instrumentId}`);
        
       
    } else {
        console.log(`Instrument with ID '${instrumentId}' not found!`);
    }
}
