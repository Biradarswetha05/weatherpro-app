const apiKey = "f8d05d7412d826a47ac4e3416ee81643";

// Enter key
document.getElementById("city").addEventListener("keypress", e => {
    if (e.key === "Enter") getWeather();
});

function showLoading() {
    document.getElementById("loading").classList.remove("hidden");
}

function hideLoading() {
    document.getElementById("loading").classList.add("hidden");
}

// Get Weather (Improved)
async function getWeather() {
    let city = document.getElementById("city").value.trim();

    if (!city) {
        alert("Enter city name");
        return;
    }

    showLoading();
    document.getElementById("mainWeather").innerHTML = "⏳ Loading...";

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );

        const data = await res.json();
        hideLoading();

        if (parseInt(data.cod) !== 200) {
            document.getElementById("mainWeather").innerHTML = "❌ City not found";
            document.getElementById("forecast").innerHTML = "";
            return;
        }

        displayWeather(data);

        // ✅ Use coordinates for accurate forecast
        getForecastByCoords(data.coord.lat, data.coord.lon);

    } catch {
        hideLoading();
        document.getElementById("mainWeather").innerHTML = "⚠️ Error fetching data";
    }
}

// Location Weather (Improved)
function getLocationWeather() {
    navigator.geolocation.getCurrentPosition(
        async pos => {
            showLoading();

            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            try {
                const res = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
                );

                const data = await res.json();
                hideLoading();

                displayWeather(data);
                getForecastByCoords(lat, lon);

            } catch {
                hideLoading();
                alert("Error getting location weather");
            }
        },
        () => {
            alert("Location permission denied ❌");
        }
    );
}

// Convert time
function formatTime(unix) {
    return new Date(unix * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Display Weather
function displayWeather(data) {
    const { name, sys, wind, coord } = data;
    const temp = Math.round(data.main.temp);
    const feels = Math.round(data.main.feels_like);
    const weather = data.weather[0].description.toLowerCase();
    const humidity = data.main.humidity;
    const pressure = data.main.pressure;
    const icon = data.weather[0].icon;

    const sunrise = formatTime(sys.sunrise);
    const sunset = formatTime(sys.sunset);

    const date = new Date().toLocaleString();

    // 🌈 Dynamic background
    if (weather.includes("cloud")) {
        document.body.style.background = "linear-gradient(135deg, #636e72, #2d3436)";
    } 
    else if (weather.includes("rain")) {
        document.body.style.background = "linear-gradient(135deg, #2c3e50, #4ca1af)";
    } 
    else if (weather.includes("clear")) {
        document.body.style.background = "linear-gradient(135deg, #f7971e, #ffd200)";
    } 
    else {
        document.body.style.background = "linear-gradient(135deg, #0f172a, #1e293b)";
    }

    document.getElementById("mainWeather").innerHTML = `
        <div class="city">${name}, ${sys.country}</div>
        <p>${date}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png">
        <div class="temp">${temp}°C</div>
        <div class="desc">${weather}</div>

        <p>Feels like: ${feels}°C</p>
        <p>📍 ${coord.lat.toFixed(2)}, ${coord.lon.toFixed(2)}</p>

        <p style="font-size:12px; opacity:0.7;">Data powered by OpenWeather</p>
    `;

    document.getElementById("extra").innerHTML = `
        <div class="card">💧 ${humidity}%</div>
        <div class="card">🌬 ${wind.speed} m/s</div>
        <div class="card">📊 ${pressure} hPa</div>
        <div class="card">🌅 ${sunrise}</div>
        <div class="card">🌇 ${sunset}</div>
    `;
}

// Forecast using coordinates (MORE ACCURATE)
async function getForecastByCoords(lat, lon) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        const data = await res.json();

        let forecastHTML = "";

        for (let i = 0; i < data.list.length; i += 8) {
            const item = data.list[i];

            const dateObj = new Date(item.dt_txt);

            const day = dateObj.toLocaleDateString("en-US", {
                weekday: "short"
            });

            const temp = Math.round(item.main.temp);
            const icon = item.weather[0].icon;

            forecastHTML += `
                <div class="forecast-card">
                    <div class="day">${day}</div>
                    <img src="https://openweathermap.org/img/wn/${icon}.png">
                    <div class="forecast-temp">${temp}°</div>
                </div>
            `;
        }

        document.getElementById("forecast").innerHTML = forecastHTML;

    } catch {
        document.getElementById("forecast").innerHTML = "⚠️ Forecast unavailable";
    }
}
window.onload = () => {
    // Clear previous data
    document.getElementById("mainWeather").innerHTML = `
        <div style="text-align:center; opacity:0.7; padding:20px;">
            🌤 <h3>Welcome to WeatherPro</h3>
            <p>Search for a city to get real-time weather updates</p>
        </div>
    `;

    document.getElementById("forecast").innerHTML = "";

    // Clear input field
    document.getElementById("city").value = "";
};
