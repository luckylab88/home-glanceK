(function () {
  window.HomeGlanceEvent = {
    getEvent: function (weather) {
      if (weather && weather.uv >= 6 && weather.high >= 28) {
        return { main: "Heat Alert", sub: "High UV" };
      }
      return { main: "No events", sub: "Today" };
    }
  };
})();
