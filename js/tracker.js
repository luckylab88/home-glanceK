(function(){
  var state={
    status:"not-loaded",
    today:null,
    tomorrow:null,
    lastUpdated:null,
    nextCheck:null
  };

  function pad(n){return n<10?"0"+n:""+n;}

  function localDateKey(date){
    var parts=new Intl.DateTimeFormat("en-CA",{
      timeZone:"Europe/London",
      year:"numeric",month:"2-digit",day:"2-digit"
    }).formatToParts(date);
    var y="",m="",d="";
    parts.forEach(function(p){
      if(p.type==="year")y=p.value;
      if(p.type==="month")m=p.value;
      if(p.type==="day")d=p.value;
    });
    return y+"-"+m+"-"+d;
  }

  function tomorrowKey(){
    var d=new Date();
    d.setTime(d.getTime()+36*60*60*1000);
    return localDateKey(d);
  }

  function buildUrl(){
    var c=window.HG_CONFIG;
    var product=c.trackerProductCode;
    var region=c.trackerRegionCode;
    var tariff="E-1R-"+product+"-"+region;
    return "https://api.octopus.energy/v1/products/"+encodeURIComponent(product)+
      "/electricity-tariffs/"+encodeURIComponent(tariff)+
      "/standard-unit-rates/?page_size=20";
  }

  function parseResults(results){
    var todayKey=localDateKey(new Date());
    var nextKey=tomorrowKey();
    var byDate={};

    (results||[]).forEach(function(row){
      var dateKey=localDateKey(new Date(row.valid_from));
      if(byDate[dateKey]===undefined && row.value_inc_vat!==undefined){
        byDate[dateKey]=Number(row.value_inc_vat);
      }
    });

    state.today=byDate[todayKey]!==undefined?byDate[todayKey]:null;
    state.tomorrow=byDate[nextKey]!==undefined?byDate[nextKey]:null;
  }

  function load(force){
    if(!window.HG_CONFIG.trackerEnabled){
      state.status="disabled";
      return Promise.resolve(state);
    }

    state.status="loading";
    return fetch(buildUrl(),{cache:force?"reload":"no-cache"})
      .then(function(r){
        if(!r.ok)throw new Error("Octopus HTTP "+r.status);
        return r.json();
      })
      .then(function(data){
        parseResults(data.results);
        state.status=state.today===null?"no-price":"ok";
        state.lastUpdated=new Date();
        state.nextCheck=new Date(
          Date.now()+(window.HG_CONFIG.trackerRefreshMinutes||30)*60000
        );
        return state;
      })
      .catch(function(){
        state.status="failed";
        state.lastUpdated=new Date();
        state.nextCheck=new Date(
          Date.now()+(window.HG_CONFIG.trackerRefreshMinutes||30)*60000
        );
        return state;
      });
  }

  function getState(){return state;}

  window.HomeGlanceTracker={
    load:load,
    getState:getState,
    source:"Octopus Energy public tariff API"
  };
})();