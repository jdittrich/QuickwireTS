import { Rect } from "./data/rect.js";
import { Figure} from "./figures/figure.js";
import { Drawing, DrawingJson } from "./drawing.js";
import { RectFigure, RectFigureJson } from "./figures/rectFigure.js";
import { HorizontalLineFigure, HorizontalLineFigureJson} from "./figures/lineFigure.js";
import { HorizontalLine } from "./data/horizontalLine.js";
import { FigureJsonTypes } from "./figures/figureTypes.js";
//adding a new figure: Import the figure, its parameter type as well as any value object types the object needs.

/**
 * The alternative to this would have been a "fromJSON" method on each figure, 
 * but for composite figures it would have needed to be able to recursively
 * create figures of any type (probably by calling this function anyway)
 */
function jsonToFigure(figureJson:any):Figure{
    const type = figureJson.type as FigureJsonTypes["type"];

    let parsedChildren:Figure[];

    if("containedFigures" in figureJson){
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
                containedFigures:parsedChildren,
                rectStyle:figureJson.rectStyle
            });
            break;
        case "HorizontalLineFigure":
            return new HorizontalLineFigure({
                horizontalLine: HorizontalLine.fromJSON(figureJson.horizontalLine),
                lineStart:figureJson.lineLeftEnd,
                lineEnd:  figureJson.lineRightEnd
            });
            break;
        default: 
            throw new Error(`When Parsing Json: ${type} is not known`);
    }
};

export {jsonToFigure}