(function() {
  window.BMAP_PROTOCOL = "https";
  window.BMap_loadScriptTime = (new Date).getTime();
  window.BMap = window.BMap || {};
  window.BMap.apiLoad = function() {
      delete window.BMap.apiLoad;
      if (typeof _initBaiduMap == "function") {
          _initBaiduMap()
      }
  }
  ;
  var s = document.createElement('script');
  s.src = window.location.pathname + 'common/js/myMap.js';
  document.body.appendChild(s);
}
)();
