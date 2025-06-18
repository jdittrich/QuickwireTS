// needs a drawChevron
// needs a rectangle
// needs a label 

import { Figure, CreateFigureParam, FigureJson } from "./figure.js";
import { Rect } from "../data/rect.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import { CreateLabelElementParam, FigureElement, LabelElementLeftAligned } from "./figureElements.js";
import { RectConstraint } from "../data/rectConstraint.js";

type CreateDropdownParam = CreateFigureParam & {
    label:string;
}

type DropdownFigureJson = FigureJson & {
    label:string;
}


class DropdownFigure extends Figure{
    name = "DropdownFigure";

    labelAttrName:string = "label";
    
    #buttonConstraint: RectConstraint;
    #chevronInButtonConstraint: RectConstraint;

    #leftAlignedLabelElement: FigureElement;
    
    constructor(param:CreateDropdownParam){
        super(param);
        this.#buttonConstraint         = new RectConstraint({vertical:[1,null,1],horizontal:[null,30,0]}); //will be used relative to the figure rect.
        this.#chevronInButtonConstraint = new RectConstraint({vertical:[null,8,null],horizontal:[8,null,8]}); //will be used relative to button rect
        
        const labelConstraint  = new RectConstraint({vertical:[null,16,null], horizontal:[10,null,16]})
        const createLabelElementParam:CreateLabelElementParam = {
            rectConstraint:labelConstraint,
            attributeName:this.labelAttrName,
            labelText: param.label
        }
        this.#leftAlignedLabelElement = new LabelElementLeftAligned(this,createLabelElementParam);
    };

    drawFigure(ctx:CanvasRenderingContext2D){
        //draw outer rect
        const figureRect = this.getRect();
        ctx.strokeRect(...figureRect.toArray())
        
        //draw inner label
        this.#leftAlignedLabelElement.draw(ctx);

        //draw button
        const buttonRect = this.#buttonConstraint.deriveRect(figureRect);
        ctx.strokeRect(...buttonRect.toArray());

        //drawChevron
        const chevronRect = this.#chevronInButtonConstraint.deriveRect(buttonRect);
        ctx.beginPath();
        ctx.moveTo(chevronRect.left,chevronRect.top);
        ctx.lineTo(chevronRect.getCenter().x, chevronRect.bottom);
        ctx.lineTo(chevronRect.right,chevronRect.top);
        ctx.stroke();
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
        const dropdownFigureString = baseString+`label:${label}`;
        return dropdownFigureString;
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
    toJSON(): DropdownFigureJson{
        const baseJson = super.toJSON();

        const dropdownFigureJson =  {
            ...baseJson,
            label: this.getAttribute(this.labelAttrName),
        }
        return dropdownFigureJson;
    }

    static createWithDefaultParameters(){
        const dropdownFigure = new DropdownFigure({
            "rect": new Rect({
                "x":0,
                "y":0,
                "width":150,
                "height":40
            }),
            label:"OK"
        });
        return dropdownFigure;
    }
}



export {DropdownFigure, CreateDropdownParam}