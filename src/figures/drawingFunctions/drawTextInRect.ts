import { Rect } from "../../data/rect.js";
import { Point } from "../../data/point.js";

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

export {drawTextInRect,defaultTextOptions, TextOptions}