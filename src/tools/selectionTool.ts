import {Tool} from './tool.js';
import {LocalDragEvent, LocalMouseEvent} from '../events.js';
import {ChangeFigureRectCommand} from '../commands/changeRectCommand.js';
import {MoveFigureCommand} from '../commands/moveFigureCommand.js'
import { Figure } from '../figures/figure.js';
import { Handle } from '../handles/handle.js';
import { NoOpTool } from './noopTool.js';
import { Point } from '../data/point.js';
import { Drawing } from '../drawing.js';
import { NoOpFigure } from '../figures/noopFigure.js';
import { findElementUnderPoint } from './trackerSelectionHelper.js';
import { InteractionInfoProvider } from '../interfaces.js';

// type HandleFound = {
//     type:"handle";
//     value:Handle;
// }
// type FigureFound = {
//     type:"figure";
//     value:Figure,
// }

// type DrawingFound = {
//     type:"drawing",
//     value:Drawing
// }

// type NothingFound = {
//     type:"nothing",
//     value:NoOpFigure
// }

// type ElementUnderCursor = HandleFound | FigureFound | DrawingFound | NothingFound;
type ElementUnderCursor = Handle | Figure;

class SelectionTool extends Tool{
    #childTool = new NoOpTool();
    name = "selection";
    constructor(){
        super();
    }
    setChildTool(childTool:Tool){
        const drawingView = this.getDrawingView();
        this.#childTool = childTool;
        childTool.setDrawingView(drawingView);
    }
    getChildTool():Tool{
        return this.#childTool;
    }
    #elementUnderPointToTracker(elementUnderPoint:Handle|Drawing|Figure):Tool{
        const drawingView = this.getDrawingView();
        const drawing = drawingView.drawing;
        
        if(elementUnderPoint instanceof Handle){
            const handleTracker = new HandleTracker(elementUnderPoint);
            return handleTracker
        } else if (elementUnderPoint === drawing){
            const panTracker = new PanTracker();
            return panTracker;
        } else if (elementUnderPoint instanceof Figure){
            drawingView.select(elementUnderPoint);
            const dragTracker = new DragTracker(elementUnderPoint);
            return dragTracker
        } else {
            this.setChildTool(new NoOpTool());
            throw new Error("one of the above conditions should always be the case");
        }
    }
    onMousedown(event: LocalMouseEvent){
        const point = event.getDocumentPosition();
        const drawingView = event.getDrawingView()
        const elementUnderPoint = findElementUnderPoint(point,drawingView)

        const childTool = this.#elementUnderPointToTracker(elementUnderPoint);
        this.setChildTool(childTool);
        this.#childTool.onMousedown(event);
    }
    onHover(event:LocalMouseEvent){
        const drawingView = this.getDrawingView();
        const point = event.getDocumentPosition();
        const elementUnderPoint = findElementUnderPoint(point,drawingView)

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
    onKeydown(): void {
        console.log("selection tool key pressed");
    }
}

// #region: Trackers
// Trackers are child tools for other tools. They are not initialized with "changeTool" on view
// they thus do not have this.drawingView (but they can use the view from the event)


class PanTracker extends Tool{
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
            mouseEvent.getDrawingView().clearSelection();
        }
    }

}

class DragTracker extends Tool{
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
        dragPreviewFigure.moveBy(movement);

        //create highlighted drop target
        const drawing = event.drawingView.drawing;

        try{ 
            const figureEnclosingRect = drawing.findEnclosingCompositeFigure(dragPreviewFigure.getBoundingBox())
            drawingView.startHighlightOf(figureEnclosingRect);//maybe that should just be "highlight"
        }catch(e){ }

        event.drawingView.updateDrawing();

    }
    onDragend(event:LocalDragEvent){
        //event.drawingView.endPreview()
        const drawingView = this.getDrawingView();
        const moveBy = event.getDocumentDragMovement();
        const figure = this.#figureToDrag;

        const oldRect = figure.getBoundingBox();
        const changedRect = oldRect.movedCopy(moveBy);
        const isInBounds = drawingView.drawing.isEnclosingRect(changedRect);
        if(!isInBounds){
            console.log("changed figure would be out of bounds, aborting command")
            return;
        }
        const changeRectParam = {
            "moveBy":moveBy,
            "figure":figure
        }

        const moveCommand = new MoveFigureCommand(changeRectParam,drawingView);
        
        drawingView.do(moveCommand);
    }
}

class HandleTracker extends Tool{
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
}

export {SelectionTool, PanTracker, HandleTracker,DragTracker}