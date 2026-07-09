(function(){
  function monthName(n){return["","正月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"][n]||"";}
  function dayName(n){return["","初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"][n]||"";}
  function parseIntl(date){
    try{
      var parts=new Intl.DateTimeFormat("en-u-ca-chinese",{month:"numeric",day:"numeric"}).formatToParts(date);
      var m=null,d=null;
      for(var i=0;i<parts.length;i++){
        if(parts[i].type==="month")m=parseInt(parts[i].value,10);
        if(parts[i].type==="day")d=parseInt(parts[i].value,10);
      }
      if(m&&d)return monthName(m)+dayName(d);
    }catch(e){}
    return "";
  }
  window.HomeGlanceLunar={getText:function(date){
    var s=parseIntl(date);
    return s||"農曆";
  }};
})();