import { Rect } from "../../data/rect.js";
import { Figure } from "../figure.js";
import { RectConstraint } from "../../data/rectConstraint.js";
import { FigureElement } from "./figureElement.js";
import { DrawingView } from "../../drawingView.js";
import { EditTextHandle } from "../../handles/editTextHandle.js";

type CreateLabelElementParam = {
    rectConstraint:RectConstraint;
    attributeName:string;
    labelText?:string;
}

abstract class LabelElement extends FigureElement{
    cachedLabelWidth:number
    cachedLabelHeight:number
    attributeName:string;
    rectConstraint:RectConstraint;
    labelText:string
    labelRect: Rect
    
    constructor(figure:Figure, param:CreateLabelElementParam){
        super(figure);
        this.rectConstraint = param.rectConstraint;
        this.attributeName = param.attributeName;
        this.labelText = param.labelText || "";
        
        figure.registerAttributes({[param.attributeName]:String})
        this.setFigureAttribute(param.attributeName,param.labelText);
        this.labelRect = new Rect({x:0,y:0,width:0,height:0});
    }
    getElementRect(): Rect {
        const figureRect = this.getFigureRect();
        const rect = this.rectConstraint.deriveRect(figureRect);
        return rect;
    }
    getLabelRect():Rect {
        return this.labelRect
    }
    abstract draw(ctx:CanvasRenderingContext2D)
    getHandles(drawingView:DrawingView){
        const handle = new EditTextHandle(this.getFigure(),drawingView,{
            "attributeName":this.attributeName,
            textRect:this.getLabelRect()
        });
        return [handle];
    }
}

export {LabelElement, CreateLabelElementParam}