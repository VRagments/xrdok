Trigger component updates sequentially and in parrallel.
Enrich the behaviour of an entity by defining components in child nodes that should be added to the entity
depending on specified event condition.

Child nodes are defined as `xr-comp` at the moment.
All child nodes will be triggered simultaneously once the on condition is triggered.
To have more control a `xr-wait` component can be added that will separate the child nodes.
All children in front of and including the `xr-wait` component are triggered simultaneously.
The remainder is triggered once the `xr-wait` condition has triggered.

This component can be used multiple times to target different components/events.
Beware the aframe syntax which is `xr-on__<name>` on multiple instances.
To associate `xr-comp` children with their respective `xr-on__<name>` parents, simply use `xr-comp__<name>`.

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
