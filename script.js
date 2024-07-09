// Select DOM elements
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const errorMessageDiv = document.querySelector(".error-message"); // Select error message element

// API key for OpenWeatherMap API
const API_KEY = "4eb3703790b356562054106543b748b2";

// Function to create weather card HTML
const createWeatherCard = (cityName, weatherItem, index) => {
    const date = weatherItem.dt_txt.split(" ")[0];
    const tempCelsius = (weatherItem.main.temp - 273.15).toFixed(2);
    const windSpeed = weatherItem.wind.speed;
    const humidity = weatherItem.main.humidity;
    const weatherIcon = weatherItem.weather[0].icon;
    const weatherDescription = weatherItem.weather[0].description;

    if (index === 0) {
        // Main weather card HTML
        return `<div class="details">
                    <h2>${cityName} (${date})</h2>
                    <h6>Nhiệt độ: ${tempCelsius}°C</h6>
                    <h6>Tốc độ gió: ${windSpeed} M/S</h6>
                    <h6>Độ ẩm: ${humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherIcon}@4x.png" alt="weather-icon">
                    <h6>${weatherDescription}</h6>
                </div>`;
    } else {
        // Other forecast cards HTML
        return `<li class="card">
                    <h3>(${date})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherIcon}@4x.png" alt="weather-icon">
                    <h6>Nhiệt Độ: ${tempCelsius}°C</h6>
                    <h6>Tốc độ gió: ${windSpeed} M/S</h6>
                    <h6>Độ ẩm: ${humidity}%</h6>
                </li>`;
    }
}

// Function to get weather details
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            // Filter forecasts to get one per day
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            // Clear previous weather data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";
            errorMessageDiv.textContent = ""; // Clear error message

            // Create and insert weather cards into DOM
            fiveDaysForecast.forEach((weatherItem, index) => {
                const html = createWeatherCard(cityName, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
}

// Function to get city coordinates
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (!data.length) {
                errorMessageDiv.textContent = `No coordinates found for ${cityName}`;
                return;
            }
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
}

// Function to get user's coordinates
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(API_URL)
                .then(response => response.json())
                .then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("An error occurred while fetching the city name!");
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        }
    );
}

// Event listeners
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => {
    errorMessageDiv.textContent = ""; // Clear error message on new input
    if (e.key === "Enter") {
        getCityCoordinates();
    }
});
