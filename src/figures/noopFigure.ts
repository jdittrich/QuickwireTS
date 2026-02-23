import { Figure } from "./figure.js";
import { Rect } from "../data/rect.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import { Point } from "../data/point.js";
import { CompositeFigure } from "./compositeFigure.js";

class NoOpFigure extends Figure{
    name = "noOp";
    constructor(){
        super({});
    }
    //overwrite methods that do anything in base Figure
    drawFigure(ctx:CanvasRenderingContext2D):void{}
    drawHighlight(ctx: CanvasRenderingContext2D): void {}
    getHandles(drawingView: DrawingView): Handle[] {
        return []
    }
    moveBy(point: Point): void {}
    outerFigureChange(outerRect: Rect): void {}
    generateConstraints(): void {}
    getBoundingBox(): Rect {
        return new Rect({x:0,y:0,width:0,height:0})
    }
    resizeByPoints(point1: Point, point2: Point):void{

    }
}

export {NoOpFigure}