(function () {
  function clean(text) {
    if (!text) return "";
    text = text.replace(/\s/g, "");
    text = text.replace(/[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]/g, "");
    text = text.replace(/年/g, "");
    return text;
  }
  function tryIntlChineseDate(date) {
    try {
      var raw = new Intl.DateTimeFormat("zh-Hant-u-ca-chinese", { month: "long", day: "numeric" }).format(date);
      return clean(raw);
    } catch (e) { return ""; }
  }
  window.HomeGlanceLunar = {
    getText: function (date) {
      var text = tryIntlChineseDate(date);
      if (text && text.length <= 8 && text.indexOf("M") === -1) return text;
      return "農曆";
    }
  };
})();
