
(function() {

  const eventNames = ['xr-grabstart',  'xr-grabend', 'xr-on', 'xr-click'];

  function on(evt) {
    console.log('[xr event]', evt); // eslint-disable-line no-console
  }

  AFRAME.registerComponent('inspect', {
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
