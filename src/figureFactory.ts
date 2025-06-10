import {Figure, CreateFigureParam} from "./figures/figure.js";
import { Rect } from "./data/rect.js";
import { RectFigure, CreateRectFigureParam } from "./figures/rectFigure.js";
import { ButtonFigure, CreateButtonParam } from "./figures/buttonFigure.js";
//import { RadioButtonListFigure, createRadioButtonListFigureParam } from "./figures/radioButtonListFigure.js";
import { CheckboxFigure,CreateCheckboxParam, RadiobuttonFigure, CreateRadiobuttonParam} from "./figures/toggleFigure.js";
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
        case "RadiobuttonFigure":
            const createToggleFigureParam:CreateRadiobuttonParam = {
                ...figureBaseParams,
                label:figureJson.label,
                isSelected:figureJson.isSelected,
            }
            return new RadiobuttonFigure(createToggleFigureParam)
            break;
        case "CheckboxFigure":
            const createCheckboxParam:CreateCheckboxParam = {
                ...figureBaseParams,
                isSelected:figureJson.isSelected,
                label:figureJson.label
            }
            return new CheckboxFigure(createCheckboxParam);
            break;
        default: 
            throw new Error(`When Parsing Json: ${type} is not known`);
    }
};

export {jsonToFigure}