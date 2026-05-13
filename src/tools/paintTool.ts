
import { Tool } from "../tools/tool.js";
import { LocalDragEvent, LocalMouseEvent } from "../events.js";
import { PaintOnFigureCommand } from "../commands/paintOnFigureCommand.js";
import { SelectionTool } from "../tools/selectionTool.js";
import {Paintable, RectFigure} from "../figures/rectFigure.js"
import {findElementUnderPoint} from "./trackerSelectionHelper.js"
import { NoOpTool } from "./noopTool.js";
import { Rect } from "../data/rect.js";
import { CompositeFigure } from "../figures/compositeFigure.js";
import { InteractionAnnouncementEvent } from "../events.js";

type Stroke = {startX:number,startY:number,endX:number,endY:number}
type Strokes = Stroke[]

class PaintTool extends Tool{
    #childTool:Tool = new NoOpTool();
    onMousedown(mouseEvent: LocalMouseEvent): void {
        const pos = mouseEvent.getDocumentPosition();
        const drawingView = this.getDrawingView();
        const element = findElementUnderPoint(pos,drawingView)
        if(element instanceof RectFigure){
            this.#childTool = new PaintTracker(element);
        } else {
            this.#childTool = new NoOpTool();
        }
    }
    onDragstart(mouseEvent: LocalDragEvent): void {
        this.#childTool.onDragstart(mouseEvent);
    }
    onDrag(mouseEvent: LocalDragEvent): void {
        this.#childTool.onDrag(mouseEvent);
    }
    onDragend(mouseEvent: LocalDragEvent): void {
        this.#childTool.onDragend(mouseEvent);
    }
    onHover(mouseEvent: LocalMouseEvent): void {
        const drawingView = this.getDrawingView();
        const point = mouseEvent.getDocumentPosition();
        const elementUnderPoint = findElementUnderPoint(point,drawingView)
        const interactions = elementUnderPoint.getInteractions();
        let updatedInteractions = null;
        if(interactions.paintable){
            updatedInteractions = {
                ...interactions,
                cursor:"tool_paintTool"
            }
        } else {
            updatedInteractions = {
                cursor:"tool_paintTool_no"
            }
        }
        const announcement = new InteractionAnnouncementEvent(updatedInteractions);
        drawingView.dispatchEvent(announcement);
        mouseEvent.drawingView.updateDrawing();
    }
}

class PaintTracker extends Tool {
    #strokes:Strokes = []
    #size:number=4
    #color:string="black"
    #figure:RectFigure
    constructor(figure:RectFigure){
        super()
        this.#figure = figure;
    }
    onDragstart(mouseEvent: LocalDragEvent): void {
        const drawingView =  mouseEvent.getDrawingView()
        drawingView.startPreviewOf(this.#figure);
        //const previewFigure = drawingView.getPreviewFigure() as CompositeFigure;
        //previewFigure.setIsPainted(true)
    }
    onDrag(mouseEvent: LocalDragEvent): void {
        const drawingView = mouseEvent.getDrawingView()
        //drawingView.updateDrawing(); //JUST FOR DEBUG
        const previewFigure = drawingView.getPreviewFigure() as RectFigure;
        const movement = mouseEvent.getDocumentMovement()
        const endPoint = mouseEvent.getDocumentPosition()
        const startPoint = endPoint.sub(movement);
        //drawingView.updateDrawing(); //JUST FOR DEBUG
        previewFigure.paintFromTo(startPoint,endPoint);
        const stroke = {
            startX:startPoint.x,
            startY:startPoint.y,
            endX:endPoint.x,
            endY:endPoint.y};
        this.#strokes.push(stroke);
        drawingView.updateDrawing();
    }
    onDragend(mouseEvent: LocalDragEvent): void {
        const drawingView = mouseEvent.getDrawingView();
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


export {PaintTool, Stroke,Strokes}