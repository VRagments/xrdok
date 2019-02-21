Render a button icon.

This icon will appear on its parent button.
If toggled is specified, then it will only appear in that toggled state.

Properties:

- show: [ 'toggled' | 'non-toggled' | 'always' ], default is always. Determine when this icon will be visible on the button.

Examples:

```
<a-entity xr-button="toggle: true">
        <a-box color="green" xr-button-icon="show: toggled"></a-box>
        <a-box color="red" xr-button-icon="show: non-toggled"></a-box>
</a-entity>
```
