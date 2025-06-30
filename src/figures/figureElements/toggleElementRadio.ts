import { CreateToggleElementParam, ToggleElement } from "./toggleElement.js";
import { Figure } from "../figure.js";
/**
 * Draws the toggleable radio button (not the label!)
 * which looks like ⦿ or ◯
 */
type CreateRadioElementParam = CreateToggleElementParam;

class RadioElement extends ToggleElement {
    constructor(figure:Figure, param:CreateRadioElementParam){
        super(figure,param);
    }
    draw(ctx:CanvasRenderingContext2D){
        const radioRadius = 5;
        const radioSelectionRadius = 3;
        const radioCenter = this.getElementRect().getCenter();
        const radioCircle = new Path2D(); 
        radioCircle.arc(radioCenter.x, radioCenter.y, radioRadius, 0, 2 * Math.PI, false);

        const radioSelection = new Path2D(); 
        radioSelection.arc(radioCenter.x, radioCenter.y, radioSelectionRadius, 0, 2 * Math.PI, false);

        ctx.stroke(radioCircle);
        if(this.getFigureAttribute(this.attributeName)){
            ctx.fill(radioSelection);
        }
    }
}

export {CreateRadioElementParam, RadioElement}
