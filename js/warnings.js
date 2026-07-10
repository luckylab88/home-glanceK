(function(){
  var cachedWarning = null;
  var lastFetch = 0;

  function levelRank(level){
    level = String(level || "").toUpperCase();
    if(level.indexOf("RED") !== -1) return 3;
    if(level.indexOf("AMBER") !== -1) return 2;
    if(level.indexOf("YELLOW") !== -1) return 1;
    return 0;
  }

  function firstValue(obj,names){
    for(var i=0;i<names.length;i++){
      if(obj[names[i]] !== undefined && obj[names[i]] !== null) return obj[names[i]];
    }
    return "";
  }

  function normaliseFeature(feature){
    var p = feature.properties || feature.attributes || {};
    var level = String(firstValue(p,[
      "warningLevel","WarningLevel","WARNINGLEVEL","warning_level","level","Level"
    ]) || "").toUpperCase();

    var weather = firstValue(p,[
      "weatherType","WeatherType","WEATHERTYPE","weather_type","type","Type"
    ]);
    if(Array.isArray(weather)) weather = weather.join(" / ");
    weather = String(weather || "").replace(/_/g," ").toLowerCase()
      .replace(/\b\w/g,function(c){return c.toUpperCase();});

    var headline = String(firstValue(p,[
      "warningHeadline","WarningHeadline","WARNINGHEADLINE","headline","Headline"
    ]) || "");

    var validFrom = firstValue(p,["validFromDate","ValidFromDate","valid_from","start","Start"]);
    var validTo = firstValue(p,["validToDate","ValidToDate","valid_to","end","End"]);
    var now = Date.now();
    if(validFrom && new Date(validFrom).getTime() > now) return null;
    if(validTo && new Date(validTo).getTime() < now) return null;
    if(!levelRank(level)) return null;

    var main = level.charAt(0)+level.slice(1).toLowerCase()+" "+(weather || "Weather")+" Warning";
    return {
      level:level,
      rank:levelRank(level),
      main:main,
      sub:headline,
      source:"Met Office"
    };
  }

  function queryLayer(serviceUrl,layerId,lon,lat){
    var q = serviceUrl.replace(/\/+$/,"")+"/"+layerId+"/query";
    var params = [
      "where=1%3D1",
      "geometry="+encodeURIComponent(lon+","+lat),
      "geometryType=esriGeometryPoint",
      "inSR=4326",
      "spatialRel=esriSpatialRelIntersects",
      "outFields=*",
      "returnGeometry=false",
      "f=json"
    ].join("&");

    return fetch(q+"?"+params,{cache:"no-cache"}).then(function(r){
      if(!r.ok) throw new Error("layer");
      return r.json();
    }).then(function(data){
      var features = data.features || [];
      return features.map(normaliseFeature).filter(Boolean);
    });
  }

  function fetchWarning(){
    if(!window.HG_CONFIG.useMetOfficeWarnings) return Promise.resolve(null);
    if(cachedWarning && Date.now()-lastFetch < 15*60*1000) return Promise.resolve(cachedWarning);

    var itemId = window.HG_CONFIG.metOfficeArcgisItemId;
    var metaUrl = "https://www.arcgis.com/sharing/rest/content/items/"+itemId+"?f=json";

    return fetch(metaUrl,{cache:"no-cache"})
      .then(function(r){ if(!r.ok) throw new Error("item"); return r.json(); })
      .then(function(meta){
        if(!meta.url) throw new Error("service url");
        var jobs = [];
        for(var i=0;i<5;i++){
          jobs.push(queryLayer(meta.url,i,window.HG_CONFIG.longitude,window.HG_CONFIG.latitude)
            .catch(function(){ return []; }));
        }
        return Promise.all(jobs);
      })
      .then(function(groups){
        var warnings = [];
        groups.forEach(function(g){ warnings = warnings.concat(g); });
        warnings.sort(function(a,b){ return b.rank-a.rank; });
        cachedWarning = warnings[0] || null;
        lastFetch = Date.now();
        return cachedWarning;
      })
      .catch(function(){
        cachedWarning = null;
        lastFetch = Date.now();
        return null;
      });
  }

  window.HomeGlanceWarnings = {
    fetchWarning:fetchWarning,
    source:"Met Office NSWWS"
  };
})();