(function() {

  const eventNames = [
    'xr-button-click', 
    'xr-button-off',
    'xr-button-on',
    'xr-click', 
    'xr-grabend', 
    'xr-grabstart',  
    'xr-on', 
  ];

  function on(evt) {
    console.log('[xr event]', evt); // eslint-disable-line no-console
  }

  AFRAME.registerComponent('xr-inspect', {
    schema: {},
    init: function() {
      const el = this.el;
      eventNames.forEach(function(eName) {
        el.addEventListener(eName, on);
      });
    },
    remove: function() {
      const el = this.el;
      eventNames.forEach(function(eName) {
        el.removeEventListener(eName, on);
      });
    },
  });
})();
