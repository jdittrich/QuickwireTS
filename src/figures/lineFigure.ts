import  {Point} from "../data/point.js"
import { Rect, RectResize } from "../data/rect.js";
import { ProportionalConstraint, RectConstraint, Segment } from "../data/constraint.js";

import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import {createLeftRightResizeHandles} from "../handles/resizeHandle.js"
import {Figure, FigureJson, CreateFigureParam} from "./figure.js"
import { HorizontalLine, HorizontalLineJson } from "../data/horizontalLine.js";
import { Drawable } from "../interfaces.js";
import { FigureAttributes } from "./figureAttributes.js";
import { FormElementFactory, FormElement } from "../app_formElements.js";
import { ChangeAttributeCommand, ChangeAttributeCommandParam } from "../commands/changeAttributeCommand.js";

type EndingTypes = "default"|"emptyCheckbox"|"fullCheckbox"|"emptyRadio"|"fullRadio"

type LineFigureAttributes =  {
    lineLeftEnd:EndingTypes;
    lineRightEnd:EndingTypes;
}

type CreateHorizontalLineFigureParam = CreateFigureParam & {
    horizontalLine:HorizontalLine
    lineStart?:EndingTypes
    lineEnd?:EndingTypes
}

type HorizontalLineFigureJson = FigureJson & {
    type:string;
    horizontalLine:HorizontalLineJson;
    lineLeftEnd:EndingTypes;
    lineRightEnd:EndingTypes;
}


// const rect=function(){

// }
// const checkmark=function(){

// }
// const radioOuter=function(){

// }

// const radioInner = function(){

// }



type DrawLineFromTo = (ctx:CanvasRenderingContext2D,line:HorizontalLine)=>void
type DrawElementAt  = (ctx:CanvasRenderingContext2D,point:Point)=>void

// the space for drawing are the dimensions of the line. 
// there are endings and there is a middle part. 
// By convention: 
// the endings are 20 units wide BUT they can draw upon 25 units, so they 
// can overlap with the line. 
// so that it it is possible to blend middle and end parts togehter through overlaps. 
// 

const drawBoxAround:DrawElementAt = function(ctx:CanvasRenderingContext2D,place:Point){
    const boxSize=16;

    const topLeft = new Point({
        x:place.x-(boxSize/2),
        y:place.y-(boxSize/2)
    })

    ctx.strokeRect(topLeft.x, topLeft.y, boxSize, boxSize);
}

const drawDefaultEndAround:DrawElementAt = function(ctx:CanvasRenderingContext2D,place:Point){
    const length=21;
    ctx.moveTo(place.x-(length/2),place.y);
    ctx.lineTo(place.x+(length/2),place.y)
    ctx.stroke()
}

const drawMiddleLine= function(ctx:CanvasRenderingContext2D,line:HorizontalLine){
    const leftPoint = line.leftPoint;
    const rightPoint = line.rightPoint;
    ctx.moveTo(leftPoint.x, leftPoint.y);
    ctx.lineTo(rightPoint.x,rightPoint.y)
    ctx.stroke()
}

const drawCheckmarkedBox:DrawElementAt = function(ctx:CanvasRenderingContext2D,place:Point){
    const boxSize=16;

    const startBoxAt = new Point({
        x:place.x-(boxSize/2),
        y:place.y-(boxSize/2)
    })

    const startLineAt= startBoxAt.add(new Point({x:4,y:8}));
    const bottomLineAt = new Point({
        x:startBoxAt.x +(boxSize/2),
        y:startLineAt.y+ 4
    })
    const topLineAt = startBoxAt.add(new Point({
        x:boxSize-4,
        y:4
    }))

    ctx.moveTo(startLineAt.x, startLineAt.y);
    ctx.lineTo(bottomLineAt.x, bottomLineAt.y);
    ctx.lineTo(topLineAt.x,topLineAt.y);
    ctx.stroke;

    drawBoxAround(ctx,place);
}    

const drawEmptyRadioAround = function(ctx:CanvasRenderingContext2D,place:Point){
    ctx.beginPath();
    ctx.arc(place.x, place.y, 8, 0, 2 * Math.PI);
    ctx.stroke();
}

const drawFullRadioAround = function(ctx:CanvasRenderingContext2D,place:Point){
    ctx.beginPath();
    ctx.arc(place.x, place.y, 4, 0, 2 * Math.PI);
    ctx.fill();
    drawEmptyRadioAround(ctx,place);
}

const lineEndingRegistry:Record<EndingTypes,DrawElementAt> = {
    "default":          drawDefaultEndAround,
    "emptyCheckbox":    drawBoxAround,
    "fullCheckbox":     drawCheckmarkedBox,
    "emptyRadio":       drawEmptyRadioAround,
    "fullRadio":        drawFullRadioAround
}




// /**
//  * Define style on creation.
//  * Pass it a line and get a line drawn 
//  * */
// class LineDrawer{ 
//     startType:EndingTypes
//     lineStart:DrawElementAt = drawBoxAt

//     lineMiddle:DrawLineFromTo= drawStraightLineFromTo
//     dimensions:Point
//     thickness = 4
//     endingsWidth = 20
//     constructor(param:{start?:DrawElementAt}){
//         this.lineStart = param.start;
//     }
//     draw(ctx:CanvasRenderingContext2D, line:HorizontalLine){
//         ctx.lineWidth = 2;
//         this.lineStart(ctx,line.leftPoint)
//         //lineEnd.draw(ctx,line.rightPoint)

//         ctx.lineWidth = this.thickness;
//         const middleLine = new HorizontalLine({
//             horizontal1: line.left  + this.endingsWidth,
//             horizontal2: line.right,
//             top:line.top
//         });

//         this.lineMiddle(ctx,middleLine)
//     }
//     toJSON(){

//     }
//     static fromJSON(){

//     }
//     static createFromNames(param:{start:EndingTypes}){
//         let start = null; 
//         switch (param.start){
//             case "default":
//                 start = drawDefaultStartAt
//                 break;
//             case "emptyCheckbox":
//                 start = drawBoxAt
//                 break
//             default:
//                 start = drawDefaultStartAt
//         }
//         const lineDrawer = new LineDrawer({start:start})
//         return lineDrawer;
//     }
// }






class HorizontalLineFigure extends Figure{
    readonly name = "HorizontalLineFigure";

    horizontalLine:HorizontalLine

    constraint:RectConstraint 

    //attributes:FigureAttributes<LineFigureAttributes>= new FigureAttributes<LineFigureAttributes>();

    constructor(param:CreateHorizontalLineFigureParam){
        super(param)

        this.attributes.register({
            "lineRightEnd":String,
            "lineLeftEnd":String
        });

        const lineEnd:EndingTypes = param.lineEnd ||"default";
        const lineStart: EndingTypes = param.lineStart ||"default";
        this.attributes.set("lineRightEnd",lineEnd);
        this.attributes.set("lineLeftEnd", lineStart);
        this.horizontalLine = param.horizontalLine;
    }
    get leftPoint():Point{
        const leftPoint = new Point({
            x:this.horizontalLine.left,
            y:this.horizontalLine.top
        });
        return leftPoint
    }
    get rightPoint(){
        const rightPoint = new Point({
            x:this.horizontalLine.right,
            y:this.horizontalLine.top
        });
        return rightPoint
    }
    get bottom(){
        return this.horizontalLine.top;
    }
    drawFigure(ctx: CanvasRenderingContext2D): void {
        
        const line = this.horizontalLine;

        const leftLineEndAttribute = this.getAttribute("lineLeftEnd") as EndingTypes;
        const drawLeftLineEnd:DrawElementAt = lineEndingRegistry[leftLineEndAttribute];
        
        const rightLineEndAttribute = this.getAttribute("lineRightEnd") as EndingTypes;
        const drawRightLineEnd = lineEndingRegistry[rightLineEndAttribute] ;
        
        const shortenLineBy = 20;
    
        const leftShortenedLineEndAt =   line.leftPoint.add(new Point({x:shortenLineBy,y:0}));
        const rightShortenedLineEndAt =  line.rightPoint.sub(new Point({x:shortenLineBy,y:0}));
        const leftOfLineCenter = line.leftPoint.add(new Point({x:(shortenLineBy/2),y:0}));
        const rightOfLineCenter = line.rightPoint.sub(new Point({x:(shortenLineBy/2),y:0}))
        
        drawMiddleLine(ctx,HorizontalLine.createFromPoints(leftShortenedLineEndAt,rightShortenedLineEndAt));
        drawLeftLineEnd(ctx,leftOfLineCenter);
        drawRightLineEnd(ctx, rightOfLineCenter);
        
    }
    onAttributeUpdate(key: string, value: any, attributes: FigureAttributes): void {

    }
    moveBy(movement: Point): void {
        const currentLine = this.horizontalLine;
        const updatedLine = currentLine.movedCopy(movement);
        this.updateLine(updatedLine);
    }
    resizeByPoints(point1: Point, point2: Point): void {
        const updatedLine = HorizontalLine.createFromPoints(point1,point2);
        this.updateLine(updatedLine)
    }
    resizeByRectResize(resize:RectResize):void{
        const updatedLeft = this.horizontalLine.left  + resize.left;
        const updatedRight = this.horizontalLine.right + resize.right;
        const updatedLine = new HorizontalLine({
            horizontal1:updatedLeft,
            horizontal2:updatedRight,
            top:this.horizontalLine.top
        })
        this.updateLine(updatedLine);
    }
    updateLine(updatedLine:HorizontalLine){
        this.horizontalLine = updatedLine;
    }
    outerFigureChange(outerRect: Rect): void {
        //const outerSegment = new Segment(outerRect.left,outerRect.right);
        const updatedRect = this.constraint.deriveRect(outerRect);
        const updatedLine = new HorizontalLine({
            horizontal1: updatedRect.left,
            horizontal2: updatedRect.right,
            top:updatedRect.top
        });
        this.horizontalLine = updatedLine;
    }
    generateConstraints(): void {
        const outerFigure = this.getContainer();
        const outerRect = outerFigure.getRect();
        const innerRect = Rect.createFromCornerPoints(
            this.horizontalLine.leftPoint, 
            this.horizontalLine.rightPoint
        );

        const constraint = RectConstraint.fromRects({
            innerRect:innerRect,
            outerRect:outerRect,
            type:"ProportionalConstraint"
        }); 
        //ProportionalConstraint.fromSegments(outerSegment,innerSegment);
        this.constraint = constraint;
    }
    
    getBoundingBox(): Rect {
        //Since a horizontal/vertical line might be hard to hit
        //we make the box a bit larger 
        const boundingBox = Rect.createFromCornerPoints(this.leftPoint, this.rightPoint);
        const {topLeft,bottomRight} = boundingBox.getCorners();
        const largerTopLeft = topLeft.add(
            new Point({x:-2,y:-2})//move further top-left
        );
        const largerBottomRight = bottomRight.add(
            new Point({x:2,y:2}) //move further bottom-right
        );
        const largerRect = Rect.createFromCornerPoints(
            largerTopLeft,
            largerBottomRight
        );
        return largerRect;
    }
    getHandles(drawingView: DrawingView): Handle[] {
        const baseHandles = super.getHandles(drawingView)
        const leftRightHandles = createLeftRightResizeHandles(this,drawingView)
        const handles = [
            ...baseHandles,
            ...leftRightHandles
        ]
        return handles;
    }
    getFormElements(drawingView: DrawingView, formElementFactory: FormElementFactory): FormElement<any>[] {
        const lineLeftEndDropdown =  formElementFactory.createDropdown({
            label:"left end",
            selectedValue:this.getAttribute("lineLeftEnd"),
            values:Object.keys(lineEndingRegistry),
            changeHandler:(changedTo:string)=>{
                const changeAttributeParam:ChangeAttributeCommandParam = {
                    figure:this,
                    attribute:"lineLeftEnd",
                    value:changedTo
             }
             const lineLeftEndCommand = new ChangeAttributeCommand(changeAttributeParam,drawingView);
             drawingView.do(lineLeftEndCommand);
            }
        })
        const lineRightEndDropdown = formElementFactory.createDropdown({
            label:"right end",
            selectedValue:this.getAttribute("lineRightEnd"),
            values:Object.keys(lineEndingRegistry),
            changeHandler:(changedTo:string)=>{
                const changeAttributeParam:ChangeAttributeCommandParam = {
                    figure:this,
                    attribute:"lineRightEnd",
                    value:changedTo
             }
             const lineRightEndCommand = new ChangeAttributeCommand(changeAttributeParam,drawingView);
             drawingView.do(lineRightEndCommand);
            }
        })
        return [lineLeftEndDropdown,lineRightEndDropdown]
    }
    getParameters():CreateHorizontalLineFigureParam{
        const param = {
            horizontalLine:this.horizontalLine.copy(),
            lineStart: this.getAttribute("lineLeftEnd"),
            lineEnd: this.getAttribute("lineRightEnd")
        }
        return param;
    }
    toJSON(): HorizontalLineFigureJson {
        const baseFigureJson = super.toJSON();
        const horizontalLineJson = this.horizontalLine.toJSON();
        const horizontalFigureJson = {
            ...baseFigureJson,
            horizontalLine:horizontalLineJson,
            lineLeftEnd: this.getAttribute("lineLeftEnd") as EndingTypes,
            lineRightEnd: this.getAttribute("lineRightEnd") as EndingTypes,
        };
        return horizontalFigureJson;
    }
    // static fromJSON(json:HorizontalLineFigureJson):HorizontalLineFigure{
    //     const params:CreateHorizontalLineFigureParam = {
    //             horizontalLine: HorizontalLine.fromJSON(json.horizontalLine),
    //             lineStart:json.lineLeftEnd,
    //             lineEnd:json.lineRightEnd
    //     }
    //     const horizontalLineFigure = new HorizontalLineFigure(params)
    //     return horizontalLineFigure;
    // }
}

export {HorizontalLineFigure, CreateHorizontalLineFigureParam, HorizontalLineFigureJson}