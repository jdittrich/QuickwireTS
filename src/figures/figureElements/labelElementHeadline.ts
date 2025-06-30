import { LabelElement } from "./labelElement.js";
import { drawTextInRect, defaultTextOptions, TextOptions} from "../drawingFunctions/drawTextInRect.js";

class HeadlineElement extends LabelElement{
    draw(ctx:CanvasRenderingContext2D){
        const label = this.getFigureAttribute(this.attributeName);
        ctx.font
        const elementRect = this.getElementRect();
        const textOptions:TextOptions = {
            ...defaultTextOptions, 
            fontWeight:700,
            fontSize:16
        };
        const labelRect = drawTextInRect(ctx,label,elementRect,textOptions);
        this.labelRect = labelRect;
    } 
}

export {HeadlineElement}