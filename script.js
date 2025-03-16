const API_KEY = 'HLatilWP5EgXJkkS95SyN2oDZiGTuuqtctT5tNZ04FU7h1EbseEMmAyd';
const API_URL = 'https://api.pexels.com/v1/search';

// DOM elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const mainPhotoSection = document.getElementById('main-photo-section');
const similarPhotosGrid = document.getElementById('similar-photos-grid');
const favoritesGrid = document.getElementById('favorites-grid');
const loadingIndicator = document.getElementById('loading-indicator');

// State
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentQuery = 'Laptop';

// Initialize the page
window.addEventListener('DOMContentLoaded', () => {
    loadPhotos();
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
});

function handleSearch() {
    currentQuery = searchInput.value.trim();
    if (currentQuery) {
        loadPhotos();
    }
}

async function loadPhotos() {
    showLoading(true);
    try {
        const mainPhotoResponse = await fetchPhotos(currentQuery, 1, 1);
        if (mainPhotoResponse.photos.length > 0) {
            renderMainPhoto(mainPhotoResponse.photos[0]);
        }

        const similarPhotosResponse = await fetchPhotos(currentQuery, 10, 2);
        if (similarPhotosResponse.photos.length > 0) {
            renderSimilarPhotos(similarPhotosResponse.photos);
        }

        renderFavorites();
    } catch (error) {
        console.error('Error loading photos:', error);
        alert('Failed to load photos. Please try again later.');
    } finally {
        showLoading(false);
    }
}

async function fetchPhotos(query, perPage, page = 1) {
    const url = `${API_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`;
    const response = await fetch(url, { headers: { 'Authorization': API_KEY } });
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json();
}

function renderMainPhoto(photo) {
    mainPhotoSection.innerHTML = `
        <div class="main-photo-container">
            <img src="${photo.src.large}" alt="${photo.alt}" class="main-photo">
        </div>
        <div class="main-photo-info">
            <h2>${photo.alt}</h2>
            <span class="photographer">Photographer: ${photo.photographer}</span>
            <a href="${photo.photographer_url}" target="_blank" class="explore-button">EXPLORE MORE</a>
        </div>
    `;
}

function renderSimilarPhotos(photos) {
    similarPhotosGrid.innerHTML = `<section id="similar-slider" class="splide"><div class="splide__track"><ul class="splide__list">
        ${photos.map(photo => `
            <li class="splide__slide">
                <div class="photo-card">
                    <img src="${photo.src.medium}" alt="${photo.alt}">
                    <div class="favorite-icon" data-id="${photo.id}" onclick="toggleFavorite(${photo.id}, '${photo.src.medium}', '${photo.alt}', '${photo.photographer}')">
                        🤍
                    </div>
                    <div class="photo-info">
                        <div class="photo-title">${photo.alt}</div>
                        <div class="photographer-name">Photographer: ${photo.photographer}</div>
                    </div>
                </div>
            </li>
        `).join('')}
    </ul></div></section>`;

    new Splide('#similar-slider', {
        type: 'loop',
        perPage: 4,
        perMove: 1,
        autoplay: true,
        arrows: true,
        pagination: false,
        gap: '5px',
    }).mount();
}

function renderFavorites() {
    favoritesGrid.innerHTML = `<section id="favorite-slider" class="splide"><div class="splide__track"><ul class="splide__list">
        ${favorites.map(photo => `
            <li class="splide__slide">
                <div class="photo-card">
                    <img src="${photo.src}" alt="${photo.alt}">
                    <div class="favorite-icon active" data-id="${photo.id}" onclick="removeFavorite(${photo.id})">
                        ❤️
                    </div>
                    <div class="photo-info">
                        <div class="photo-title">${photo.alt}</div>
                        <div class="photographer-name">Photographer: ${photo.photographer}</div>
                    </div>
                </div>
            </li>
        `).join('')}
    </ul></div></section>`;

    new Splide('#favorite-slider', {
        type: 'loop',
        perPage: 4,
        perMove: 1,
        autoplay: true,
        arrows: true,
        pagination: false,
        gap: '5px',
    }).mount();
}

function toggleFavorite(id, src, alt, photographer) {
    const exists = favorites.find(fav => fav.id === id);
    if (!exists) {
        favorites.push({ id, src, alt, photographer });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderFavorites();
    }
}

// function removeFavorite(id) {
//     favorites = favorites.filter(photo => photo.id !== id);
//     localStorage.setItem('favorites', JSON.stringify(favorites));
//     renderFavorites();
// }

function removeFavorite(id) {
    const index = favorites.findIndex(photo => photo.id === id);
    if (index !== -1) {
        favorites.splice(index, 1); // Remove only the first occurrence
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderFavorites();
    }
}


function showLoading(isLoading) {
    loadingIndicator.style.display = isLoading ? 'flex' : 'none';
}

window.toggleFavorite = toggleFavorite;
window.removeFavorite = removeFavorite;

