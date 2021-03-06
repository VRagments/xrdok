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

const isMobileOrTablet = function() {
  var check = false;
  // eslint-disable-next-line
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}();

const gazeCursor = function determineCursor() {
  return AFRAME.utils.device.checkHeadsetConnected() || isMobileOrTablet;
};

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

  function resetAnim(evt) {
    const el = evt.originalTarget;
    el.setAttribute('animation__fuse', { dur: 222, property: 'scale', to: '1 1 1' });
  }

  function fuseAnim(evt) {
    const el = evt.originalTarget;
    el.setAttribute('animation__fuse', { dur: 500, property: 'scale', to: '0.1 0.1 0.1' });
  }

  function cursorGaze(ent, clazz) {
    ent.setAttribute('cursor', { fuse: true, fuseTimeout: 500 });
    ent.setAttribute('raycaster', { interval: 250, objects: '.' + clazz });
    ent.setAttribute('position', '0 0 -1');
    ent.setAttribute('geometry', {
      primitive: 'ring',
      radiusInner: 0.02,
      radiusOuter: 0.03,
    });
    ent.setAttribute('material', {
      color: 'black',
      shader: 'flat',
    });
    ent.removeEventListener('fusing', fuseAnim);
    ent.addEventListener('fusing', fuseAnim);
    ent.removeEventListener('click', resetAnim);
    ent.addEventListener('click', resetAnim);
  }

  return function renderstartWithRaycaster(camera, clazz) {
    if (gazeCursor()) {
      const ent = document.createElement('a-entity');
      cursorGaze(ent, clazz);
      const camEl = camera.el;
      camEl.appendChild(ent);
    } else {
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
      this.el.addEventListener('click', this.mousedown);
      this.el.sceneEl.addEventListener('renderstart', renderstart);
    },
    remove: function() {
      this.el.sceneEl.removeEventListener('renderstart', renderstart);
      this.el.removeEventListener('click', this.mousedown);
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
          target.setAttribute(name, value);
        } else {
          target.setAttribute(name + '__' + idx, value);
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
      this.el.addEventListener('click', this.mousedown);
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
      this.el.removeEventListener('click', this.mousedown);
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
