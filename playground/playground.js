// Create a new color picker instance
// https://iro.js.org/guide.html#getting-started
const colorPicker = new iro.ColorPicker(".colorPicker", {
    // color picker options
    // Option guide: https://iro.js.org/guide.html#color-picker-options
    width: 260,
    // Pure red, green and blue
    colors: [
      "rgb(255, 255, 255)",
    ],
    handleRadius: 5,
    borderColor: "#fff",
    layout: [
        { 
          component: iro.ui.Box,
          options: {}
        },
        { 
          component: iro.ui.Slider,
          options: {
            sliderType: 'hue'
          }
        },
      ]
  });
  
  function setColor(colorIndex) {
    // setActiveColor expects the color index!
    colorPicker.setActiveColor(colorIndex);
  }
  
  
  colorPicker.on(["mount", "color:setActive", "color:change"], function(){
    // colorPicker.color is always the active color
    const index = colorPicker.color.index;
    const hexString = colorPicker.color.hexString;
    activeColor.innerHTML = `
      <div class="swatch" style="background: ${ hexString }"></div>
    `;
  })





let a = new Popup({
  elements: [
    "close",
    "test",
    ["close","test"],
  ],
});
a.addElement({
  name: "test",
  text: "close",
  css: {},
  function: () => {},
  element: "close",
});