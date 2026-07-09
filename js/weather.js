(function () {
  var weatherDescriptions = {
    0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Cloudy",
    45: "Fog", 48: "Fog", 51: "Drizzle", 53: "Drizzle", 55: "Drizzle",
    61: "Rain", 63: "Rain", 65: "Heavy Rain", 71: "Snow", 73: "Snow",
    75: "Heavy Snow", 80: "Showers", 81: "Showers", 82: "Heavy Showers",
    95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm"
  };

  function codeToIcon(code) {
    if (code === 0 || code === 1) return "☀";
    if (code === 2 || code === 3) return "☁";
    if (code >= 51 && code <= 82) return "☂";
    if (code >= 71 && code <= 75) return "❄";
    if (code >= 95) return "!";
    return "○";
  }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function timePart(iso) {
    var d = new Date(iso);
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function fetchWeather() {
    var c = window.HG_CONFIG;
    var params = [
      "latitude=" + c.latitude,
      "longitude=" + c.longitude,
      "timezone=auto",
      "current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code",
      "hourly=precipitation,precipitation_probability",
      "daily=weather_code,temperature_2m_max,temperature_2m_min,sunset,uv_index_max",
      "forecast_days=10"
    ].join("&");

    return fetch("https://api.open-meteo.com/v1/forecast?" + params)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var current = data.current || {};
        var daily = data.daily || {};
        var hourly = data.hourly || {};
        var now = new Date();

        var rainText = "Humidity " + Math.round(current.relative_humidity_2m || 0) + "%";
        var rainSoon = false;
        if (hourly.time && hourly.precipitation) {
          for (var i = 0; i < hourly.time.length; i++) {
            var t = new Date(hourly.time[i]);
            var minutes = Math.round((t - now) / 60000);
            if (minutes >= 0 && minutes <= 60 && hourly.precipitation[i] > 0) {
              rainText = "Rain in " + minutes + " min";
              rainSoon = true;
              break;
            }
          }
        }

        return {
          temp: Math.round(current.temperature_2m),
          feels: Math.round(current.apparent_temperature),
          humidity: Math.round(current.relative_humidity_2m),
          desc: weatherDescriptions[current.weather_code] || "Weather",
          code: current.weather_code,
          high: Math.round(daily.temperature_2m_max[0]),
          low: Math.round(daily.temperature_2m_min[0]),
          sunset: timePart(daily.sunset[0]),
          uv: Math.round(daily.uv_index_max[0] || 0),
          status: rainText,
          rainSoon: rainSoon,
          forecast: daily.time.map(function (date, i) {
            return {
              date: date,
              code: daily.weather_code[i],
              icon: codeToIcon(daily.weather_code[i]),
              high: Math.round(daily.temperature_2m_max[i]),
              low: Math.round(daily.temperature_2m_min[i])
            };
          })
        };
      });
  }

  window.HomeGlanceWeather = {
    fetchWeather: fetchWeather,
    icon: codeToIcon
  };
})();
