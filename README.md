# XRdok

This project allows the creation of interactive VR projects built on [A-frame](https://github.com/aframevr/aframe/).

The goal is to provide a library of components that provide functionality for specific use cases and are primed for easy use instead of
abstraction.

## USAGE

### Basic Example (See [source](https://glitch.com/edit/#!/vine-flax?path=index.html) or [view live](https://vine-flax.glitch.me/) on Glitch)

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>XRdok</title>
    <meta name="XRdok" content="XR toolset">
    <script src="https://aframe.io/releases/0.8.2/aframe.min.js"></script>
    <script src="//cdn.rawgit.com/donmccurdy/aframe-physics-system/v3.3.0/dist/aframe-physics-system.min.js"></script>
    <script src="https://rawgit.com/ngokevin/aframe-animation-component/master/dist/aframe-animation-component.min.js"></script>
    <script src="main.js"></script>
    <script src="xr-click.js"></script>
    <script src="xr-grab.js"></script>
    <script src="xr-on.js"></script>
  </head>
  <body>
    <a-scene physics="debug: true" debug stats>
      <a-box position="0 1 -13" rotation="0 45 0" color="#0C03DF" static-body xr-on="event: collide">
        <xr-comp animation="property: material.color; to: #DDFFAA"></xr-comp>
      </a-box>
      <a-box position="3 1 -13" rotation="0 45 0" color="#4CC3D9" xr-click xr-on="event: click" static-body>
        <xr-comp animation="property: material.color; to: #11AA00"></xr-comp>
      </a-box>
      <a-plane position="0 -0.01 0" rotation="-90 0 0" width="1000" height="1000" color="#0CFD90" static-body>
      </a-plane>
      <a-cylinder position="-3 2 -14" color="crimson" height="5" xr-grab dynamic-body>
      </a-cylinder>
      <a-sky color="#ECECEC"></a-sky>
    </a-scene>
  </body>
</html>
```

### XRDok components

#### xr-click

When added to an A-frame entity (a tag like a-box, a-sphere) or own A-frame components, triggers a click event when clicked.

**Implemented for:**

[x] 360 mouse interaction
[] gaze
[] controller
[] laser


**Events:**

- xr-click, when a click is registered.

**Examples:**

```
<a-sphere position="0 1.5 -5" color="#F4F7F2" xr-click>
</a-sphere>
```

The click event can be consumed by using xr-on.

```
<a-box position="3 1 -13" rotation="0 45 0" color="#4CC3D9" xr-click xr-on="event: click" static-body>
    <xr-comp animation="property: material.color; to: #11AA00"></xr-comp>
</a-box>
```

#### xr-grab

Make entities grabbale by adding this component to them.
It will take care of removing and adding physics component as needed for grabbing.

**Implemented for:**

[x] 360 mouse interaction
[] gaze
[] controller
[] laser


**Events:**

- xr-grabstart, when grabbing onto something
- xr-grabend, when grab action is finished


**Example:**

```
  <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9" xr-grab>
  </a-box>
```

#### xr-on

Trigger component updates sequentially and in parrallel.
Enrich the behaviour of an entity by defining components in child nodes that should be added to the entity
depending on specified event condition.

Child nodes are defined as `xr-comp` at the moment. All child nodes will be triggered simultaneously once the on condition is triggered.
To have more control a `xr-wait` component can be added that will separate the child nodes.
All children in front of and including the `xr-wait` component are triggered simultaneously.
The remainder is triggered once the `xr-wait` condition has triggered.

This component can be used multiple times to target different components/events.
Beware the A-frame syntax which is `xr-on__<id>` on multiple instances.
To associate `xr-comp` children with their respective `xr-on__<id>` parents, simply use `xr-comp__<id>`.

**Events:**

- xr-on, when the initial event has triggered and the component chain starts.

**Properties:**

- event: Needs to be specified in order to work. This is the initial trigger condition.
- id: if we want to affect a different entity than ourself, specify the id of that component

**Examples:**

```
<a-sphere position="0 1.5 -5" color="#F4F7F2" xr-on="event: xr-grabstart" xr-grab>
  <xr-comp xr-wait="event: grabend" animation="property: material.color; to: #AF0000"></xr-comp>
  <xr-comp animation="property: material.color; to: #F4F7F2"></xr-comp>
</a-sphere>
```

```
<a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9" xr-grab xr-on="event: xr-grabstart" >
  <xr-comp xr-wait="event: animationcomplete" animation="property: material.color; to: #FAF000"></xr-comp>
  <xr-comp animation="property: material.color; to: #4CC3D9"></xr-comp>
</a-box>
```
