import {ToggleElement} from './toggleElement.js';
import { RectConstraint } from '../../data/rectConstraint.js';

type CreateToggleElementParam = {
    rectConstraint:RectConstraint;
    attributeName:string;
    isSelected:boolean;
}

/**
 * Draws the toggleable check box (not the label!)
 * which looks like ☑ or ☐
 */
class CheckboxToggleElement extends ToggleElement {
    draw(ctx:CanvasRenderingContext2D){
        const rect = this.getElementRect();
        const isChecked = this.getFigureAttribute(this.attributeName);
        ctx.strokeRect(...rect.toArray());
        if(isChecked){
            ctx.beginPath();
            ctx.moveTo(rect.x+4, rect.y+(rect.height/2));
            ctx.lineTo(rect.x+(rect.height/2), rect.y+rect.height-4);
            ctx.lineTo(rect.x+ rect.height-3, rect.y+3);
            ctx.stroke()
        }
    }
}

export {CheckboxToggleElement,CreateToggleElementParam}