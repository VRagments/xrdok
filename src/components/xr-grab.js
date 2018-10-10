/*

Make entities grabbale by adding this component to them.
It will take care of removing and adding physics component as needed for grabbing.

Implemented for:

[x] 360 mouse interaction
[] gaze
[] controller
[] laser


Events:

- xr-grabstart, when grabbing onto something
- xr-grabend, when grab action is finished


Example:

```
  <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9" xr-grab>
  </a-box>
```

*/


(function () {
  const clazz = 'class-xr-grab';
  const cursorAttr = {
    fuse: false,
    rayOrigin: 'mouse',
  };
  const raycasterAttr = {
    interval: 250,
    objects: '.' + clazz,
  };

  const copyTransform = (function() {
    const noGCmatrix = new THREE.Matrix4();
    return function(source, dest) {
      dest.matrix.copy(source.matrixWorld);
      dest.applyMatrix(noGCmatrix.getInverse(dest.parent.matrixWorld));
    };
  })();

  function mousedown(evt) {
    if (this.proxyObject3D) {
      return;
    }
    this.dynamicBody = this.el.getAttribute('dynamic-body');
    this.el.removeAttribute('dynamic-body');
    if (this.dynamicBody) {
    // replace dynamic body with static-body for grabbing purposes
      this.el.setAttribute('static-body', '');
    }
    this.proxyObject3D = new THREE.Object3D();
    evt.detail.cursorEl.object3D.add(this.proxyObject3D);
    copyTransform(this.el.object3D, this.proxyObject3D);
    this.el.emit('xr-grabstart');
  }

  function mouseup(_evt) {
    if (!this.proxyObject3D) {
      return;
    }
    this.proxyObject3D.parent.remove(this.proxyObject3D);
    this.proxyObject3D = null;
    if (this.dynamicBody) {
    // restore dynamic body
      this.el.removeAttribute('static-body');
      this.el.setAttribute('dynamic-body', this.dynamicBody);
      this.dynamicBody = null;
    }
    this.el.emit('xr-grabend');
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


  AFRAME.registerComponent('xr-grab', {
    schema: {},
    init: function() {
      this.el.classList.add(clazz);
      this.mousedown = mousedown.bind(this);
      this.mouseup = mouseup.bind(this);
      this.el.addEventListener('mousedown', this.mousedown);
      this.el.addEventListener('mouseup', this.mouseup);
      this.el.sceneEl.addEventListener('renderstart', renderstart);
    },
    remove: function() {
      this.el.sceneEl.removeEventListener('renderstart', renderstart);
      this.el.removeEventListener('mouseup', this.mouseup);
      this.el.removeEventListener('mousedown', this.mousedown);
    },
    tick: function() {
      if (this.proxyObject3D) {
        copyTransform(this.proxyObject3D, this.el.object3D);
      }
    },
  });
})();
