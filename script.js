// Select elements from the HTML
const pokedex = document.getElementById('pokedex');
const searchInput = document.getElementById('search');
const typeFilter = document.getElementById('typeFilter');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pageInfo = document.getElementById('pageInfo');
const pokemonModal = document.getElementById('pokemonModal');
const modalDetails = document.getElementById('modalDetails');
const closeModal = document.getElementById('closeModal');

// Variables to store Pokémon data and pagination state
let allPokemon = [];
let currentPage = 1;
const perPage = 50; // Number of Pokémon per page

// Fetch Pokémon list from PokeAPI
async function fetchPokemonList() {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=2000`);
  const data = await res.json();

  // Fetch detailed info for each Pokémon
  allPokemon = await Promise.all(data.results.map(p => fetch(p.url).then(r => r.json())));
  
  populateTypeFilter();
  displayPage();
}

// Populate the type filter dropdown
function populateTypeFilter() {
  const types = new Set();
  allPokemon.forEach(p => p.types.forEach(t => types.add(t.type.name)));

  [...types].sort().forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = capitalize(t);
    typeFilter.appendChild(opt);
  });
}

// Display the current page of Pokémon
function displayPage() {
  const searchText = searchInput.value.toLowerCase();
  const selectedType = typeFilter.value;

  // Filter Pokémon based on search input and selected type
  const filtered = allPokemon.filter(p => {
    const nameMatch = p.name.includes(searchText);
    const typeMatch = !selectedType || p.types.some(t => t.type.name === selectedType);
    return nameMatch && typeMatch;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * perPage;
  const pageData = filtered.slice(start, start + perPage);

  // Clear previous Pokémon cards
  pokedex.innerHTML = '';

  // Display Pokémon cards
  pageData.forEach(displayPokemon);

  // Update pagination info
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// Create a Pokémon card for the grid
function displayPokemon(pokemon) {
  const div = document.createElement('div');
  div.classList.add('pokemon');
  div.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h2>${pokemon.name}</h2>
  `;
  div.addEventListener('click', () => openModal(pokemon));
  pokedex.appendChild(div);
}

// Open modal with detailed Pokémon info
function openModal(pokemon) {
  modalDetails.innerHTML = `
    <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" alt="${pokemon.name}" />
    <h2>${pokemon.name}</h2>
    <div class="types">
  ${pokemon.types.map(t => `<span class="type-badge ${t.type.name}">${t.type.name}</span>`).join('')}
</div>
    <div class="stats">
      ${pokemon.stats.map(s => `<p><strong>${capitalize(s.stat.name)}:</strong> ${s.base_stat}</p>`).join('')}
    </div>
  `;
  pokemonModal.classList.remove('hidden');
}

// Helper function to capitalize text
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Close the modal
closeModal.addEventListener('click', () => {
  pokemonModal.classList.add('hidden');
});

// Event Listeners for search, filter, and pagination buttons
searchInput.addEventListener('input', () => {
  currentPage = 1;
  displayPage();
});

typeFilter.addEventListener('change', () => {
  currentPage = 1;
  displayPage();
});

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayPage();
  }
});

nextBtn.addEventListener('click', () => {
  currentPage++;
  displayPage();
});

// Fetch Pokémon data when the page loads
fetchPokemonList();
