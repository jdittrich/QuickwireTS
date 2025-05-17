import {Figure, CreateFigureParam} from "./figures/figure.js";
import { Rect } from "./data/rect.js";
import { RectFigure, CreateRectFigureParam } from "./figures/rectFigure.js";
import { ButtonFigure, CreateButtonParam } from "./figures/buttonFigure.js";
import { RadioButtonListFigure, createRadioButtonListFigureParam } from "./figures/radioButtonListFigure.js";
import { SingleSelectableLabelList } from "./data/singleSelectLabelList.js";
import { Drawing } from "./drawing.js";
//adding a new figure: Import the figure, its parameter type as well as any value object types the object needs.

function jsonToFigure(figureJson):Figure{
    const {type,containedFigures} = figureJson;
    const parsedChildren = containedFigures.map(jsonToFigure);
    const parsedRect = Rect.fromJSON(figureJson.rect);
    
    const figureBaseParams:CreateFigureParam = {
        rect:parsedRect,
        containedFigures:parsedChildren
    }

    switch (type){
        case "Drawing":
            return new Drawing(figureBaseParams)
            break;
        case "RectFigure":
            const rectParam:CreateRectFigureParam = figureBaseParams;
            return new RectFigure(rectParam);
            break;
        case "ButtonFigure":
            const createButtonParam:CreateButtonParam = {
                ...figureBaseParams,
                label:figureJson.label
            }
            return new ButtonFigure(createButtonParam);
            break;
        case "RadioButtonListFigure":
            const createRadioButtonListFigureParam:createRadioButtonListFigureParam ={
                ...figureBaseParams,
                radioButtons:SingleSelectableLabelList.fromJSON(figureJson.radioButtons)
            }
            return new RadioButtonListFigure(createRadioButtonListFigureParam);
            break;
        default: 
            throw new Error(`When Parsing Json: ${type} is not known`);
    }
};

export {jsonToFigure}
// NOTE: 
// ChatGPT: 
// Use a factory method that reads the type field to instantiate the correct class.

// ```function fromJSON(json) {
//   const { type, children = [], ...props } = json;
//   const parsedChildren = children.map(fromJSON);

//   switch (type) {
//     case 'ColorRectangle':
//       return new ColorRectangle(Color.fromJSON(props.color), parsedChildren);
//     case 'DraggableRectangle':
//       return new DraggableRectangle(props.draggable, parsedChildren);
//     case 'Rectangle':
//       return new Rectangle(parsedChildren);
//     default:
//       throw new Error(`Unknown type: ${type}`);
//   }
// }```

// You can define a static fromJSON method in each class instead of using a central factory, but centralizing is usually cleaner for recursion-heavy structures.
// Consider using an abstract base class or interface if you want stronger typing (e.g. in TypeScript).
// Value objects (like Color) handle their own deserialization via fromJSON().
// Entities (like ColorRectangle) reconstruct themselves using value objects.
// The deserializer remains readable and centralized, with clear responsibilities.