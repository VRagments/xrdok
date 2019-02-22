//
// events
//

const EVTbuttonclick = 'xr-button-click';
const EVTbuttonoff = 'xr-button-off';
const EVTbuttonon = 'xr-button-on';
const EVTclick = 'xr-click';
const EVTgrabend = 'xr-grabend';
const EVTgrabstart = 'xr-grabstart';
const EVTon = 'xr-on';

const eventNames = [
  EVTbuttonclick,
  EVTbuttonoff,
  EVTbuttonon,
  EVTclick,
  EVTgrabend,
  EVTgrabstart,
  EVTon,
];

//
// helpers
//

const myMaterialOrEmpty = function(el) {
  if (el.components.material) {
    return el.components.material.attrValue;
  }
  return {};
};

const setAnimation = function(el, animName, animation) {
  el.removeAttribute(animName);
  el.setAttribute(animName, animation);
};

const renderstartWithRaycaster = (function() {

  const cursorAttr = {
    fuse: false,
    rayOrigin: 'mouse',
  };

  function raycasterAttr(clazz) {
    return {
      interval: 250,
      objects: '.' + clazz,
    };
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

  return function renderstartWithRaycaster(camera, clazz) {
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
          const attr = raycasterAttr(clazz);
          attr.objects = `${objects}, .${clazz}`,
          raycaster.setAttribute('raycaster', attr);
        }
      } else {
        cursor.setAttribute('raycaster', raycasterAttr(clazz));
      }
    } else {
      const ent = document.createElement('a-entity');
      ent.setAttribute('cursor', cursorAttr);
      ent.setAttribute('raycaster', raycasterAttr(clazz));
      camEl.appendChild(ent);
    }
  };

})();

//
//components
//

const XRinspect = 'xr-inspect';
(function() {

  function on(evt) {
    console.log('[xr event]', evt.type); // eslint-disable-line no-console
  }

  AFRAME.registerComponent(XRinspect, {
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

const XRclick = 'xr-click';
(function() {

  const clazz = `class-${XRclick}`;

  function mousedown(_evt) {
    this.el.emit(EVTclick);
  }

  function renderstart(evt) {
    renderstartWithRaycaster(evt.target.camera, clazz);
  }

  AFRAME.registerComponent(XRclick, {
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

const XRgrab = 'xr-grab';
(function () {

  const clazz = `class-${XRgrab}`;

  function renderstart(evt) {
    renderstartWithRaycaster(evt.target.camera, clazz);
  }

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
    this.el.emit(EVTgrabstart);
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
    this.el.emit(EVTgrabend);
  }

  AFRAME.registerComponent(XRgrab, {
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

const XRon = 'xr-on';
(function () {

  const nodeComp = 'xr-comp';
  const attrWait = 'xr-wait';

  function waitEventName(namedNodeMapArray) {
    for (var i = 0; i < namedNodeMapArray.length; i++) {
      const namedNodeMap = namedNodeMapArray[i];
      const aWait = namedNodeMap.getNamedItem(attrWait);
      if (aWait) {
        const eNamesSplit = aWait.value.split('event:');
        if (eNamesSplit.length > 1) {
          return eNamesSplit[1].trim();
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
        if (attr.name !== attrWait) {
          compIndex[attr.name] = (compIndex[attr.name] !== undefined) ? compIndex[attr.name] + 1 : 0;
          fn(compIndex[attr.name], attr.name, attr.value);
        }
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
      const target = targetElement(this);
      iterNamedNodeMapArr(this.current, function(idx, name, _val) {
        if (idx === 0) {
          target.removeAttribute(name);
        } else {
          target.removeAttribute(name + '__' + idx);
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
    this.el.emit(EVTon);
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

  AFRAME.registerComponent(XRon, {
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


const XRbutton = 'xr-button';
(function () {

  const clazz = `class-${XRbutton}`;
  const defaultColor = '#EBF6FD';
  const animPunch = 'animation__punch';
  const animFull = 'animation__full';
  const animRelease = 'animation__release';
  const animations = {
    [animPunch]: {
      property: 'position',
      to: '0 0.01 0',
      dur: 666,
      easing: 'easeOutElastic',
    },
    [animRelease]: {
      property: 'position',
      to: '0 0.04 0',
      dur: 666,
      easing: 'easeInElastic',
    },
    [animFull]: {
      property: 'position',
      from: '0 0.04 0',
      to: '0 0.01 0',
      dur: 333,
      easing: 'easeInElastic',
      dir: 'alternate',
      loop: 1,
    }
  };

  function mousedown(_evt) {
    if (this.state.clicked) {
      return;
    }
    this.el.emit(EVTbuttonclick);
    this.state.clicked = true;
    if (this.data.toggle) {
      if (this.state.toggled) {
        this.state.toggled = false;
        const cb = (evt) => {
          if (evt.detail.name === animRelease) {
            this.el.emit(EVTbuttonoff);
            this.children.inner.removeEventListener('animationcomplete', cb);
            this.state.clicked = false;
          }
        };
        this.children.inner.addEventListener('animationcomplete', cb);
        setAnimation(this.children.inner, animRelease, animations[animRelease]);
      } else {
        this.state.toggled = true;
        const cb = (evt) => {
          if (evt.detail.name === animPunch) {
            this.el.emit(EVTbuttonon);
            this.children.inner.removeEventListener('animationcomplete', cb);
            this.state.clicked = false;
          }
        };
        this.children.inner.addEventListener('animationcomplete', cb);
        setAnimation(this.children.inner, animPunch, animations[animPunch]);
      }
    } else {
      const cb = (evt) => {
        if (evt.detail.name === animFull) {
          this.children.inner.removeEventListener('animationcomplete', cb);
          this.state.clicked = false;
        }
      };
      this.children.inner.addEventListener('animationcomplete', cb);
      setAnimation(this.children.inner, animFull, animations[animFull]);
    }
  }

  function renderstart(evt) {
    renderstartWithRaycaster(evt.target.camera, clazz);
  }

  function determineMaterial(el) {
    if (el.components.material) {
      return el.components.material.attrValue;
    }
    return { color: defaultColor };
  }

  AFRAME.registerComponent(XRbutton, {
    schema: {
      toggle: { type: 'boolean', default: false },
    },

    init: function() {
      // visuals
      const outer = document.createElement('a-cylinder');
      outer.setAttribute('height', 0.05);
      const inner = document.createElement('a-cylinder');
      inner.setAttribute('height', 0.05);
      inner.setAttribute('position', '0 0.04 0');
      inner.setAttribute('radius', 0.9);
      inner.classList.add(clazz);
      this.el.appendChild(outer);
      this.el.appendChild(inner);
      // logic
      this.mousedown = mousedown.bind(this);
      this.el.addEventListener('mousedown', this.mousedown);
      this.el.sceneEl.addEventListener('renderstart', renderstart);
      // component dependent, wait for their initialization
      setTimeout(() => {
        const mat = determineMaterial(this.el);
        outer.setAttribute('material', mat);
        inner.setAttribute('material', mat);
      });
      this.children = {
        inner,
        outer,
      };
      this.state = {
        clicked: false,
        toggled: false,
      };
    },

    remove: function() {
      this.el.sceneEl.removeEventListener('renderstart', renderstart);
      this.el.removeEventListener('mousedown', this.mousedown);
    },
  });

})();

const XRbuttonicon = 'xr-button-icon';
(function () {

  AFRAME.registerComponent(XRbuttonicon, {
    schema: {
      show: { type: 'string', default: 'always' }, // [ 'toggled' | 'non-toggled' | 'always' ]
    },

    buttonListener: function(evt) {
      if (this.data.show === 'toggled') {
        if (evt.type === EVTbuttonon) {
          this.el.setAttribute('visible', true);
        } else {
          this.el.setAttribute('visible', false);
        }

      }
      if (this.data.show === 'non-toggled') {
        if (evt.type === EVTbuttonoff) {
          this.el.setAttribute('visible', true);
        } else {
          this.el.setAttribute('visible', false);
        }
      }
    },

    init: function() {
      setTimeout(() => {
        const button = this.el.parentEl.components[XRbutton];
        if (button) {
          // we are in initialization and not yet attached to button child
          button.el.removeChild(this.el);
          button.children.inner.appendChild(this.el);
          this.el.setAttribute('visible', false);
        } else {
          // we are most probably attached to button child
          const button = this.el.parentEl.parentEl.components[XRbutton];
          this.buttonListener = this.buttonListener.bind(this);
          button.el.addEventListener(EVTbuttonon, this.buttonListener);
          button.el.addEventListener(EVTbuttonoff, this.buttonListener);
          const vis = (this.data.show === 'toggled' && button.state.toggled)
            || (this.data.show === 'non-toggled' && !button.state.toggled)
            || (this.data.show !== 'toggled' && this.data.show !== 'non-toggled');
          this.el.setAttribute('visible', vis);
          const innerPos = button.children.inner.getAttribute('position');
          const ourPos = this.el.getAttribute('position');
          ourPos.y += innerPos.y;
        }
      });
    },

    remove: function() {
      const button = this.el.parentEl.parentEl.components[XRbutton];
      if (button) {
        button.el.removeEventListener(EVTbuttonon, this.buttonListener);
        button.el.removeEventListener(EVTbuttonoff, this.buttonListener);
      }
    },
  });

})();

const XRiconplay = 'xr-icon-play';
(function() {

  AFRAME.registerComponent(XRiconplay, {
    schema: {
    },

    init: function() {
      const triangle = document.createElement('a-triangle');
      triangle.setAttribute('vertex-a', '-0.31 0.31 0');
      triangle.setAttribute('vertex-b', '-0.31 -0.31 0');
      triangle.setAttribute('vertex-c', '0.31 0 0');
      triangle.setAttribute('rotation', '-90 0 0');
      this.el.appendChild(triangle);
      this.children = {
        triangle,
      };
      setTimeout(() => {
        const mat = myMaterialOrEmpty(this.el);
        triangle.setAttribute('material', mat);
      });
    },

    remove: function() {
      this.el.removeChild(this.children.triangle);
    }
  });

})();

const XRiconstop = 'xr-icon-stop';
(function() {

  AFRAME.registerComponent(XRiconstop, {
    schema: {},

    init: function() {
      const quad = document.createElement('a-entity');
      const geo = {
        primitive: 'plane',
        width: 0.62,
        height: 0.62,
      };
      quad.setAttribute('geometry', geo);
      this.el.appendChild(quad);
      this.el.setAttribute('rotation', '-90 0 0');
      this.children = { quad };
      setTimeout(() => {
        const mat = myMaterialOrEmpty(this.el);
        quad.setAttribute('material', mat);
      });
    },

    remove: function() {
      this.el.removeChild(this.children.quad);
    }
  });

})();

const XRicondots = 'xr-icon-dots';
(function() {

  AFRAME.registerComponent(XRicondots, {
    schema: {},

    init: function() {
      const positions = [-0.31, 0, 0.31];
      const geo = {
        primitive: 'cylinder',
        height: 0.001,
        radius: 0.1,
      };
      const dots = positions.map(p => {
        const d = document.createElement('a-entity');
        d.setAttribute('geometry', geo);
        d.setAttribute('position', `${p} 0 0`);
        this.el.appendChild(d);
        return d;
      });
      this.children = { dots };
      setTimeout(() => {
        const mat = myMaterialOrEmpty(this.el);
        dots.forEach(d => d.setAttribute('material', mat));
      });
    },

    remove: function() {
      this.children.dots.forEach(d => {
        this.el.removeChild(d);
      });
    }
  });

})();

const XRiconchevron = 'xr-icon-chevron';
(function() {

  AFRAME.registerComponent(XRiconchevron, {
    schema: {},

    init: function() {
      const geo = {
        primitive: 'plane',
        height: 0.5,
        width: 0.1,
      };
      const left = document.createElement('a-entity');
      const right = document.createElement('a-entity');
      left.setAttribute('geometry', geo);
      right.setAttribute('geometry', geo);
      left.setAttribute('rotation', '-90 45 0');
      left.setAttribute('position', '-0.143 0 0.1');
      right.setAttribute('rotation', '-90 -45 0');
      right.setAttribute('position', '0.143 0 0.1');
      this.el.appendChild(left);
      this.el.appendChild(right);
      this.children = {
        left,
        right,
      };
      setTimeout(() => {
        const mat = myMaterialOrEmpty(this.el);
        left.setAttribute('material', mat);
        right.setAttribute('material', mat);
      });
    },

    remove: function() {
      Object.values(this.children).forEach(v => this.el.removeChild(v));
    }
  });

})();
