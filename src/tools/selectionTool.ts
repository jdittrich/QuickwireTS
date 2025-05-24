    import {AbstractTool} from './abstractTool.js';
import {LocalDragEvent, LocalMouseEvent} from '../events.js';
import {ChangeFigureRectCommand} from '../commands/changeRectCommand.js';
import { Figure } from '../figures/figure.js';
import { Handle } from '../handles/handle.js';
import { NoOpTool } from './noopTool.js';
import { Point } from '../data/point.js';
import { Drawing } from '../drawing.js';
import { NoOpFigure } from '../figures/noopFigure.js';
import { InteractionInfoProvider } from '../interfaces.js';

type HandleFound = {
    type:"handle";
    value:Handle;
}
type FigureFound = {
    type:"figure";
    value:Figure,
}

type DrawingFound = {
    type:"drawing",
    value:Drawing
}

type NothingFound = {
    type:"nothing",
    value:NoOpFigure
}

// type ElementUnderCursor = HandleFound | FigureFound | DrawingFound | NothingFound;
type ElementUnderCursor = Handle | Figure;

class SelectionTool extends AbstractTool{
    #childTool = new NoOpTool();
    name = "selection";
    constructor(){
        super();
    }
    setChildTool(childTool:AbstractTool){
        const drawingView = this.getDrawingView();
        this.#childTool = childTool;
        childTool.setDrawingView(drawingView);
    }
    getChildTool():AbstractTool{
        return this.#childTool;
    }
    #whatIsUnderPoint(documentPoint:Point):ElementUnderCursor{
        //are we over a figure?
        const drawingView = this.getDrawingView();
        const drawing = drawingView.drawing;
        const figureEnclosingPoint = drawing.findFigureEnclosingPoint(documentPoint);
        
        // if(!figureEnclosingPoint){ //outside of root figure
        //     return {
        //         type:"nothing",
        //         value:new NoOpFigure()
        //     }
        // }
        if(!figureEnclosingPoint){
            return new NoOpFigure();
        }
        //get handles from an already selected figure.
        const handles = drawingView.getHandles();
        const handleUnderPoint = handles.find(handle=> handle.isEnclosingPoint(documentPoint));
        
        if(handleUnderPoint){
            return handleUnderPoint
        } else if (figureEnclosingPoint){
            return figureEnclosingPoint
        } else {
            throw new Error("one of the above conditions should always be the case");
        }
        // if(handleUnderPoint){
        //     //if we are over a handle,  keep selection, change handle
        //     return {
        //         type:"handle",
        //         value:handleUnderPoint
        //     }
        // } else if (figureEnclosingPoint === drawing){ //clicked document, but no movable figure
        //     return {
        //         type:"drawing",
        //         value:drawing
        //     }
        // } else if(figureEnclosingPoint){ //at least one figure under mouse
        //     return {
        //         type:"figure",
        //         value:figureEnclosingPoint
        //     }
        // } else {
        //     throw new Error("one of the above conditions should always be the case");
            
        // }
    
    }
    onMousedown(event: LocalMouseEvent){
        const cursorPosition = event.getDocumentPosition();
        const elementUnderPoint = this.#whatIsUnderPoint(cursorPosition);
        const drawingView = this.getDrawingView();
        const drawing = drawingView.drawing;

        if(elementUnderPoint instanceof Handle){
            const handleTracker = new HandleTracker(elementUnderPoint);
            this.setChildTool(handleTracker);
        } else if (elementUnderPoint === drawing){
            const panTracker = new PanTracker();
            this.setChildTool(panTracker);
        } else if (elementUnderPoint instanceof Figure){
            event.drawingView.select(elementUnderPoint);
            const dragTracker = new DragTracker(elementUnderPoint);
            this.setChildTool(dragTracker);
        } else {
            this.setChildTool(new NoOpTool());
            throw new Error("one of the above conditions should always be the case");
        }
        // const type = elementUnderPoint.type;
        // const value = elementUnderPoint.value;
        // if(type === "handle"){
        //     //if we are over a handle,  keep selection, change handle
        //     const handleTracker = new HandleTracker(value);
        //     this.setChildTool(handleTracker);
        // } else if (type === "drawing"){ //clicked document, but no movable figure
        //     const panTracker = new PanTracker();
        //     this.setChildTool(panTracker);
        // } else if(type === "figure"){ //at least one figure under mouse
        //     //if we are over a figure, select and go do drag mode
        //     const figureUnderCursor = elementUnderPoint.value;
        //     event.drawingView.select(figureUnderCursor);
        //     const dragTracker = new DragTracker(figureUnderCursor);
        //     this.setChildTool(dragTracker);
        // } else {
        //     this.setChildTool(new NoOpTool());
        //     throw new Error("one of the above conditions should always be the case");
        // }

        this.#childTool.onMousedown(event);
    }
    onHover(event:LocalMouseEvent){
        const drawingView = this.getDrawingView();
        const cursorPosition = event.getDocumentPosition();
        const elementUnderPoint = this.#whatIsUnderPoint(cursorPosition);

        drawingView.startHighlightOf(elementUnderPoint);
        drawingView.announceInteractionsOf(elementUnderPoint);
       
        event.drawingView.updateDrawing();
    }
    onDragstart(event:LocalDragEvent){
        event.drawingView.endHighlight(); //otherwise the highlight stays around at the same place
        this.#childTool.onDragstart(event);
    }
    onDrag(event:LocalDragEvent){
        this.#childTool.onDrag(event);
    }
    onDragend(event:LocalDragEvent){
        this.#childTool.onDragend(event);
    }
    onMouseup(event:LocalMouseEvent){
        this.#childTool.onMouseup(event);
        event.drawingView.updateDrawing();
        this.#childTool = null; 
    }
    onWheel(event:LocalMouseEvent,wheelDelta:number){
        const changeFactor = (wheelDelta>0) ? 0.8:1.2; 
        const screenPosition = event.getScreenPosition()
        event.drawingView.scaleBy(changeFactor,screenPosition);
    }
    dragExit(){
        this.#childTool.dragExit();
    }
    onKeydown(): void {
        console.log("selection tool key pressed");
    }
}

// #region: Trackers
// Trackers are child tools for other tools. They are not initialized with "changeTool" on view
// they thus do not have this.drawingView (but they can use the view from the event)


class PanTracker extends AbstractTool{
    name="panTracker"
    #hasMoved = false
    /**
     * @param {LocalMouseEvent} event 
     */
    onDragstart(mouseEvent: LocalDragEvent): void {
        this.#hasMoved = true
    }
    onDrag(event:LocalDragEvent){
        const dragMovement = event.getScreenMovement();
        event.drawingView.panBy(dragMovement);
    }
    onMouseup(mouseEvent: LocalMouseEvent): void {
        if(this.#hasMoved===false){
            this.getDrawingView().clearSelection();
        }
    }

}

class DragTracker extends AbstractTool{
    name="dragTracker"
    #figureToDrag:Figure

    constructor(figureToDrag:Figure){
        super();
        this.#figureToDrag = figureToDrag;
    }


    onDragstart(event:LocalDragEvent){
        this.getDrawingView().startPreviewOf(this.#figureToDrag);
    }
    /**
     * @param {LocalDragEvent} event 
     */
    onDrag(event:LocalDragEvent){
        //move figure
        const drawingView = this.getDrawingView();
        const dragPreviewFigure = drawingView.getPreviewedFigure();
        const movement = event.getDocumentMovement();
        dragPreviewFigure.movePositionBy(movement);

        //create highlighted drop target
        const drawing = event.drawingView.drawing;

        try{ 
            const figureEnclosingRect = drawing.findFigureEnclosingRect(dragPreviewFigure.getRect())
            drawingView.startHighlightOf(figureEnclosingRect);//maybe that should just be "highlight"
        }catch(e){ }

        event.drawingView.updateDrawing();

    }
    onDragend(event:LocalDragEvent){
        //event.drawingView.endPreview()

        const drawingView = this.getDrawingView();
        const moveBy = event.getDocumentDragMovement();
        const figure = this.#figureToDrag;
        // const moveCommand = new MoveFigureCommand({
        //     "moveBy": moveBy,
        //     "figure": this.#figureToDrag
        // }, drawingView);

        const oldRect = figure.getRect();
        const changedRect = oldRect.movedCopy(moveBy);
        const isInBounds = drawingView.drawing.isEnclosingRect(changedRect);
        if(!isInBounds){
            console.log("changed figure would be out of bounds, aborting command")
            return;
        }
        const changeRectParam = {
            "changedRect":changedRect,
            "figure":figure
        }

        const moveCommand = new ChangeFigureRectCommand(changeRectParam,drawingView);
        
        drawingView.do(moveCommand);
    }
    dragExit(){
        const drawingView = this.getDrawingView();
        drawingView.endPreview()
        drawingView.updateDrawing();
    }
}

class HandleTracker extends AbstractTool{
    name = "handleTracker"
    #handleToDrag = null

    constructor(handle:Handle){
        super();
        this.#handleToDrag = handle;
    }
    onMousedown(event:LocalMouseEvent){
        this.#handleToDrag.onMousedown(event);
        this.getDrawingView().updateDrawing();
    }
    onDragstart(dragEvent:LocalDragEvent){
        this.#handleToDrag.onDragstart(dragEvent)
        this.getDrawingView().updateDrawing();
    }
    onDrag(dragEvent:LocalDragEvent){
        this.#handleToDrag.onDrag(dragEvent);
        this.getDrawingView().updateDrawing();
    }
    onDragend(dragEvent:LocalDragEvent){
        this.#handleToDrag.onDragend(dragEvent);
        this.getDrawingView().updateDrawing();
    }
    dragExit(): void {
        this.#handleToDrag.dragExit();
    }
}

export {SelectionTool}