// OMDB API key
const apiKey = '122abe00';

// Fetches search results from the OMDB API
function fetchSearchResults(query) {
  const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${query}`;
  return fetch(url)
    .then(response => response.json())
    .then(data => data.Search)
    .catch(error => console.error(error));
}

// Renders the search results on the page
function renderSearchResults(results) {
  const searchResultsElement = document.getElementById('search-results');
  searchResultsElement.innerHTML = '';

  results.forEach(movie => {
    const movieElement = document.createElement('div');
    movieElement.classList.add('col');
    movieElement.innerHTML = `
      <div class="card">
        <img src="${movie.Poster}" alt="${movie.Title}" class="card-img-top movie-image" data-imdb-id="${movie.imdbID}">
        <div class="card-body">
          <h5 class="card-title">${movie.Title}</h5>
          <button class="btn btn-primary favorite-button" data-imdb-id="${movie.imdbID}">Add to Favorites</button>
        </div>
      </div>
    `;

    const favoriteButton = movieElement.querySelector('.favorite-button');
    favoriteButton.addEventListener('click', addToFavorites);

    const movieImage = movieElement.querySelector('.movie-image');
    movieImage.addEventListener('click', () => {
      fetchMovieDetails(movie.imdbID)
        .then(renderMovieDetails)
        .catch(error => console.error(error));
    });

    searchResultsElement.appendChild(movieElement);
  });
}

// Fetches movie details from the OMDB API
function fetchMovieDetails(imdbID) {
  const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`;
  return fetch(url)
    .then(response => response.json())
    .catch(error => console.error(error));
}

// Renders the movie details on the page
function renderMovieDetails(movie) {
  const movieDetailsContainer = document.getElementById('movie-details-container');
  movieDetailsContainer.innerHTML = '';

  const movieElement = document.createElement('div');
  movieElement.classList.add('card', 'text-center');
  movieElement.innerHTML = `
    <img src="${movie.Poster}" alt="${movie.Title}" class="card-img-top">
    <div class="card-body">
      <h5 class="card-title">${movie.Title}</h5>
      <p class="card-text">${movie.Plot}</p>
    </div>
  `;

  movieDetailsContainer.appendChild(movieElement);
}

// Adds a movie to the favorites list
function addToFavorites(event) {
  const imdbID = event.target.dataset.imdbId;
  const favoritesList = JSON.parse(localStorage.getItem('favorites')) || [];

  // Check if the movie is already in favorites
  const existingMovie = favoritesList.find(movie => movie.imdbID === imdbID);
  if (!existingMovie) {
    fetchMovieDetails(imdbID)
      .then(movie => {
        favoritesList.push(movie);
        localStorage.setItem('favorites', JSON.stringify(favoritesList));
        renderFavorites();
        event.target.textContent = 'Added to Favorites'; // Show "Added to Favorites" text
      })
      .catch(error => console.error(error));
  }
}

// Removes a movie from the favorites list
function removeFromFavorites(imdbID) {
  let favoritesList = JSON.parse(localStorage.getItem('favorites')) || [];

  // Filter out the movie to be removed
  favoritesList = favoritesList.filter(movie => movie.imdbID !== imdbID);

  localStorage.setItem('favorites', JSON.stringify(favoritesList));
  renderFavorites();
}

// Renders the favorites list on the page
function renderFavorites() {
  const favoritesListElement = document.getElementById('favorites-list');
  favoritesListElement.innerHTML = '';

  const favoritesList = JSON.parse(localStorage.getItem('favorites')) || [];

  favoritesList.forEach(movie => {
    const movieElement = document.createElement('li');
    movieElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    movieElement.innerHTML = `
      <div>
        <img src="${movie.Poster}" alt="${movie.Title}" class="favorite-movie-img">
        <h4 class="favorite-movie-title">${movie.Title}</h4>
      </div>
      <button class="btn btn-danger remove-button" data-imdb-id="${movie.imdbID}">Remove</button>
    `;

    const removeButton = movieElement.querySelector('.remove-button');
    removeButton.addEventListener('click', function(event) {
      const imdbID = event.target.dataset.imdbId;
      removeFromFavorites(imdbID);
    });

    favoritesListElement.appendChild(movieElement);
  });
}

// Event listener for search input changes
document.getElementById('search-input').addEventListener('input', function(event) {
  const query = event.target.value;
  if (query.trim() !== '') {
    fetchSearchResults(query)
      .then(renderSearchResults)
      .catch(error => console.error(error));
  } else {
    // Clear search results if the input is empty
    document.getElementById('search-results').innerHTML = '';
  }
});

// Render favorites when the page loads
renderFavorites();
