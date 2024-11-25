document.addEventListener('DOMContentLoaded', () => {
    const alphabetNav = document.getElementById('alphabetNav');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
    // Generate Nav bar A-Z
    for (const letter of alphabet) {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#" onclick="filterByLetter('${letter}')">${letter}</a>`;
      alphabetNav.appendChild(li);
    }
  
    let plantData = []; // Declare plantData to store the fetched plant data
  
    const fetchPlantData = async () => {
      try {
        const response = await fetch('http://localhost:8080/');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch plant data: ${response.statusText}`);
        }
    
        plantData = await response.json();
        console.log('Plant data fetched successfully:', plantData);
    
        if (plantData.length === 0) {
          console.warn('No plant data available.');
          document.getElementById('results').innerHTML = '<p>No plants found.</p>';
        } else {
          displayRandomPlants();
        }
      } catch (error) {
        console.error('Error fetching plant data:', error);
        document.getElementById('results').innerHTML = `<p>Error: ${error.message}</p>`;
      }
    };
  
    // Display random plants
    const displayRandomPlants = () => {
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = ''; // Clear previous results
  
      // Shuffle and select 24 random plants
      const randomPlants = plantData.sort(() => 0.5 - Math.random()).slice(0, 24);
  
      randomPlants.forEach((plant) => {
        const plantDiv = document.createElement('div');
        plantDiv.classList.add('plant');
        plantDiv.onclick = () => showPlantDetails(plant);
  
        const imageHTML = plant.PlantPic && plant.PlantPic.toLowerCase().endsWith('.jpg')
          ? `<img src="${plant.PlantPic}" alt="${plant['Plant Name']}" style="width: 100%; height: 150px; object-fit: cover;">`
          : '';
        
        plantDiv.innerHTML = `
          ${imageHTML}
          <div class="plant-info">
            <p><span class="label">Name:</span> ${plant['Plant Name'] || 'N/A'}</p>
          </div>
        `;
        resultsDiv.appendChild(plantDiv);
      });
    };
  
    // Show detailed plant information
    const showPlantDetails = (plant) => {
      const detailsDiv = document.getElementById('plantDetails');
      const imageHTML = plant.PlantPic && plant.PlantPic.toLowerCase().endsWith('.jpg')
        ? `<img src="${plant.PlantPic}" alt="${plant['Plant Name']}" style="width: 100%; height: auto; object-fit: cover;">`
        : '';
  
      // Generate dynamic content for all fields
      const plantContent = Object.keys(plant)
        .filter(key => plant[key] && plant[key].trim()) // Only show non-empty fields
        .map((key) => `<p><span class="label">${key}:</span> ${plant[key]}</p>`)
        .join('');
  
      detailsDiv.innerHTML = `
        ${imageHTML}
        <div>
          ${plantContent || '<p>No additional details available.</p>'}
        </div>
      `;
    };
  
    window.filterByLetter = (letter) => {
      const filteredPlants = plantData.filter(plant => 
        plant['Plant Name'] && plant['Plant Name'].toUpperCase().startsWith(letter)
      );
      displayFilteredPlants(filteredPlants);
    };
  
    const displayFilteredPlants = (filteredPlants) => {
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = ''; // Clear previous results
  
      if (filteredPlants.length === 0) {
        resultsDiv.innerHTML = '<p>No plants found for this letter.</p>';
        return;
      }
  
      filteredPlants.forEach((plant) => {
        const plantDiv = document.createElement('div');
        plantDiv.classList.add('plant');
        plantDiv.onclick = () => showPlantDetails(plant);
  
        const imageHTML = plant.PlantPic && plant.PlantPic.toLowerCase().endsWith('.jpg')
          ? `<img src="${plant.PlantPic}" alt="${plant['Plant Name']}" style="width: 100%; height: 150px; object-fit: cover;">`
          : '';
        
        plantDiv.innerHTML = `
          ${imageHTML}
          <div class="plant-info">
            <p><span class="label">Name:</span> ${plant['Plant Name'] || 'N/A'}</p>
          </div>
        `;
        resultsDiv.appendChild(plantDiv);
      });
    };
  
    // Fetch plant data on page load
    fetchPlantData();
  });
    
async function searchPlants() {
    const searchQuery = document.getElementById('search').value.trim();
    const resultContainer = document.getElementById('resultContainer');

    // Input validation
    if (!searchQuery) {
        resultContainer.innerHTML = '<p class="error">Please enter a search term.</p>';
        return;
    }

    try {
        // Send search request to backend
        const response = await fetch('http://localhost:8080/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: searchQuery })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const results = await response.json();
        displaySearchResults(results);

    } catch (error) {
        console.error('Search Error:', error);
        resultContainer.innerHTML = `<p class="error">Failed to fetch results: ${error.message}</p>`;
    }
}

function createPlantResultElement(result) {
    // Create a card-like structure for each plant
    const plantElement = document.createElement('div');
    plantElement.classList.add('plant-result');
    plantElement.setAttribute('tabindex', '0'); // Make it focusable for accessibility
    plantElement.setAttribute('aria-label', `Details for ${result['Plant Name'] || 'Unnamed Plant'}`);

    // List of fields to include in the card
    const fields = [
      "PlantPic",
      "Health power",
      "Vitamin and Mineral",
      "Disease Prevention",
      "How to Grow",
      "Insect Control",
      "Tips",
    ];
  
    // Populate the card with plant data dynamically
    const fieldContent = fields.map(field => {
      const value = result[field] || 'N/A';
      if (field === "PlantPic" && result["PlantPic"]) {
        return `<img src="${result["PlantPic"]}" alt="${result["Plant Name"] || 'Plant Image'}" style="width: 100%; height: auto; object-fit: cover;">`;
      }
      return `<p><strong>${field}:</strong> ${value}</p>`;
    }).join('');
  
    // Set the innerHTML of the plant card
    plantElement.innerHTML = `
      <h3>${result['Plant Name'] || 'Unnamed Plant'}</h3>
        ${fieldContent}
    `;
  
    // Attach an event listener to display detailed view on click
    plantElement.onclick = () => showPlantDetails(result);

    // Add hover effect via CSS class
    plantElement.classList.add('hover-effect');

    return plantElement;
}

function showPlantDetails(plant) {
    const detailsDiv = document.getElementById('plantDetails');
    if (!detailsDiv) {
        console.error('Details container not found.');
        return;
    }

    const imageHTML = plant.PlantPic && plant.PlantPic.toLowerCase().endsWith('.jpg') 
        ? `<img src="${plant.PlantPic}" alt="${plant['Plant Name']}" style="width: 100%; height: auto; object-fit: cover;">` 
        : '';

    // Generate dynamic content for all columns
    const plantContent = Object.keys(plant)
        .filter(key => plant[key] && plant[key].trim()) // Only show non-empty fields
        .map(key => `<p><span class="label">${key}:</span> ${plant[key]}</p>`)
        .join('');

    detailsDiv.innerHTML = `
        ${imageHTML}
        <div>
            ${plantContent || '<p>No additional details available.</p>'}
        </div>
    `;

    detailsDiv.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to the details section
}

function displaySearchResults(results) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = ''; // Clear previous results

    if (!results || results.length === 0) {
        resultContainer.innerHTML = '<p>No results found.</p>';
        return;
    }

    // Create a document fragment for better performance
    const resultsFragment = document.createDocumentFragment();

    // Create and append result elements
    results.forEach(result => {
        const plantResultElement = createPlantResultElement(result);
        resultsFragment.appendChild(plantResultElement);
    });

    // Append the fragment to the container
    resultContainer.appendChild(resultsFragment);
}