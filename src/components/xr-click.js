/*

Trigger a click event.

Implemented for:

[x] 360 mouse interaction
[] gaze
[] controller
[] laser


Events:

- xr-click, when a click is registered.

Examples:

```
<a-sphere position="0 1.5 -5" color="#F4F7F2" xr-click>
</a-sphere>
```

*/

(function() {
  const clazz = 'class-xr-click';
  const cursorAttr = {
    fuse: false,
    rayOrigin: 'mouse',
  };
  const raycasterAttr = {
    interval: 250,
    objects: '.' + clazz,
  };

  function mousedown(_evt) {
    this.el.emit('xr-click');
  }

  function findComponent(elements, compName) {
    for (var i = 0; i < elements.length; i++) {
      const e = elements[i];
      if (compName in e.components) {
        return e;
      }
    }
    return null;
  }

  function renderstart(evt) {
    const camera = evt.target.camera;
    const camEl = camera.el;
    const raycaster = findComponent(camEl.children, 'raycaster');
    const cursor = findComponent(camEl.children, 'cursor');
    if (raycaster || cursor) {
      if (cursor) {
        cursor.setAttribute('cursor', cursorAttr);
      } else {
        raycaster.setAttribute('cursor', cursorAttr);
      }
      if (raycaster) {
        const objects = raycaster.components.raycaster.attrValue.objects;
        if (!objects.includes(`.${clazz}`)) {
          raycaster.setAttribute('raycaster', {
            interval: raycasterAttr.interval,
            objects: `${objects}, .${clazz}`,
          });
        }
      } else {
        cursor.setAttribute('raycaster', raycasterAttr);
      }
    } else {
      const ent = document.createElement('a-entity');
      ent.setAttribute('cursor', cursorAttr);
      ent.setAttribute('raycaster', raycasterAttr);
      camEl.appendChild(ent);
    }
  }


  AFRAME.registerComponent('xr-click', {
    schema: {},
    init: function() {
      this.el.classList.add(clazz);
      this.mousedown = mousedown.bind(this);
      this.el.addEventListener('mousedown', this.mousedown);
      this.el.sceneEl.addEventListener('renderstart', renderstart);
    },
    remove: function() {
      this.el.sceneEl.removeEventListener('renderstart', renderstart);
      this.el.removeEventListener('mousedown', this.mousedown);
    },
  });
})();
