import { FigureElement } from "../figureElements/figureElement.js"
import { RectConstraint } from "../../data/rectConstraint.js";
import { Rect } from "../../data/rect.js";
import { Figure } from "../figure.js";
import { Handle } from "../../handles/handle.js";
import {ToggleAttributeHandle} from  "../../handles/toggleAttributeHandle.js"

type CreateToggleElementParam = {
    rectConstraint:RectConstraint;
    attributeName:string;
    isSelected:boolean;
}

/**
 * Base class for elements that can be toggled, like 
 * radio buttons (⦿,◯) or checkboxes (☑,☐)
 */
abstract class ToggleElement extends FigureElement{
    rectConstraint:RectConstraint;
    attributeName:string;
    constructor(figure:Figure, param:CreateToggleElementParam){
        super(figure);
        this.rectConstraint = param.rectConstraint;
        this.attributeName = param.attributeName;
        
        figure.registerAttributes({[this.attributeName]:Boolean});
        this.setFigureAttribute(param.attributeName,param.isSelected);
    }
    getElementRect(): Rect {
        const figureRect = this.getFigureRect();
        const ownRect = this.rectConstraint.deriveRect(figureRect);
        return ownRect;
    }
    abstract draw(ctx:CanvasRenderingContext2D)
    getHandles(drawingView): Handle[] {
        const handle = new ToggleAttributeHandle(this.getFigure(),drawingView,this.getElementRect(),this.attributeName);
        return [handle];
    }
}

export {ToggleElement, CreateToggleElementParam}