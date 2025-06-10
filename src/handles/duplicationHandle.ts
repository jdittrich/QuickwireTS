import { Handle } from "./handle.js";
import { LocalDragEvent, LocalMouseEvent } from "../events.js";
import { DrawingView } from "../drawingView.js";
import { Figure } from "../figures/figure.js";
import { Rect } from "../data/rect.js";
import { Point } from "../data/point.js";
import { DuplicateFigureCommand } from "../commands/duplicateFigureCommand.js";

/**
 * Adds a handle that allows to duplicate a figure upon click or by dragging. 
 * Similar to the usual pressing of alt+drag, but without a key.
 */
class DuplicationHandle extends Handle{
    #size = 20;
   
    constructor(figure:Figure,drawingView:DrawingView){
        super(figure,drawingView);
    }
    draw(ctx:CanvasRenderingContext2D){
        const {x,y,width,height} = this.getScreenRect();
        ctx.fillStyle ="rgb(230, 244, 247)";
        ctx.fillRect(x,y,width,height);
        ctx.strokeStyle ="rgb(126, 155, 161)";
        ctx.strokeRect(x,y,width,height);

        //draw a little duplication icon:
        ctx.strokeStyle = "#000";
        ctx.strokeRect(x+3, y+3,9,8);
        ctx.strokeRect(x+8, y+8,9,8);
    }
    getScreenRect():Rect{
        const drawingView = this.getDrawingView();
        const figure = this.getFigure();
        const figureRect = figure.getRect();
        const {bottomRight} = figureRect.getCorners();
        const drawAnchorScreen = drawingView.documentToScreenPosition(bottomRight);
        const screenRect = new Rect({
            x:      drawAnchorScreen.x + (this.#size *2),
            y:      drawAnchorScreen.y,
            width:  this.#size,
            height: this.#size
        });
        return screenRect;
    }
    #isDocumentPointInHandle(documentPoint:Point){
        const screenRect = this.getScreenRect();
        const drawingView = this.getDrawingView();
        const screenPoint = drawingView.documentToScreenPosition(documentPoint);
        const isPointInHandle = screenRect.isEnclosingPoint(screenPoint);
        return isPointInHandle;
    }
    #createChangedRect(dragMovement:Point){
        //get drag movement, return new Rectangle
        const figure = this.getFigure();
        const rect = figure.getRect();
        const newRect = rect.movedCopy(dragMovement);
        return newRect;
    }
    onMouseUp(mouseEvent:LocalMouseEvent){
        // if mouseup is still in the handle, copy the figure with a minor offset
        // implement after dragging works
    }
    onDragstart(dragEvent:LocalDragEvent):void{
        // start preview
        const drawingView = this.getDrawingView();
        drawingView.startPreviewOf(this.getFigure(),false); 
    }
    onDrag(dragEvent:LocalDragEvent){
        const drawingView = this.getDrawingView();
        const dragMovement = dragEvent.getDocumentDragMovement();
        const previewFigure = drawingView.getPreviewedFigure();
        const newPreviewFigureRect = this.#createChangedRect(dragMovement);
        previewFigure.setRect(newPreviewFigureRect);
    }
    onDragend(dragEvent:LocalDragEvent){
        //check if copy can be placed
        const drawingView = this.getDrawingView();
        const dragMovement = dragEvent.getDocumentDragMovement();
        const resizedFigureRect = this.#createChangedRect(dragMovement);
        const isInBounds = drawingView.drawing.isEnclosingRect(resizedFigureRect);
        if(!isInBounds){
            console.log("Changed Figure would be out of bounds, aborting command");
            return;
        }
        const duplicateFigureCommand = new DuplicateFigureCommand({figure:this.getFigure(), newRect:resizedFigureRect},drawingView)
        drawingView.do(duplicateFigureCommand);
    }
    dragExit(){
        const drawingView = this.getDrawingView();
        drawingView.endPreview();
    }
    getInteractions(){
        return { 
            cursor: "grab",
            helpText: "duplicates figure by dragging",
            draggable: true, 
            clickable: false 
        };
    }
}

export {DuplicationHandle}