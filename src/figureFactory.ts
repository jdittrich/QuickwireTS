import { Rect } from "./data/rect.js";
import { Figure} from "./figures/figure.js";
import { RectFigure } from "./figures/rectFigure.js";
import { Drawing } from "./drawing.js";
import { HorizontalLineFigure } from "./figures/lineFigure.js";
import { HorizontalLine } from "./data/horizontalLine.js";
//adding a new figure: Import the figure, its parameter type as well as any value object types the object needs.


/**
 * The alternative to this would have been a "fromJSON" method on each figure, 
 * but for composite figures it would have needed to be able to recursively
 * create figures of any type (probably by calling this function anyway)
 */
function jsonToFigure(figureJson):Figure{
    const type = figureJson.type;

    let parsedChildren:Figure[];

    if(figureJson.containedFigures){
        parsedChildren = figureJson.containedFigures.map(jsonToFigure);
    }
    
    switch (type){
        case "Drawing":
            return new Drawing({
                rect: Rect.fromJSON(figureJson.rect),
                containedFigures:parsedChildren
            })
            break;
        case "RectFigure":
            return new RectFigure({
                rect: Rect.fromJSON(figureJson.rect),
                containedFigures:parsedChildren
            });
            break;
        case "HorizontalLineFigure":
            return new HorizontalLineFigure({
                horizontalLine: HorizontalLine.fromJSON(figureJson.horizontalLine)
            });
            break;
        default: 
            throw new Error(`When Parsing Json: ${type} is not known`);
    }
};

export {jsonToFigure}