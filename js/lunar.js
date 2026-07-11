(function(){
  var calendarByDate = {};
  var loadedYear = null;
  var sourceStatus = "not-loaded";

  var monthNames = ["","正月","二月","三月","四月","五月","六月",
    "七月","八月","九月","十月","十一月","十二月"];
  var dayNames = ["","初一","初二","初三","初四","初五","初六","初七","初八","初九","初十",
    "十一","十二","十三","十四","十五","十六","十七","十八","十九","二十",
    "廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];

  var termMap = {
    "Moderate Cold":"小寒","Severe Cold":"大寒","Spring Commences":"立春",
    "Spring Showers":"雨水","Insects Waken":"驚蟄","Vernal Equinox":"春分",
    "Bright & Clear":"清明","Corn Rain":"穀雨","Summer Commences":"立夏",
    "Corn Forms":"小滿","Corn on Ear":"芒種","Summer Solstice":"夏至",
    "Moderate Heat":"小暑","Great Heat":"大暑","Autumn Commences":"立秋",
    "End of Heat":"處暑","White Dew":"白露","Autumnal Equinox":"秋分",
    "Cold Dew":"寒露","Frost":"霜降","Winter Commences":"立冬",
    "Light Snow":"小雪","Heavy Snow":"大雪","Winter Solstice":"冬至"
  };

  function pad(n){ return n < 10 ? "0" + n : "" + n; }
  function key(date){
    return date.getFullYear()+"-"+pad(date.getMonth()+1)+"-"+pad(date.getDate());
  }

  function parseIntl(date){
    try{
      var parts = new Intl.DateTimeFormat("en-u-ca-chinese",{
        month:"numeric",day:"numeric"
      }).formatToParts(date);
      var m=null,d=null;
      for(var i=0;i<parts.length;i++){
        if(parts[i].type==="month") m=parseInt(parts[i].value,10);
        if(parts[i].type==="day") d=parseInt(parts[i].value,10);
      }
      if(m && d) return monthNames[m]+dayNames[d];
    }catch(e){}
    return "農曆";
  }

  function cleanText(text){
    return text
      .replace(/\r/g,"\n")
      .replace(/\u00a0/g," ")
      .replace(/[ \t]+/g," ")
      .replace(/\n{2,}/g,"\n");
  }

  function parseHkoText(text){
    text = cleanText(text);
    var result = {};
    var currentMonth = null;
    var isLeapMonth = false;

    // Match each dated row, keeping all text until the next dated row.
    var re = /(\d{4})\/(\d{1,2})\/(\d{1,2})\s+([\s\S]*?)(?=\d{4}\/\d{1,2}\/\d{1,2}\s+|$)/g;
    var match;

    while((match = re.exec(text)) !== null){
      var y=+match[1], m=+match[2], d=+match[3];
      var body = match[4].replace(/\s+/g," ").trim();
      var lunarDay = null;

      // HKO may describe the first day as "1st Lunar Month"
      // and leap months with "Intercalary" / "Leap".
      var monthMatch = body.match(/(?:(Intercalary|Leap)\s+)?(\d{1,2})(?:st|nd|rd|th)\s+Lunar Month/i);
      if(monthMatch){
        isLeapMonth = !!monthMatch[1];
        currentMonth = parseInt(monthMatch[2],10);
        lunarDay = 1;
      }else{
        var dayMatch = body.match(/^(\d{1,2})\b/);
        if(dayMatch) lunarDay = parseInt(dayMatch[1],10);
      }

      var solarTerm = "";
      for(var english in termMap){
        if(Object.prototype.hasOwnProperty.call(termMap,english) && body.indexOf(english) !== -1){
          solarTerm = termMap[english];
          break;
        }
      }

      var lunar = "";
      if(currentMonth && lunarDay){
        lunar = (isLeapMonth ? "閏" : "") + monthNames[currentMonth] + dayNames[lunarDay];
      }

      result[y+"-"+pad(m)+"-"+pad(d)] = {
        lunar:lunar,
        solarTerm:solarTerm
      };
    }
    return result;
  }

  function load(year,force){
    if(!force && loadedYear===year && Object.keys(calendarByDate).length){
      return Promise.resolve();
    }

    var cacheKey="homeglance-hko-calendar-"+year+"-v2";
    if(!force){
      try{
        var cached=localStorage.getItem(cacheKey);
        if(cached){
          calendarByDate=JSON.parse(cached);
          loadedYear=year;
          sourceStatus="hko-cache";
          return Promise.resolve();
        }
      }catch(e){}
    }

    var url="https://www.weather.gov.hk/en/gts/time/calendar/text/files/T"+year+"e.txt";
    return fetch(url,{cache:"no-cache"})
      .then(function(r){
        if(!r.ok) throw new Error("HKO HTTP "+r.status);
        return r.text();
      })
      .then(function(text){
        var parsed=parseHkoText(text);
        if(Object.keys(parsed).length < 360) throw new Error("HKO parse incomplete");
        calendarByDate=parsed;
        loadedYear=year;
        sourceStatus="hko-live";
        try{ localStorage.setItem(cacheKey,JSON.stringify(parsed)); }catch(e){}
      })
      .catch(function(){
        calendarByDate={};
        loadedYear=year;
        sourceStatus="intl-fallback";
      });
  }

  function getText(date){
    var item=calendarByDate[key(date)];
    return item && item.lunar ? item.lunar : parseIntl(date);
  }

  function getSolarTerm(date){
    var item=calendarByDate[key(date)];
    return item && item.solarTerm ? item.solarTerm : "";
  }

  function getStatus(){ return sourceStatus; }

  window.HomeGlanceLunar={
    load:load,
    getText:getText,
    getSolarTerm:getSolarTerm,
    getStatus:getStatus,
    source:"Hong Kong Observatory"
  };
})();