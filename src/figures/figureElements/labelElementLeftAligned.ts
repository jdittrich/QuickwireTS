import { LabelElement } from "./labelElement.js";
import { drawTextInRect, defaultTextOptions } from "../drawingFunctions/drawTextInRect.js";

class LabelElementLeftAligned extends LabelElement{
    draw(ctx:CanvasRenderingContext2D){
        const label = this.getFigureAttribute(this.attributeName);
        const elementRect = this.getElementRect();
        const labelRect = drawTextInRect(ctx,label,elementRect,defaultTextOptions);
        this.labelRect = labelRect;
    }
}

export {LabelElementLeftAligned};