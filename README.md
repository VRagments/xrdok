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
    <script src="xrdok.js"></script>
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

[xr-click](src/documentation/xr-click.md)
[xr-inspect](src/documentation/xr-inspect.md)
[xr-grab](src/documentation/xr-grab.md)
[xr-icons](src/documentation/xr-icons.md)
[xr-button](src/documentation/xr-button.md)
[xr-button-icon](src/documentation/xr-button-icon.md)
[xr-on](src/documentation/xr-on.md)
