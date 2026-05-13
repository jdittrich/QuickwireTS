import { Point } from "../data/point.js";
import { Rect, RectResize } from "../data/rect.js";
import { Figure, CreateFigureParam } from "./figure.js";
import { Tool } from "../tools/tool.js";
import { RectConstraint } from "../data/constraint.js";
import { LocalDragEvent, LocalMouseEvent } from "../events.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import { PaintOnFigureCommand } from "../commands/paintOnFigureCommand.js";
import { SelectionTool } from "../tools/selectionTool.js";

type CreatePaintFigureParam = CreateFigureParam & {
    rect:Rect
    canvas?:OffscreenCanvas
}

type Stroke = {startX:number,startY:number,endX:number,endY:number}
type Strokes = Stroke[]

class PaintFigure extends Figure{
    #offscreenCanvas:OffscreenCanvas = new OffscreenCanvas(256, 256);
    #rect:Rect=null;
    #rectConstraint:RectConstraint
    name="PaintFigure"
    constructor(param:CreatePaintFigureParam){
        super(param);
        this.#rect = param.rect;
        const offscreenCanvas = new OffscreenCanvas(param.rect.width, param.rect.height);
        console.log("canvas size W/H", this.#rect.width, this.#rect.height);
        this.#offscreenCanvas = offscreenCanvas;
        const offscreenCtx = this.#offscreenCanvas.getContext("2d");
        if(param.canvas){
            offscreenCtx.drawImage(param.canvas,0,0);
        }
        // offscreenCtx.fillStyle = "rgba(142, 163, 184, 1)"
        // offscreenCtx.beginPath();
        // offscreenCtx.rect(0,0,256,256);
        // offscreenCtx.fill();          
    }
    drawFigure(ctx: CanvasRenderingContext2D): void {
        const offscreenContext = this.#offscreenCanvas.getContext("2d");
        console.log("drawn pf")
        ctx.drawImage(this.#offscreenCanvas,this.#rect.x,this.#rect.y);
    }
    moveBy(point: Point): void {
        const updatedRect = this.#rect.movedCopy(point);
        this.#rect = updatedRect;
    }
    resizeByPoints(point1: Point, point2: Point): void {
        const updatedRect = Rect.createFromCornerPoints(point1, point2);
        this.#resizeRect(updatedRect);
    }
    resizeByRectResize(resize:{top:number,right:number,bottom:number,left:number}):void{
        const updatedRect = this.#rect.resizedCopy(resize);
        this.#resizeRect(updatedRect);
    }
    #resizeRect(updatedRect:Rect):void{
        this.#rect = updatedRect;
        const oldCanvas = this.#offscreenCanvas;
        const newCanvas = new OffscreenCanvas(this.#rect.width,this.#rect.height);
        const newCtx = newCanvas.getContext("2d");
        newCtx.drawImage(oldCanvas,0,0);
        this.#offscreenCanvas = newCanvas;
    }
    outerFigureChange(outerRect: Rect): void {
        //thats bogus, only the position can change but not the size.
        const updatedRect = this.#rectConstraint.deriveRect(outerRect);
        this.#rect = updatedRect;
    }
    generateConstraints(): void {
        const innerRect = this.#rect;
        const outerFigure = this.getContainer()
        const outerRect = outerFigure.rect;
        const constraint = RectConstraint.fromRects({
            "outerRect":outerRect,
            "innerRect":innerRect,
            "type":"ProportionalConstraint"
        });
        
        this.#rectConstraint = constraint;
    }
    getBoundingBox(): Rect {
        const rect = this.#rect
        return rect;
    }
    getParameters(): CreatePaintFigureParam {
        const param = {
            rect:this.#rect.copy(),
            canvas:this.getCanvas()
        }
        return param;
    }
    getHandles(drawingView: DrawingView): Handle[] {
        const defaultHandles = super.getHandles(drawingView)
        const paintHandle = new PaintHandle(this,drawingView);
        const handles = [
            ...defaultHandles,
            paintHandle
        ]
        return handles;
    }
    paintFromTo(p1:Point,p2:Point, color:string="black", size:number=10){
        const ctx = this.#offscreenCanvas.getContext("2d");
        const {topLeft} = this.#rect.getCorners();
        const point1Corrected = p1.sub(topLeft);
        const point2Corrected = p2.sub(topLeft);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(point1Corrected.x,point1Corrected.y);
        ctx.lineTo(point2Corrected.x,point2Corrected.y);
        ctx.stroke();
    }
    setPaintMode(mode:"default"|"paint"|"erase"){
        
    }
    getPaintMode(){
        
    }
    getCanvas():OffscreenCanvas{
        //I would have liked this to be only internal to the figure, but
        //for undo/redo and serialization we need to get it in and out.
        const {width, height} = this.#offscreenCanvas;
        const canvasCopy = new OffscreenCanvas(width,height);
        const ctxCopy = canvasCopy.getContext("2d");
        ctxCopy.drawImage(this.#offscreenCanvas, 0,0);
        return canvasCopy;
    }
    setCanvas(canvas:OffscreenCanvas){
        this.#offscreenCanvas = canvas;
    }
    static createWithDefaultParameters(){
        const paintFigure = new PaintFigure({
            rect:new Rect({x:10,y:10,width:10,height:10}),
        });
        return paintFigure;
    }
}

class PaintHandle extends Handle{
    size = 16
    constructor(figure:PaintFigure,drawingView:DrawingView){
        super(figure,drawingView)
    }
    getColor(): string{
        return "#8728a4ff";
    }
    getLocation():Point{
        const figure = this.getFigure();
        const rect = figure.getBoundingBox();
        const center = rect.getCenter();
        const left = rect.left;
        const location = new Point({x:left,y:center.y});
        return location;
    }
    getScreenRect(): Rect {
        const drawingView = this.getDrawingView();
        const documentPos = this.getLocation();
        const screenPos = drawingView.documentToScreenPosition(documentPos);
        const screenRect = new Rect({
            x:screenPos.x-this.size,
            y:screenPos.y-this.size/2,
            width:this.size,
            height:this.size
        })
        return screenRect;
    }
    onMouseup(mouseEvent: LocalMouseEvent): void {
        const figure = this.getFigure() as PaintFigure;
        const drawingView = mouseEvent.getDrawingView();
        const paintTool = new PaintTool(figure,"black");
        drawingView.changeTool(paintTool)
    }
}

class PaintTool extends Tool{
    #strokes:Strokes = []
    #figure:PaintFigure
    #size:number=4
    #color:string="black"
    constructor(figure:PaintFigure,color:string){
        super()
        this.#figure = figure
    }
    onMouseup(mouseEvent: LocalMouseEvent): void {
        const currentPosition = mouseEvent.getDocumentPosition();
        const drawingView = this.getDrawingView();
        const drawing = drawingView.drawing;
        
        const figureUnderCursor = drawing.findFigureEnclosingPoint(currentPosition)
        if(figureUnderCursor != this.#figure){
            drawingView.changeTool(new SelectionTool())
        }
    }
    onDragstart(mouseEvent: LocalDragEvent): void {
        this.getDrawingView().startPreviewOf(this.#figure);
    }
    onDrag(mouseEvent: LocalDragEvent): void {
        const previewFigure = this.getDrawingView().getPreviewFigure() as PaintFigure;
        const movement = mouseEvent.getDocumentMovement()
        const endPoint = mouseEvent.getDocumentPosition()
        const startPoint = endPoint.sub(movement);
        previewFigure.paintFromTo(startPoint,endPoint,"black",10);
        const stroke = {
            startX:startPoint.x,
            startY:startPoint.y,
            endX:endPoint.x,
            endY:endPoint.y};
        this.#strokes.push(stroke);
        this.getDrawingView().updateDrawing();
    }
    onDragend(mouseEvent: LocalDragEvent): void {
        const drawingView = this.getDrawingView();
        const paintOnFigure = new PaintOnFigureCommand({
            figure:this.#figure,
            strokes: [...this.#strokes],
            color:this.#color,
            size:this.#size
        },drawingView);
        drawingView.do(paintOnFigure);
        this.#strokes = [];
    }
}

/* 
options:
a) I put the old canvas on undo and the new canvas on redo
b) I put the old canvas on undo and how to brushstroke on redo (but it needs to be the same strokes, then!)

How to transfer from preview to main? Here the recording might actually be a good idea... 

*/

//export {PaintFigure,PaintTool,CreatePaintFigureParam, Strokes}