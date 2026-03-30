import  {Point} from "../data/point.js"
import { Rect, RectResize } from "../data/rect.js";
import { FixedConstraint, ProportionalConstraint, RectConstraint, Segment } from "../data/constraint.js";

import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import {createLeftRightResizeHandles} from "../handles/resizeHandle.js"
import {Figure, FigureJson, CreateFigureParam} from "./figure.js"
import { HorizontalLine, HorizontalLineJson } from "../data/horizontalLine.js";


type CreateHorizontalLineFigureParam = CreateFigureParam & {
    horizontalLine:HorizontalLine
}

type HorizontalLineFigureJson = FigureJson & {
    horizontalLine:HorizontalLineJson,
    thickness:number
}

class HorizontalLineFigure extends Figure{
    readonly name = "HorizontalLineFigure";

    horizontalLine:HorizontalLine
    thickness:number=4
    constraint:RectConstraint 

    constructor(param:CreateHorizontalLineFigureParam){
        super(param)
        this.horizontalLine = param.horizontalLine;;
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
        const p1 = this.rightPoint;
        const p2 = this.leftPoint;
        
        ctx.lineWidth = this.thickness;
        ctx.beginPath()
            ctx.moveTo(p1.x,p1.y) 
            ctx.lineTo(p2.x,p2.y)
        ctx.stroke();
    }
    moveBy(movement: Point): void {
        const currentLine = this.horizontalLine;
        const updatedLine = currentLine.movedCopy(movement);
        this.horizontalLine = updatedLine;
    }
    resizeByPoints(point1: Point, point2: Point): void {
        const updatedLine = HorizontalLine.createFromPoints(point1,point2);
        this.horizontalLine = updatedLine;
    }
    resizeByRectResize(resize:RectResize):void{
        const updatedLeft = this.horizontalLine.left  + resize.left;
        const updatedRight = this.horizontalLine.right + resize.right;
        const updatedLine = new HorizontalLine({
            horizontal1:updatedLeft,
            horizontal2:updatedRight,
            top:this.horizontalLine.top
        })
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
            outerRect:outerRect
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
    getParameters():CreateHorizontalLineFigureParam{
        const param = {
            horizontalLine:this.horizontalLine.copy()
        }
        return param;
    }
    toJSON(): HorizontalLineFigureJson {
        const baseFigureJson = super.toJSON();
        const horizontalLineJson = this.horizontalLine.toJSON();
        const horizontalFigureJson = {
            ...baseFigureJson,
            horizontalLine:horizontalLineJson,
            thickness:this.thickness
        };
        return horizontalFigureJson;
    }
}

export {HorizontalLineFigure, CreateHorizontalLineFigureParam}