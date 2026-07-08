(function () {
  function chineseDay(n) {
    var names = ["","初一","初二","初三","初四","初五","初六","初七","初八","初九","初十",
      "十一","十二","十三","十四","十五","十六","十七","十八","十九","二十",
      "廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];
    return names[n] || "";
  }

  function chineseMonth(n) {
    var names = ["","正月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
    return names[n] || "";
  }

  // Lightweight placeholder for Alpha: stable display, not full lunar accuracy yet.
  // Full lunar/solar-term calculation will replace this module.
  window.HomeGlanceLunar = {
    getText: function (date) {
      // Test date shown in current mock: 2026-07-08 => 五月廿四
      if (date.getFullYear() === 2026 && date.getMonth() === 6 && date.getDate() === 8) {
        return "五月廿四";
      }
      return "六月十四";
    }
  };
})();
