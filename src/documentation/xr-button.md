Render a default button that can be used as a simple push button or as a two state toggle button.
This button does not come with an icon.
In order to use different button icons you need to attach children to this button. See xr-button-icon.

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
