## QuickWire

### Purpose 

QuickWire is a prototype for a small user interface wireframing app to facilitate conversations about UI design. If figma or penpot are for creating blueprints, QuickWire is for felt-pen sketches on a mid-sized sticky note. 

The (to be implemented) collaboration model is based on cloning and changing other wireframes: Respond to a wireframe with a changed wirefame of your own. This avoids the need for real-time-collaboration mechanisms.

QuickWire does not have stack management (send forward/backward); figures become children of their enclosing figures.

### Running the code

Run a http server (e.g. `python -m http.server`) ont he repo’s top level (where you find the index.html). That should be it – the code is buildless. 

### Architecture
Old fashioned object oriented programming.

 Very much influenced by HotDraw, particularly [jHotdraw 5](https://gist.github.com/jdittrich/c31185cd3667e4d48864b902a983e3d0). Other influences: The case study of the GoF Design Pattern book, [Draw2D.js](https://freegroup.github.io/draw2d/index.html).

There is also no redraw management that restricts redraws to specific areas. 

### Technology

TypeScript using  ̀"erasableSyntaxOnly": true` option

### Libraries

* [glMatrix](https://glmatrix.net/), [MIT Licensed](https://github.com/toji/gl-matrix/blob/master/LICENSE.md)