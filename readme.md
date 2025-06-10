## QuickWire

### Purpose 

QuickWire is a prototype for a small user interface wireframing app to facilitate conversations about UI design. If figma or penpot are for creating blueprints, QuickWire is for felt-pen sketches on a mid-sized sticky note. 

The (to be implemented) collaboration model is based on copying  wireframes and then changing them. This avoids the need for real-time-collaboration mechanisms on one shared version.

QuickWire does not have explicit stack management commands (send forward/backward), instead figures become children of their enclosing figures.

### Requirements
* TypeScript 5.8+

### Running the code
On the repo’s top level (where the index.html is), run: 
* A http server (e.g. `python -m http.server`) 
* `npx tsc --watch` to compile the typescript code



### Architecture
Old fashioned object oriented programming.

 Very much influenced by HotDraw, particularly [jHotdraw 5](https://gist.github.com/jdittrich/c31185cd3667e4d48864b902a983e3d0). Other influences: The case study of the GoF Design Pattern book, [Draw2D.js](https://freegroup.github.io/draw2d/index.html).

There is also no redraw management that restricts redraws to specific areas. 

### Technology

TypeScript using  ̀"erasableSyntaxOnly": true` option, which means that erasing all type info yields valid JavaScript code.

### Used Libraries

* [glMatrix](https://glmatrix.net/), [MIT Licensed](https://github.com/toji/gl-matrix/blob/master/LICENSE.md)