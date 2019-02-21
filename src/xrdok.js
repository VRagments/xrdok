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


(function () {

  const nodeComp = 'xr-comp';
  const attrWait = 'xr-wait';

  function waitEventName(namedNodeMapArray) {
    for (var i = 0; i < namedNodeMapArray.length; i++) {
      const namedNodeMap = namedNodeMapArray[i];
      const aWait = namedNodeMap.getNamedItem(attrWait);
      if (aWait) {
        const eNamesSplit = aWait.value.split('event: ');
        if (eNamesSplit.length > 1) {
          return eNamesSplit[1];
        }
      }
    }
    return null;
  }

  function iterNamedNodeMapArr(arr, fn) {
    const compIndex = {};
    for (var i = 0; i < arr.length; i++) {
      const namedNodeMap = arr[i];
      for (var j = 0; j < namedNodeMap.length; j++) {
        const attr = namedNodeMap[j];
        compIndex[attr.name] = (compIndex[attr.name] !== undefined) ? compIndex[attr.name] + 1 : 0;
        fn(compIndex[attr.name], attr.name, attr.value);
      }
    }
  }

  function targetElement({ data, el }) {
    if (data.id) {
      const t = document.querySelector(`#${data.id}`);
      if (t) {
        return t;
      }
    }
    return el;
  }

  function next() {
    if (this.current) {
      const eName = waitEventName(this.current);
      if (eName) {
        this.el.removeEventListener(eName, this.next);
      }
      const el = this.el;
      iterNamedNodeMapArr(this.current, function(idx, name, _val) {
        if (idx === 0) {
          el.removeAttribute(name);
        } else {
          el.removeAttribute(name + '__' + idx);
        }
      });
      this.current = null;
    }
    if (this.pendingComps.length > 0) {
      const nextArr = this.pendingComps.shift();
      const eName = waitEventName(nextArr);
      if (eName) {
        this.el.addEventListener(eName, this.next);
      } else {
      // no more waiting means we are at the last batch and need to enable initial trigger condition
        this.el.addEventListener(this.data.event, this.on);
      }
      const target = targetElement(this);
      iterNamedNodeMapArr(nextArr, function(idx, name, value) {
        if (idx === 0) {
          target.setAttribute(name, value, true);
        } else {
          target.setAttribute(name + '__' + idx, value, true);
        }
      });
      this.current = nextArr;
    } else {
    // if the last component had a wait event, we will land here. only thing to do is to enable initial trigger condition
      this.el.addEventListener(this.data.event, this.on);
    }
  }

  function on(_evt) {
    this.el.removeEventListener(this.data.event, this.on);
    this.pendingComps = this.xrcomps.slice();
    this.next();
    this.el.emit('xr-on');
  }

  function parseComps({ id, el}) {
    const parsed = [];
    let cur = [];
    for (var i = 0; i < el.children.length; i++) {
      const c = el.children[i];
      const nodeName = c.nodeName;
      const nodeXRcomp = id ? `${nodeComp}__${id}` : nodeComp;
      if (nodeName.toLowerCase() === nodeXRcomp) {
        cur.push(c.attributes);
        const aWait = c.attributes.getNamedItem(attrWait);
        if (aWait) {
          parsed.push(cur);
          cur = [];
        }
      }
    }
    if (cur.length >= 0) {
      parsed.push(cur);
    }
    return parsed;
  }

  AFRAME.registerComponent('xr-on', {
    schema: {
      event: { type: 'string', default: '' },
      id: { type: 'string', default: '' }
    },
    init: function() {
      this.on = on.bind(this);
      this.next = next.bind(this);
      this.xrcomps = parseComps(this);
      this.el.addEventListener(this.data.event, this.on);
    },

    multiple: true,

    remove: function() {
      this.el.removeEventListener(this.data.event, this.on);
    },
  });

})();
