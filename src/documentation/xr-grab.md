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
