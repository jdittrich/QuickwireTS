import { Figure } from "./figure.js";
import { Rect } from "../data/rect.js";
import { EditTextHandle } from "../handles/editTextHandle.js";
import { ToggleAttributeHandle } from "../handles/toggleAttributeHandle.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import { RectConstraint, centeredStrategy } from "../data/rectConstraint.js";
import { SingleSelectLabelList } from "../data/singleSelectLabelList.js";
import {EditSelectableListHandle} from "../handles/editTextHandle.js";
import { Drawable } from "../interfaces.js";




/**
 * An abstract class for graphical elements of figures, 
 * e.g. the handle on a scrollbar or the radio indicator of a radiobutton.
 * 
 * It combines: 
 * - Figure, 
 * - a figure attribute (identified by name), 
 * - a handle to change the attribute
 * - a drawing method that visualized the element
 */
abstract class FigureElement implements Drawable{
    #figure
    constructor(figure:Figure){
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

/**
 * Draws the toggleable check box (not the label!)
 * which looks like ☑ or ☐
 */
class CheckboxElement extends ToggleElement {
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

/**
 * Draws the toggleable radio button (not the label!)
 * which looks like ⦿ or ◯
 */
class RadioElement extends ToggleElement {
    constructor(figure:Figure, param:CreateToggleElementParam){
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

class LabelElementLeftAligned extends LabelElement{
    draw(ctx:CanvasRenderingContext2D){
        const label = this.getFigureAttribute(this.attributeName);
        const elementRect = this.getElementRect();
        const labelRect = drawTextInRectLeft(ctx,elementRect,label);
        this.labelRect = labelRect;
    }
}

class LabelElementCentered extends LabelElement{
    draw(ctx:CanvasRenderingContext2D){
        const label = this.getFigureAttribute(this.attributeName);
        const elementRect = this.getElementRect();
        const labelRect = drawTextInRectCentered(ctx,elementRect,label);
        this.labelRect = labelRect;
    }
}


type CreateSingleSelectElementParam = {
    rectConstraint:RectConstraint;
    attributeName:string;
    labelText:SingleSelectLabelList;
}

class HorizontalTabsElement extends FigureElement{
    attributeName:string;
    rectConstraint:RectConstraint;
    labelRect: Rect;
    constructor(figure:Figure, param:CreateSingleSelectElementParam){
        super(figure)
        this.rectConstraint = param.rectConstraint;
        figure.registerAttributes({[param.attributeName]:SingleSelectLabelList})
        this.attributeName = param.attributeName;
        this.setFigureAttribute(param.attributeName,param.labelText);
        this.labelRect = new Rect({x:0,y:0,width:0,height:0});
    }
    getElementRect():Rect {
        const figureRect = this.getFigureRect();
        const ownRect = this.rectConstraint.deriveRect(figureRect);
        return ownRect;
    }
    getTabWidth(){
        const elementRect = this.getElementRect();
        const singleSelectLabels = this.getFigureAttribute(this.attributeName);
        const labelCount = singleSelectLabels.labels.length;
        const width =  elementRect.width/labelCount;
        return width;
    }
    draw(ctx:CanvasRenderingContext2D):void{
        const {labels, selectedIndex} = this.getFigureAttribute(this.attributeName);
        const elementRect = this.getElementRect();
        const tabWidth = this.getTabWidth();
        let leftmost = elementRect.x;
        labels.forEach((label,index)=>{
            const currentRect = new Rect({x:leftmost,y:elementRect.y,width:tabWidth,height:elementRect.height})
            drawTextInRectCentered(ctx,currentRect,label);
            ctx.beginPath()
            ctx.roundRect(...currentRect.toArray(), [10, 10, 0, 0]);
            ctx.stroke();
            if(index === selectedIndex){
                ctx.save()
                ctx.lineWidth = 10;
                ctx.beginPath()
                ctx.moveTo(currentRect.left, currentRect.bottom);
                ctx.lineTo(currentRect.right,currentRect.bottom);
                ctx.stroke();
                ctx.restore();
            }

            leftmost = currentRect.right;
        });
    }
    getHandles(drawingView: DrawingView): Handle[] {
        const parsableTextEditHandle = new EditSelectableListHandle(
            this.getFigure(),
            drawingView,
            {
                "attributeName":this.attributeName,
                "textRect": this.getElementRect()
            });
        return [parsableTextEditHandle];
    }
}



// Drawing text is tricky. You need to draw to know where it will be placed
// even though I can measure text without drawing, it is usually best
// to keep measuring and drawing together.
// thus, I give the rect it may draw in (e.g. from here to the very right of the figure)
// then I return the box it actually took up. 
// NOTE: Must use a fixed textbox (not "actual" metrics) to avoid base line changes
// if actual is used the word "race" has another box than "face" or "rage" (due to ascendend/descendend letters)
function drawTextInRectCentered(ctx:CanvasRenderingContext2D,potentialSpaceRect:Rect,label:string):Rect{
    const metrics = ctx.measureText(label);
    const baselineToTopEdge = metrics.fontBoundingBoxAscent;
    const baselineToBottomEdge = metrics.fontBoundingBoxDescent;
    const height = baselineToTopEdge + baselineToBottomEdge;
    const width = metrics.width;
    const center = potentialSpaceRect.getCenter();


    const textRect = new Rect({
        x:center.x-(width/2),
        y:center.y-(height/2),
        width:width,
        height:height
    });

    //text is defined by baseline position, which we derive from the rect
    const startPointY = textRect.y + baselineToTopEdge;
    ctx.fillStyle = "#000";
    ctx.fillText(label,textRect.x,startPointY);

    return textRect; 
}

function drawTextInRectLeft(ctx,potentialSpaceRect:Rect,label):Rect{
    const metrics = ctx.measureText(label);
    const baselineToTopEdge = metrics.fontBoundingBoxAscent;
    const baselineToBottomEdge = metrics.fontBoundingBoxDescent;
    const height = baselineToTopEdge + baselineToBottomEdge;
    const width = metrics.width;
    const center = potentialSpaceRect.getCenter();

    const textRect = new Rect({
        x:potentialSpaceRect.x,
        y:center.y-(height/2),
        width:width,
        height:height
    });

    //text is defined by baseline position, which we derive from the rect
    const startPointY = textRect.y + baselineToTopEdge;

    ctx.fillText(label,textRect.x,startPointY);

    return textRect;
}

export {
    CheckboxElement, 
    RadioElement,
    LabelElement,
    LabelElementCentered,
    LabelElementLeftAligned,
    CreateLabelElementParam,
    CreateSingleSelectElementParam,
    HorizontalTabsElement,
    FigureElement

}