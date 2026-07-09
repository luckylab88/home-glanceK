(function () {
  var lastUpdated = null;

  function el(id) { return document.getElementById(id); }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function formatDate(d) {
    var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return days[d.getDay()] + " · " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  function timeInZone(zone) {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: zone, hour: "2-digit", minute: "2-digit", hour12: false
    }).format(new Date());
  }

  function updateClock() {
    var d = new Date();
    el("time").textContent = pad(d.getHours()) + ":" + pad(d.getMinutes());
    el("date").textContent = formatDate(d);
    el("hk-time").textContent = "HK " + timeInZone("Asia/Hong_Kong");
    el("ny-time").textContent = "NY " + timeInZone("America/New_York");
    el("lunar").textContent = window.HomeGlanceLunar.getText(d);
    updateUpdatedText();
  }

  function updateUpdatedText() {
    if (!lastUpdated) return;
    var mins = Math.floor((new Date() - lastUpdated) / 60000);
    var footer = el("updated");
    if (mins < 1) footer.textContent = "Updated just now";
    else if (mins < 60) footer.textContent = "Updated " + mins + " min ago";
    else footer.textContent = "Updated " + Math.floor(mins / 60) + " hr ago";
    footer.className = mins >= 30 ? "stale" : "";
  }

  function dayName(dateString) {
    var d = new Date(dateString + "T12:00:00");
    return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
  }

  function renderForecast(days) {
    var grid = el("forecast-grid");
    grid.innerHTML = "";
    var lows = days.map(function (d) { return d.low; });
    var highs = days.map(function (d) { return d.high; });
    var min = Math.min.apply(null, lows);
    var max = Math.max.apply(null, highs);
    var range = Math.max(1, max - min);

    days.forEach(function (d) {
      var row = document.createElement("div");
      row.className = "forecast-row";

      var start = Math.round(((d.low - min) / range) * 100);
      var width = Math.max(10, Math.round(((d.high - d.low) / range) * 100));

      row.innerHTML =
        "<div>" + dayName(d.date) + "</div>" +
        "<div class='forecast-icon'>" + d.icon + "</div>" +
        "<div>" + d.low + "°</div>" +
        "<div class='bar'><div class='bar-fill' style='left:" + start + "%;width:" + width + "%'></div></div>" +
        "<div>" + d.high + "°</div>";
      grid.appendChild(row);
    });
  }

  function setMainIconClass(w) {
    var icon = el("main-icon");
    icon.className.baseVal = "weather-icon sun";
    if (w.code >= 51 && w.code <= 82) icon.className.baseVal = "weather-icon rain";
    else if (w.code >= 2 && w.code <= 48) icon.className.baseVal = "weather-icon cloud";
    else if (w.high >= 30) icon.className.baseVal = "weather-icon hot";
  }

  function renderWeather(w) {
    setMainIconClass(w);
    el("temp").textContent = w.temp + "°";
    el("desc").textContent = "Feels " + w.feels + "° • " + w.desc;
    el("high").textContent = "▲ " + w.high + "°";
    el("low").textContent = "▼ " + w.low + "°";
    el("sunset").textContent = "Sunset " + w.sunset;
    el("status").textContent = w.status;
    el("status").className = w.rainSoon ? "status rain" : "status";
    el("today-detail").textContent = w.high + "° / " + w.low + "°";
    el("today-sub").textContent = "Humidity " + w.humidity + "%";

    var ev = window.HomeGlanceEvent.getEvent(w);
    el("event-main").textContent = ev.main;
    el("event-sub").textContent = ev.sub;
    el("event-main").className = ev.type === "hot" ? "card-main hot" : "card-main";

    renderForecast(w.forecast);
    lastUpdated = new Date();
    updateUpdatedText();
  }

  function refreshWeather() {
    window.HomeGlanceWeather.fetchWeather().then(renderWeather).catch(function () {
      if (!lastUpdated) el("status").textContent = "Weather unavailable";
      updateUpdatedText();
    });
  }

  updateClock();
  refreshWeather();
  setInterval(updateClock, 60000);
  setInterval(refreshWeather, (window.HG_CONFIG.updateWeatherMinutes || 15) * 60000);
})();
