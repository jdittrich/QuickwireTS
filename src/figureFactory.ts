import { Rect } from "./data/rect.js";
import { Figure, CreateFigureParam} from "./figures/figure.js";
import { RectFigure, CreateRectFigureParam } from "./figures/rectFigure.js";
import { Drawing, CreateDrawingParam } from "./drawing.js";
//adding a new figure: Import the figure, its parameter type as well as any value object types the object needs.


/**
 * The alternative to this would have been a "fromJSON" method on each figure, 
 * but for composite figures it would have needed to be able to recursively
 * create figures of any type (probably by calling this function anyway)
 */
function jsonToFigure(figureJson):Figure{
    const type = figureJson;

    let parsedRect:Rect;
    let parsedChildren:Figure[];
    
    if(figureJson.rect){
        parsedRect = Rect.fromJSON(figureJson.rect);
    }
    if(figureJson.containedFigures){
        parsedChildren = figureJson.containedFigures.map(jsonToFigure);
    }
    

    switch (type){
        case "Drawing":
            return new Drawing({
                rect: parsedRect,
                containedFigures:parsedChildren
            })
            break;
        case "RectFigure":
            return new RectFigure({
                rect:parsedRect,
                containedFigures:parsedChildren
            });
            break;
        default: 
            throw new Error(`When Parsing Json: ${type} is not known`);
    }
};

export {jsonToFigure}