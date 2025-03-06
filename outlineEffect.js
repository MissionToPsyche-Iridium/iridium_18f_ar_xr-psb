// TO-DO
// need to get three.js worked out to get this effect to work

AFRAME.registerComponent("selectable", {
    init: function () {
      const cursor = this.el.sceneEl.querySelector("a-cursor");
  
      // On cursor enter (when the cursor intersects the object), highlight it
      cursor.addEventListener("mouseenter", (evt) => {
        if (evt.target === this.el) {
          let sceneEl = this.el.sceneEl;
          let outlineComponent = sceneEl.components["outline-effect"];
          outlineComponent.highlight(this.el.object3D);
        }
      });
  
      // On cursor leave (when the cursor stops intersecting), remove the highlight
      cursor.addEventListener("mouseleave", (evt) => {
        if (evt.target === this.el) {
          let sceneEl = this.el.sceneEl;
          let outlineComponent = sceneEl.components["outline-effect"];
          outlineComponent.highlight(null); // Removes the highlight
        }
      });
    },
  });
  