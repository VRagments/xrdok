Render a default button that can be used as a simple push button or as a two state toggle button.

Implemented for:

[x] 360 mouse interaction
[] gaze
[] controller
[] laser

Events:

- xr-button-click, when a click is registered.
  This will only be called when the click effects the button.
  Two rapid clicks will result in one effective click.
- xr-button-on, only triggered on a two state toggle button when pushed on
- xr-button-off, only triggered on a two state toggle button when pushed off

Properties:

- toggle: when enabled, this button will behave as a two state toggle button

Examples:

```
<a-entity xr-button="toggle: true">
</a-entity>
```
