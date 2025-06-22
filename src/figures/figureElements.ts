import { Figure } from "./figure.js";
import { Rect } from "../data/rect.js";
import { Point } from "../data/point.js";
import { EditTextHandle } from "../handles/editTextHandle.js";
import { ToggleAttributeHandle } from "../handles/toggleAttributeHandle.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import { RectConstraint, centeredStrategy } from "../data/rectConstraint.js";
import { SingleSelectLabelList } from "../data/singleSelectLabelList.js";
import {EditSelectableListHandle} from "../handles/editTextHandle.js";
import { Drawable } from "../interfaces.js";
import { Label } from "../data/label.js";


type HorizontalAlign = "left"|"center"|"right";
type VerticalAlign   = "top"|"center"|"right"
type BaselinePositions = "top"|"hanging"|"middle"|"alphabetic"|"ideographic"|"bottom";
type WritingDirections = "ltr"|"rtl";
type FontStyles = "normal"|"italic";
type TextOptions = {
    fontFamily?:string,
    fontSize?:number,
    fontStyle:FontStyles,
    fontWeight:number,
    horizontalAlign?:HorizontalAlign
    verticalAlign?:VerticalAlign
    fontColor?:string
    direction?:WritingDirections
    baseline?: BaselinePositions
}

const defaultTextOptions:TextOptions = {
    fontFamily:     "'Playpen Sans','Shantell Sans','Comic Sans MS','Chalkboard'",
    fontSize:        10,
    fontStyle:       "normal",
    fontWeight:      400,
    horizontalAlign:"left",
    verticalAlign:  "center",
    fontColor:      "black",
    //direction:      "rtl",
    baseline:       "alphabetic"
};

/**
 * An abstract class for graphical elements of figures, 
 * e.g. the handle on a scrollbar or the radio indicator of a radiobutton.
 * 
 * It combines: 
 * - Figure, 
 * - a figure attribute (identified by name), 
 * - a handle to change the attribute
 * - a drawing method that visualized the element
 * 
 * Note: I am not sure how much I like this pattern. It provides composability for complex figures
 * It also introduces a lot of indirections, particularly since it registers itself to its figure
 * in its constructor, so mere creation of the object creates a link between the two. 
 */
abstract class FigureElement implements Drawable{
    #figure:Figure
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
        const labelRect = drawTextInRect(ctx,label,elementRect,defaultTextOptions);
        this.labelRect = labelRect;
    }
}

class LabelElementCentered extends LabelElement{
    draw(ctx:CanvasRenderingContext2D){
        const label = this.getFigureAttribute(this.attributeName);
        const elementRect = this.getElementRect();
        const labelRect = drawTextInRect(ctx,label,elementRect,defaultTextOptions);
        this.labelRect = labelRect;
    }
}

//WIP, is just a centered label atm. 
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
            const textOptions:TextOptions = {
                ...defaultTextOptions,
                horizontalAlign:"center"
                
            }
            drawTextInRect(ctx,label,currentRect,textOptions);
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
// function drawTextInRect(ctx:CanvasRenderingContext2D,outerRect:Rect,label:string,getAlignmentRect:GetAlignmentRect):Rect{
//     const metrics = ctx.measureText(label);
//     const alignment = ctx.textAlign; //TODO: Continue here. The returned rect shall be dependend on ctx.textAlign, instead of a manually set alignment. 
//     const textRect = getAlignmentRect(metrics,outerRect);
//     const startPoint = baselineStartPos(textRect,metrics);
//     ctx.fillText(label,startPoint.x,startPoint.y);
//     return textRect;
// }

function drawTextInRect(ctx:CanvasRenderingContext2D,label:string,outerRect:Rect, textOptions:TextOptions):Rect{
    //drawing from: https://stackoverflow.com/a/73909790/
    ctx.save();

    ctx.font      = `${textOptions.fontWeight} ${textOptions.fontSize}px ${textOptions.fontFamily}`;
    ctx.fillStyle = textOptions.fontColor;
    
    const metrics = ctx.measureText(label);
    const {left,right} = getLeftRight(outerRect,metrics,textOptions.horizontalAlign);
    const {top,bottom} = getTopBottom(outerRect,metrics,textOptions.verticalAlign);
    const textRect = new Rect({
        x: left,
        y: top,
        width: right - left,
        height: bottom - top
    });

    const currentDirection = ctx.direction as "rtl"|"ltr";
    const startPoint = getStartPoint(textRect,currentDirection,textOptions.baseline,metrics);
    ctx.fillText(label,startPoint.x,startPoint.y);
    // ctx.strokeRect(...textRect.toArray()); //use for debugging
    ctx.restore();
    return textRect;
}

// baseline is implied at 0
type PlacementMetrics = {
    fontBoundingBoxAscent:number
    fontBoundingBoxDescent:number
    width:number
}

function getLeftRight(outerRect:Rect,metrics:PlacementMetrics,horizontalAlign:"left"|"center"|"right"){
    const {width}    = metrics;
    const outerLeft  = outerRect.left;
    const outerRight = outerRect.right;

    switch(horizontalAlign){
        case "left":
            return {
             left: outerLeft,
             right:outerLeft+width
            }
            break;
        case "center":
            const {x:horizontalCenter} = outerRect.getCenter();
            return {
                left:  Math.floor(horizontalCenter -(width/2)),
                right: Math.floor(horizontalCenter +(width/2))
            } 
            break;
        case "right":
            return {
                left:  outerRight - width,
                right: outerRight
            }
            break;
        default:
            console.log("Font alignment: No horizontal alignment parameter applies.")
            return {
                left: NaN,
                right:NaN
            }
    }
}


function getTopBottom(outerRect:Rect,metrics:PlacementMetrics,verticalAlign:"top"|"center"|"right"){
    const height      = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    const outerTop    = outerRect.top;
    const outerBottom = outerRect.bottom;
    switch(verticalAlign){
        case "top":
            return {
             top: outerTop,
             bottom:outerTop+height
            }
        case "center":
            const {y:verticalCenter} = outerRect.getCenter();
            return {
                top:Math.floor(verticalCenter - (height/2)),
                bottom: Math.floor(verticalCenter + (height/2))
            }
        case "right":
            return {
                top:outerBottom-height,
                bottom:outerBottom
            }
        default:
            console.log("Font alignment: No vertical alignment parameter applies.");
            return {
                top:   NaN,
                bottom:NaN
            }
    }
}

function getStartPoint(textRect:Rect,textDirection:WritingDirections, baseline:BaselinePositions,metrics:PlacementMetrics):Point{
    const x = (textDirection==="ltr")? textRect.left : textRect.right;
    // Ascent is the top of the box; metrics measure absolute distances from baseline 
    // to various heights. So if the baseline is top already: Distance to ascent is 0
    // if the baseline is bottom, the distance to ascent is high.
    // so I just keep adding the value to top (substracting distance to ...descent from rect.bottom would also work. )
    const y = textRect.top + metrics.fontBoundingBoxAscent;
    const startPoint = new Point({x:x,y:y});
    return startPoint;
}



// function alignCentered(metrics:PlacementMetrics,outerRect:Rect):Rect{
//     const {width,fontBoundingBoxAscent:ascent,fontBoundingBoxDescent:descent} = metrics;
//     const height = ascent+descent;
//     const outerCenter = outerRect.getCenter();
//     const textRect = new Rect({
//         x:outerCenter.x-(width/2),
//         y:outerCenter.y-(height/2),
//         width:width,
//         height:height
//     });

//     return textRect;
// }

// function alignLeft(metrics:PlacementMetrics, outerRect:Rect):Rect{
//     const {width,fontBoundingBoxAscent:ascent,fontBoundingBoxDescent:descent} = metrics;
//     const height = ascent+descent;
//     const outerCenter = outerRect.getCenter();
//     const textRect = new Rect({
//         x:outerRect.x,
//         y:outerCenter.y-(height/2),
//         width:width,
//         height:height
//     });
//     return textRect;
// }

// function baselineStartPos(textRect:Rect,metrics:PlacementMetrics):Point{
//     const verticalPos = textRect.y + metrics.fontBoundingBoxAscent;
//     const startPos = new Point({
//         x:textRect.x,
//         y:verticalPos 
//     });
//     return startPos;
// }


export {
    CheckboxElement, 
    RadioElement,
    LabelElement,
    LabelElementCentered,
    LabelElementLeftAligned,
    HeadlineElement,
    CreateLabelElementParam,
    CreateSingleSelectElementParam,
    HorizontalTabsElement,
    FigureElement

}