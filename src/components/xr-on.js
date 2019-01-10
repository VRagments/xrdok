/*

Trigger component updates sequentially and in parrallel.
Enrich the behaviour of an entity by defining components in child nodes that should be added to the entity
depending on specified event condition.

Child nodes are defined as `xr-comp` at the moment.
All child nodes will be triggered simultaneously once the on condition is triggered.
To have more control a `xr-wait` component can be added that will separate the child nodes.
All children in front of and including the `xr-wait` component are triggered simultaneously.
The remainder is triggered once the `xr-wait` condition has triggered.

This component can be used multiple times to target different components/events.
Beware the aframe syntax which is `xr-on__<id>` on multiple instances.
To associate `xr-comp` children with their respective `xr-on__<id>` parents, simply use `xr-comp__<id>`.

Events:

- xr-on, when the initial event has triggered and the component chain starts.

Properties:

- event: Needs to be specified in order to work. This is the initial trigger condition.
- id: if we want to affect a different entity than ourself, specify the id of that component

Examples:

```
<a-sphere position="0 1.5 -5" color="#F4F7F2" xr-on="event: xr-grabstart" xr-grab>
  <xr-comp xr-wait="event: xr-grabend" animation="property: material.color; to: #AF0000"></xr-comp>
  <xr-comp animation="property: material.color; to: #F4F7F2"></xr-comp>
</a-sphere>



<a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9" xr-grab xr-on="event: xr-grabstart" >
  <xr-comp xr-wait="event: animationcomplete" animation="property: material.color; to: #FAF000"></xr-comp>
  <xr-comp animation="property: material.color; to: #4CC3D9"></xr-comp>
</a-box>
```


*/

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
        compIndex[attr.name] = compIndex[attr.name] ? compIndex[attr.name] + 1 : 0;
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
