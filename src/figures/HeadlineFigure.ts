import { Figure } from "./figure.js";
import { RectConstraint } from "../data/rectConstraint.js";
import { FigureElement } from "./figureElements/figureElement.js";
import { CreateLabelElementParam } from "./figureElements/labelElement.js";
import { CreateLabelFigureParam, LabelFigureJson } from "./labeledFigure.js";
import { HeadlineElement } from "./figureElements/labelElementHeadline.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import { Rect } from "../data/rect.js";

type CreateHeadlineFigureParam = CreateLabelFigureParam;
type HeadlineFigureJson = LabelFigureJson;

class HeadlineFigure extends Figure{
    name = "HeadlineFigure";
    labelAttrName:string = "label";
    #headlineLabelElement: FigureElement;
    constructor(param:CreateHeadlineFigureParam){
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

export {HeadlineFigure, CreateHeadlineFigureParam, HeadlineFigureJson}