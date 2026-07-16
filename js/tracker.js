(function(){
  var state={
    status:"not-loaded",
    region:null,
    today:null,
    tomorrow:null,
    lastUpdated:null,
    nextCheck:null
  };

  function postcodeUrl(){
    return "https://api.octopus.energy/v1/industry/grid-supply-points/?postcode="+
      encodeURIComponent(window.HG_CONFIG.trackerPostcode);
  }

  function ratesUrl(region){
    var product=window.HG_CONFIG.trackerProductCode;
    var tariff="E-1R-"+product+"-"+region;

    return "https://api.octopus.energy/v1/products/"+
      encodeURIComponent(product)+
      "/electricity-tariffs/"+
      encodeURIComponent(tariff)+
      "/standard-unit-rates/?page_size=10";
  }

  function getJSON(url,force){
    return fetch(url,{cache:force?"reload":"no-cache"}).then(function(response){
      if(!response.ok){
        throw new Error("Octopus HTTP "+response.status);
      }
      return response.json();
    });
  }

  function getRegion(force){
    return getJSON(postcodeUrl(),force).then(function(data){
      if(!data.results || !data.results.length || !data.results[0].group_id){
        throw new Error("Octopus region unavailable");
      }

      // Same conversion as the working Scriptable shortcut.
      return String(data.results[0].group_id).replace("_","");
    });
  }

  function getRates(region,force){
    return getJSON(ratesUrl(region),force).then(function(data){
      return data.results || [];
    });
  }

  function readTodayTomorrow(results){
    // Exact working Shortcut logic:
    // Octopus API returns newest first.
    if(!results || results.length<2){
      return {today:null,tomorrow:null};
    }

    return {
      today:Number(results[1].value_inc_vat),
      tomorrow:Number(results[0].value_inc_vat)
    };
  }

  function load(force){
    if(!window.HG_CONFIG.trackerEnabled){
      state.status="disabled";
      return Promise.resolve(state);
    }

    state.status="loading";

    return getRegion(!!force)
      .then(function(region){
        state.region=region;
        return getRates(region,!!force);
      })
      .then(function(results){
        var prices=readTodayTomorrow(results);

        state.today=isFinite(prices.today)?prices.today:null;
        state.tomorrow=isFinite(prices.tomorrow)?prices.tomorrow:null;
        state.status=state.today===null?"no-price":"ok";
        state.lastUpdated=new Date();
        state.nextCheck=new Date(
          Date.now()+(window.HG_CONFIG.trackerRefreshMinutes||30)*60000
        );

        return state;
      })
      .catch(function(error){
        console.error("Tracker:",error);
        state.status="failed";
        state.today=null;
        state.tomorrow=null;
        state.lastUpdated=new Date();
        state.nextCheck=new Date(
          Date.now()+(window.HG_CONFIG.trackerRefreshMinutes||30)*60000
        );
        return state;
      });
  }

  function getState(){
    return state;
  }

  window.HomeGlanceTracker={
    load:load,
    getState:getState,
    source:"Octopus Energy public tariff API"
  };
})();