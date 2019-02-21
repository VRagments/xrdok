Render a default button that can be used as a simple push button or as a two state toggle button.

Implemented for:

[x] 360 mouse interaction
[] gaze
[] controller
[] laser

Events:

- xr-button-click, when a click is registered that would push the button. Two rapid clicks will result in one effective click.
- xr-button-on, triggered when toggle button hits the on state
- xr-button-off, triggered when toggle button hits the off state

Properties:

- toggle: when enabled, this button will behave as a two state toggle button

Examples:

```
<a-entity xr-button="toggle: true">
</a-entity>
```
