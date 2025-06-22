import { Figure, CreateFigureParam, FigureJson } from "./figure.js";
import { Rect } from "../data/rect.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import { RectConstraint } from "../data/rectConstraint.js";
import {FigureElement, CreateLabelElementParam, LabelElementLeftAligned, HeadlineElement} from "./figureElements.js";

type CreateWithLabelParam = CreateFigureParam & {
    label:string;
}

type WithLabelJson = FigureJson & {
    label:string;
}

type CreateLabelFigureParam = CreateWithLabelParam;
type LabelFigureJson = WithLabelJson;

class LabelFigure extends Figure {
    name = "LabelFigure";
    labelAttrName:string = "label";
    #centeredLabelElement: FigureElement;
    constructor(param:CreateLabelFigureParam){
        super(param);
        const labelConstraint = new RectConstraint({vertical:[null,16,null], horizontal:[4,null,4]})
        const createLabelElementParam:CreateLabelElementParam = {
            rectConstraint:labelConstraint,
            attributeName:this.labelAttrName,
            labelText: param.label
        }
        this.#centeredLabelElement = new LabelElementLeftAligned(this,createLabelElementParam);
    };

    drawFigure(ctx:CanvasRenderingContext2D){              
        //draws label
        this.#centeredLabelElement.draw(ctx);
    }

    
    getHandles(drawingView:DrawingView):Handle[]{
        const handles =  super.getHandles(drawingView);
        return handles;
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

type CreateHeadlineFigureParam = CreateWithLabelParam;
type HeadlineFigureJson = WithLabelJson;

class HeadlineFigure  extends Figure{
    name = "HeadlineFigure";
    labelAttrName:string = "label";
    #headlineLabelElement: FigureElement;
    constructor(param:CreateLabelFigureParam){
        super(param);
        const labelConstraint = new RectConstraint({vertical:[0,null,0], horizontal:[4,null,4]})
        const createLabelElementParam:CreateLabelElementParam = {
            rectConstraint:labelConstraint,
            attributeName:this.labelAttrName,
            labelText: param.label
        }
        this.#headlineLabelElement = new HeadlineElement(this,createLabelElementParam);
    };

    drawFigure(ctx:CanvasRenderingContext2D){              
        //draws label
        this.#headlineLabelElement.draw(ctx);
    }

    
    getHandles(drawingView:DrawingView):Handle[]{
        const handles =  super.getHandles(drawingView);
        return handles;
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
        const headlineFigure = new HeadlineFigure({
            "rect": new Rect({
                "x":0,
                "y":0,
                "width":150,
                "height":40
            }),
            label:"Label"
        });
        return headlineFigure;
    }
}



export {LabelFigure, CreateLabelFigureParam, LabelFigureJson, HeadlineFigure, CreateHeadlineFigureParam,HeadlineFigureJson}