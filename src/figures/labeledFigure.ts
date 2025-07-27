import { Figure, CreateFigureParam, FigureJson } from "./figure.js";
import { Rect } from "../data/rect.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import { createLeftRightResizeHandles } from "../handles/resizeHandle.js";
import { RectConstraint, SizeConstraint } from "../data/rectConstraint.js";
import { FigureElement } from "./figureElements/figureElement.js";
import { CreateLabelElementParam } from "./figureElements/labelElement.js";
import { LabelElementLeftAligned } from "./figureElements/labelElementLeftAligned.js";

type CreateLabelFigureParam = CreateFigureParam & {
    label:string;
}

type LabelFigureJson = FigureJson & {
    label:string;
}

class LabelFigure extends Figure {
    name = "LabelFigure";
    labelAttrName:string = "label";
    #leftAlignedLabelElement: FigureElement;

    sizeConstraint: SizeConstraint = new SizeConstraint(32,null);

    constructor(param:CreateLabelFigureParam){
        super(param);
        const labelConstraint = new RectConstraint({vertical:[null,16,null], horizontal:[4,null,4]})
        const createLabelElementParam:CreateLabelElementParam = {
            rectConstraint:labelConstraint,
            attributeName:this.labelAttrName,
            labelText: param.label
        }
        this.#leftAlignedLabelElement = new LabelElementLeftAligned(this,createLabelElementParam);
    };

    drawFigure(ctx:CanvasRenderingContext2D){
        //draws label
        this.#leftAlignedLabelElement.draw(ctx);
    }

    
    getHandles(drawingView:DrawingView):Handle[]{
        const handles =  super.getHandles(drawingView);
        const resizeHandles = createLeftRightResizeHandles(this,drawingView);
        return [...handles,...resizeHandles];
    }
    
   /**
    * @see {Figure.toString}
    */
   toString(): string{
        const baseString = super.toString();
        const label = this.getAttribute("label");
        const buttonFigureString = baseString+`label:${label}`;
        return buttonFigureString;
    }
    getParameters(){
        const baseParameters = super.getParameters();
        const buttonFigureParameters = {
            ...baseParameters,
            label: this.getAttribute(this.labelAttrName)
        }
        return buttonFigureParameters;
    }

    /**
     * Serializes figure to JSON
     * @returns {object} as json
     */
    toJSON(): LabelFigureJson{
        const baseJson = super.toJSON();

        const labelFigureJson =  {
            ...baseJson,
            label: this.getAttribute(this.labelAttrName),
        }
        return labelFigureJson;
    }

    static createWithDefaultParameters(){
        const labelFigure = new LabelFigure({
            "rect": new Rect({
                "x":0,
                "y":0,
                "width":150,
                "height":40
            }),
            label:"Label"
        });
        return labelFigure;
    }
}

export {LabelFigure, LabelFigureJson, CreateLabelFigureParam}