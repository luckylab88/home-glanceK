(function(){
  function monthName(n){
    return ["","正月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"][n] || "";
  }
  function dayName(n){
    return ["","初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"][n] || "";
  }
  function parseIntl(date){
    try{
      var parts=new Intl.DateTimeFormat("en-u-ca-chinese",{month:"numeric",day:"numeric"}).formatToParts(date);
      var m=null,d=null;
      for(var i=0;i<parts.length;i++){
        if(parts[i].type==="month") m=parseInt(parts[i].value,10);
        if(parts[i].type==="day") d=parseInt(parts[i].value,10);
      }
      if(m&&d) return monthName(m)+dayName(d);
    }catch(e){}
    return "";
  }

  var termNames=["小寒","大寒","立春","雨水","驚蟄","春分","清明","穀雨","立夏","小滿","芒種","夏至","小暑","大暑","立秋","處暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"];
  var targetAngles=[285,300,315,330,345,360,375,390,405,420,435,450,465,480,495,510,525,540,555,570,585,600,615,630];
  var cache={};

  function norm(a){ a%=360; return a<0?a+360:a; }
  function julianDay(ms){ return ms/86400000 + 2440587.5; }
  function solarLongitude(ms){
    var jd=julianDay(ms), T=(jd-2451545.0)/36525;
    var L0=norm(280.46646 + 36000.76983*T + 0.0003032*T*T);
    var M=norm(357.52911 + 35999.05029*T - 0.0001537*T*T);
    var Mr=M*Math.PI/180;
    var C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(Mr)
      +(0.019993-0.000101*T)*Math.sin(2*Mr)
      +0.000289*Math.sin(3*Mr);
    var trueLong=L0+C;
    var omega=(125.04-1934.136*T)*Math.PI/180;
    return norm(trueLong-0.00569-0.00478*Math.sin(omega));
  }
  function unwrappedLongitude(ms){
    var lon=solarLongitude(ms);
    var jan1=Date.UTC(new Date(ms).getUTCFullYear(),0,1,0,0,0);
    var lon0=solarLongitude(jan1);
    var days=(ms-jan1)/86400000;
    var expected=lon0+days*0.98564736;
    while(lon<expected-180) lon+=360;
    while(lon>expected+180) lon-=360;
    return lon;
  }
  function hkDateKey(date){
    try{
      var parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Hong_Kong",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
      var y="",m="",d="";
      for(var i=0;i<parts.length;i++){
        if(parts[i].type==="year") y=parts[i].value;
        if(parts[i].type==="month") m=parts[i].value;
        if(parts[i].type==="day") d=parts[i].value;
      }
      return y+"-"+m+"-"+d;
    }catch(e){
      return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
    }
  }
  function buildTerms(year){
    if(cache[year]) return cache[year];
    var result={};
    var start=Date.UTC(year,0,1,0,0,0), end=Date.UTC(year+1,0,1,0,0,0);
    for(var i=0;i<targetAngles.length;i++){
      var target=targetAngles[i];
      var lo=start, hi=end;
      for(var n=0;n<50;n++){
        var mid=(lo+hi)/2;
        if(unwrappedLongitude(mid)<target) lo=mid; else hi=mid;
      }
      result[hkDateKey(new Date((lo+hi)/2))]=termNames[i];
    }
    cache[year]=result;
    return result;
  }
  function getSolarTerm(date){
    var key=hkDateKey(date), y=parseInt(key.slice(0,4),10);
    return buildTerms(y)[key] || "";
  }
  window.HomeGlanceLunar={getText:function(date){return parseIntl(date)||"農曆";},getSolarTerm:getSolarTerm};
})();