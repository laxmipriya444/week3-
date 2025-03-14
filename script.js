document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const featuredImage = document.getElementById("featured-image");
    const photographerLink = document.getElementById("photographer-link");
    const photographerName = document.getElementById("photographer-name");
    const similarResultsContainer = document.getElementById("similar-results");
    const favoritesContainer = document.getElementById("favorites");

    let favorites = [];

    async function searchImages() {
        const query = searchInput.value.trim();
        if (!query) {
            alert("Please enter a search term.");
            return;
        }

        const apiKey = "qmSqQDrv6UujCxFiZyxY8hGxdjM3GywYEG5A0wnJsHLBslu7xwLYC5HX"; // Your API key
        const apiUrl = `https://api.pexels.com/v1/search?query=${query}&per_page=10`;

        try {
            const response = await fetch(apiUrl, {
                headers: { Authorization: apiKey }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API Response:", data);

            if (data.photos.length > 0) {
                updateFeaturedImage(data.photos[0]); // First image as featured
                displaySimilarImages(data.photos.slice(1)); // Rest in slider
            } else {
                featuredImage.src = "default-feature.jpg";
                photographerName.textContent = "";
                photographerLink.href = "#";
                similarResultsContainer.innerHTML = "<p>No results found.</p>";
            }
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    }

    function updateFeaturedImage(image) {
        featuredImage.src = image.src.large;
        photographerLink.href = image.photographer_url;
        photographerName.textContent = `📸 Photographer: ${image.photographer}`;
        photographerLink.target = "_blank";
    }

    function displaySimilarImages(images) {
        similarResultsContainer.innerHTML = `
            <section id="image-slider" class="splide">
                <div class="splide__track">
                    <ul class="splide__list">
                        ${images.map(image => `
                            <li class="splide__slide">
                                <img class="slider-img" src="${image.src.medium}" alt="${image.photographer}">
                                <p>📸 ${image.photographer}</p>
                                <button class="favorite-btn" onclick="toggleFavorite('${image.src.medium}', '${image.photographer}')">❤️ Favorite</button>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </section>
        `;

        // Initialize Splide.js Slider
        new Splide('#image-slider', {
            type: 'loop',
            perPage: 3,
            perMove: 1,
            gap: '10px',
            autoplay: true,
            interval: 3000,
            breakpoints: {
                768: { perPage: 2 },
                480: { perPage: 1 }
            }
        }).mount();
    }

    // Add/remove favorites
    window.toggleFavorite = function(imgSrc, photographer) {
        const index = favorites.findIndex(fav => fav.imgSrc === imgSrc);

        if (index === -1) {
            favorites.push({ imgSrc, photographer });
        } else {
            favorites.splice(index, 1);
        }

        displayFavorites();
    };

    function displayFavorites() {
        favoritesContainer.innerHTML = "";
        if (favorites.length === 0) {
            favoritesContainer.innerHTML = "<p>No favorite images yet.</p>";
            return;
        }

        favorites.forEach(fav => {
            const favItem = document.createElement("div");
            favItem.classList.add("image-item");
            favItem.innerHTML = `
                <img class="fav-img" src="${fav.imgSrc}" alt="${fav.photographer}">
                <p>📸 ${fav.photographer}</p>
                <button class="favorite-btn" onclick="toggleFavorite('${fav.imgSrc}', '${fav.photographer}')">❌ Remove</button>
            `;
            favoritesContainer.appendChild(favItem);
        });
    }

    window.searchImages = searchImages;
});
