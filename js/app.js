(function(){
  var lastUpdated=null,lastWeather=null;
  function el(id){return document.getElementById(id);} function pad(n){return n<10?"0"+n:""+n;}
  function formatDate(d){var days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];return days[d.getDay()]+" · "+d.getDate()+" "+months[d.getMonth()]+" "+d.getFullYear();}
  function timeInZone(zone){return new Intl.DateTimeFormat("en-GB",{timeZone:zone,hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date());}
  function nudgePage(){var p=el("page");if(!p)return;var offsets=[[-1,0],[0,1],[1,0],[0,-1],[1,1],[-1,-1],[0,0]],o=offsets[new Date().getMinutes()%offsets.length];p.style.transform="translate("+o[0]+"px,"+o[1]+"px)";}
  function updateClock(){
    var d=new Date(),h=pad(d.getHours()),m=pad(d.getMinutes());
    el("time").innerHTML=h+'<span class="colon">:</span>'+m;
    el("date").textContent=formatDate(d); el("hk-time").textContent="HK "+timeInZone("Asia/Hong_Kong"); el("ny-time").textContent="NY "+timeInZone("America/New_York");
    el("lunar").textContent=window.HomeGlanceLunar.getText(d);
    var term=window.HomeGlanceLunar.getSolarTerm(d),wrap=el("solar-term-wrap");
    if(window.HG_CONFIG.showSolarTerm&&term){el("solar-term").textContent=term;wrap.style.display="inline";}else wrap.style.display="none";
    if(lastWeather) updateSunEvent(lastWeather,d);
    nudgePage(); updateUpdatedText();
  }
  function updateSunEvent(w,now){
    var sunrise=new Date(w.sunrise),sunset=new Date(w.sunset),nextSunrise=new Date(w.nextSunrise),label,time;
    if(now<sunrise){label="Sunrise";time=window.HomeGlanceWeather.timePart(w.sunrise);}
    else if(now<sunset){label="Sunset";time=window.HomeGlanceWeather.timePart(w.sunset);}
    else{label="Sunrise";time=window.HomeGlanceWeather.timePart(w.nextSunrise);}
    el("sunset").textContent=label+" "+time;
  }
  function updateUpdatedText(){if(!lastUpdated)return;var mins=Math.floor((new Date()-lastUpdated)/60000),footer=el("updated");if(mins<1)footer.textContent="Updated just now";else if(mins<60)footer.textContent="Updated "+mins+" min ago";else footer.textContent="Updated "+Math.floor(mins/60)+" hr ago";footer.className=mins>=30?"stale":"";}
  function dayName(s){var d=new Date(s+"T12:00:00");return["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];}
  function renderForecast(days){var grid=el("forecast-grid");grid.innerHTML="";var lows=days.map(function(d){return d.low;}),highs=days.map(function(d){return d.high;}),min=Math.min.apply(null,lows),max=Math.max.apply(null,highs),range=Math.max(1,max-min);days.forEach(function(d){var row=document.createElement("div");row.className="forecast-row";var start=Math.round(((d.low-min)/range)*100),width=Math.max(10,Math.round(((d.high-d.low)/range)*100));row.innerHTML="<div>"+dayName(d.date)+"</div><div class='forecast-icon'>"+d.icon+"</div><div>"+d.low+"°</div><div class='bar'><div class='bar-fill' style='left:"+start+"%;width:"+width+"%'></div></div><div>"+d.high+"°</div>";grid.appendChild(row);});}
  function uvColor(uv){if(uv<=2)return"#2e7d32";if(uv<=5)return"#b8860b";if(uv<=7)return"#d2691e";if(uv<=10)return"#b22222";return"#6a1b9a";}
  function renderNotice(w){
    var notice=window.HomeGlanceEvent.getNotice(w),main=el("event-main"),sub=el("event-sub");
    main.className="card-main"; sub.className="card-sub";
    if(notice){main.textContent=notice.main;sub.textContent=notice.sub;main.className="card-main "+notice.type;}
    else{var q=window.HomeGlanceQuotes.pick(new Date());main.textContent=q.emoji+" "+q.text;sub.textContent="";main.className="card-main quote";}
  }
  function renderWeather(w){
    lastWeather=w; document.documentElement.style.setProperty("--accent",(w.theme&&w.theme.accent)||"#bf7b00");
    el("temp").textContent=w.temp+"°"; el("feels").textContent="Feels "+w.feels+"°"; el("weather-desc").textContent=w.desc;
    el("high").textContent="▲ "+w.high+"°"; el("low").textContent="▼ "+w.low+"°"; updateSunEvent(w,new Date());
    el("status").textContent=w.status; el("status").className=w.rainSoon?"status rain":"status";
    el("today-detail").textContent=w.high+"° / "+w.low+"°"; el("today-sub").textContent="UV "+w.uv; el("today-sub").style.color=uvColor(w.uv);
    renderNotice(w); renderForecast(w.forecast); lastUpdated=new Date(); updateUpdatedText();
  }
  function refreshWeather(){window.HomeGlanceWeather.fetchWeather().then(renderWeather).catch(function(){if(!lastUpdated)el("status").textContent="Weather unavailable";updateUpdatedText();});}
  function start(){window.HomeGlanceQuotes.load().then(function(){updateClock();refreshWeather();});setInterval(updateClock,60000);setInterval(refreshWeather,(window.HG_CONFIG.updateWeatherMinutes||15)*60000);}
  start();
})();