(function(){
  function monthName(n){return["","正月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"][n]||"";}
  function dayName(n){return["","初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"][n]||"";}
  function parseIntl(date){try{var parts=new Intl.DateTimeFormat("en-u-ca-chinese",{month:"numeric",day:"numeric"}).formatToParts(date);var m=null,d=null;for(var i=0;i<parts.length;i++){if(parts[i].type==="month")m=parseInt(parts[i].value,10);if(parts[i].type==="day")d=parseInt(parts[i].value,10);}if(m&&d)return monthName(m)+dayName(d);}catch(e){}return "";}
  var terms=[
    ["01-05","小寒"],["01-20","大寒"],["02-04","立春"],["02-19","雨水"],["03-05","驚蟄"],["03-20","春分"],
    ["04-04","清明"],["04-20","穀雨"],["05-05","立夏"],["05-21","小滿"],["06-05","芒種"],["06-21","夏至"],
    ["07-07","小暑"],["07-22","大暑"],["08-07","立秋"],["08-23","處暑"],["09-07","白露"],["09-23","秋分"],
    ["10-08","寒露"],["10-23","霜降"],["11-07","立冬"],["11-22","小雪"],["12-07","大雪"],["12-21","冬至"]
  ];
  function md(date){return (date.getMonth()+1<10?"0":"")+(date.getMonth()+1)+"-"+(date.getDate()<10?"0":"")+date.getDate();}
  function currentSolarTerm(date){
    var s=md(date), current=terms[terms.length-1][1];
    for(var i=0;i<terms.length;i++){ if(s>=terms[i][0]) current=terms[i][1]; else break; }
    return current;
  }
  window.HomeGlanceLunar={
    getText:function(date){return parseIntl(date)||"農曆";},
    getSolarTerm:function(date){return currentSolarTerm(date);}
  };
})();