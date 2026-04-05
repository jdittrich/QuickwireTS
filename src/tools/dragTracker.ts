import { LocalDragEvent } from "../events.js";
import { Tool } from "./tool.js";
import { Figure } from "../figures/figure.js";
import { MoveFigureCommand } from "../commands/moveFigureCommand.js";

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

export {DragTracker}