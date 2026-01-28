import { Rect } from "./data/rect.js";
import {Figure, CreateFigureParam} from "./figures/figure.js";
import { RectFigure, CreateRectFigureParam } from "./figures/rectFigure.js";
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
        default: 
            throw new Error(`When Parsing Json: ${type} is not known`);
    }
};

export {jsonToFigure}