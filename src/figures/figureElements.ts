import { Figure } from "./figure.js";
import { Rect } from "../data/rect.js";
import { EditTextHandle } from "../handles/editTextHandle.js";
import { ToggleAttributeHandle } from "../handles/toggleAttributeHandle.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import { RectConstraint, centeredStrategy } from "../data/rectConstraint.js";
/**
 * An abstract class for graphical elements of figures, 
 * e.g. the handle on a scrollbar or the radio indicator of a radiobutton.
 * 
 */
abstract class FigureElement{
    #figure
    constructor(figure){
        this.#figure = figure;
        figure.addFigureElements([this]);
    }
    getFigure():Figure{
        return this.#figure
    }
    getFigureRect():Rect{
        return this.#figure.getRect();
    }
    getFigureAttribute(attributeName:string):any{
        const attributeValue = this.#figure.getAttribute(attributeName);
        return attributeValue;
    }
    setFigureAttribute(attributeName,attributeValue){
        this.#figure.setAttribute(attributeName,attributeValue);
    }
    abstract getElementRect():Rect
    abstract draw(ctx:CanvasRenderingContext2D):void
    getHandles(drawingView:DrawingView):Handle[]{
        return [];
    }
}

type CreateToggleElementParam = {
    rectConstraint:RectConstraint;
    attributeName:string;
    isSelected:boolean;
}

//draws a toggleable checkbox
class ToggleElement extends FigureElement{
    rectConstraint:RectConstraint;
    attributeName:string;
    constructor(figure, param:CreateToggleElementParam){
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
    draw(ctx){

    }
    getHandles(drawingView): Handle[] {
        const handle = new ToggleAttributeHandle(this.getFigure(),drawingView,this.getElementRect(),this.attributeName);
        return [handle];
    }
}

class CheckboxElement extends ToggleElement {
    draw(ctx){
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

class RadioElement extends ToggleElement {
    constructor(figure:Figure, param:CreateToggleElementParam){
        super(figure,param);
    }
    draw(ctx){
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



type CreateLabelElementParam = {
    rectConstraint:RectConstraint;
    attributeName:string;
    labelText?:string;
}

class LabelElement extends FigureElement{
    cachedLabelWidth:number
    cachedLabelHeight:number
    attributeName:string;
    rectConstraint:RectConstraint;
    labelText:string
    
    constructor(figure:Figure, param:CreateLabelElementParam){
        super(figure);
        this.rectConstraint = param.rectConstraint;
        this.attributeName = param.attributeName;
        this.labelText = param.labelText || "";
        
        figure.registerAttributes({[param.attributeName]:String})
        this.setFigureAttribute(param.attributeName,param.labelText);
    }
    getElementRect(): Rect {
        const figureRect = this.getFigureRect();
        const rect = this.rectConstraint.deriveRect(figureRect);
        return rect;
    }
    getLabelRect():Rect {
        const rectWidth = this.cachedLabelWidth;
        const rectHeight = this.cachedLabelHeight;
        const outerRect = this.getElementRect();

        const labelRect = new Rect({
            x: outerRect.x,
            y: outerRect.y,
            width:rectWidth,
            height:rectHeight
        })
        return labelRect;
    }
    draw(ctx:CanvasRenderingContext2D){
        const label = this.getFigureAttribute(this.attributeName);
        const labelMetrics = ctx.measureText(label);
        this.cachedLabelHeight = labelMetrics.actualBoundingBoxAscent - labelMetrics.actualBoundingBoxDescent;
        this.cachedLabelWidth = labelMetrics.width;
        
        const labelRect = this.getLabelRect();
        ctx.fillStyle="#000"
        ctx.fillText(label, labelRect.x, labelRect.y+labelRect.height
        );
    }
    getHandles(drawingView:DrawingView){
        const handle = new EditTextHandle(this.getFigure(),drawingView,{
            "attributeName":this.attributeName,
            textRect:this.getLabelRect()
        });
        return [handle];
    }
}

class CenteredLabelElement extends LabelElement {
    constructor(figure:Figure, params){
        super(figure, params);
    }
    getLabelRect():Rect {
        const rectWidth = this.cachedLabelWidth;    
        const rectHeight = this.cachedLabelHeight;
        const outerRect = this.getElementRect();
        const center=outerRect.getCenter();
        const labelRect = new Rect({
            x: center.x - ((this.cachedLabelWidth)/2),
            y: outerRect.y+((outerRect.height-rectHeight)/2),
            width:rectWidth,
            height:rectHeight
        });
        return labelRect;
    }
}

export {CheckboxElement, RadioElement, LabelElement, CenteredLabelElement, CreateLabelElementParam, FigureElement}