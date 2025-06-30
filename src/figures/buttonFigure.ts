import { Figure, CreateFigureParam, FigureJson } from "./figure.js";
import { Rect } from "../data/rect.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import { FigureElement } from "./figureElements/figureElement.js";
import { CreateLabelElementParam, LabelElement } from "./figureElements/labelElement.js";
import { LabelElementCentered } from "./figureElements/labelElementCenterAligned.js";
import { RectConstraint } from "../data/rectConstraint.js";

type CreateButtonParam = CreateFigureParam & {
    label:string;
}

type ButtonFigureJson = FigureJson & {
    label:string;
}


class ButtonFigure extends Figure{
    name = "ButtonFigure";

    labelAttrName:string = "label";
    #centeredLabelElement: FigureElement;
    constructor(param:CreateButtonParam){
        super(param);
        const labelConstraint = new RectConstraint({vertical:[null,16,null], horizontal:[4,null,4]})
        const createLabelElementParam:CreateLabelElementParam = {
            rectConstraint:labelConstraint,
            attributeName:this.labelAttrName,
            labelText: param.label
        }
        this.#centeredLabelElement = new LabelElementCentered(this,createLabelElementParam);
    };

    drawFigure(ctx:CanvasRenderingContext2D){
        const rect = this.getRect();
        const {width,height,x,y} = rect;
        const inset = 2; 
        
        // offset shadow
        ctx.beginPath();
        ctx.fillStyle = "black"
        ctx.roundRect(x+inset,y+inset,width-(inset*2),height-(inset*2),4);
        ctx.fill();
        
        // main button
        ctx.fillStyle="#FFF"
        ctx.beginPath();
        ctx.roundRect(x+inset+1,y+inset+1,width-(inset*2)-3,height-(inset*2)-3,4);
        ctx.fill();
        
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
    toJSON(): ButtonFigureJson{
        const baseJson = super.toJSON();

        const buttonFigureJson =  {
            ...baseJson,
            label: this.getAttribute(this.labelAttrName),
        }
        return buttonFigureJson;
    }

    static createWithDefaultParameters(){
        const buttonFigure = new ButtonFigure({
            "rect": new Rect({
                "x":0,
                "y":0,
                "width":150,
                "height":40
            }),
            label:"OK"
        });
        return buttonFigure;
    }
}



export {ButtonFigure, CreateButtonParam}