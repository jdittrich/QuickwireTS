import {Tool} from './tool.js';
import {LocalDragEvent, LocalMouseEvent} from '../events.js';
import { Figure } from '../figures/figure.js';
import { Handle } from '../handles/handle.js';
import { NoOpTool } from './noopTool.js';
import { Drawing } from '../drawing.js';
import { findElementUnderPoint } from './trackerSelectionHelper.js';
import { PanTracker } from './panTracker.js';
import { HandleTracker } from './handleTracker.js'
import { DragTracker } from './dragTracker.js';
import { Point } from '../data/point.js';


/** Default tool that allows selection, dragging of figures and dragging handles */
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
    #getTracker(event:LocalMouseEvent){
        const drawingView = this.getDrawingView()
        const documentPoint = event.getDocumentPosition();

        const elementUnderPoint = findElementUnderPoint(documentPoint,drawingView)

        const drawing = drawingView.drawing;
        if(elementUnderPoint === drawing || event.middleButton){
            const panTracker = new PanTracker();
            return panTracker;
        } else if (elementUnderPoint instanceof Handle){
            const handleTracker = new HandleTracker(elementUnderPoint);
            return handleTracker
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
        const childTool = this.#getTracker(event);
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


export {SelectionTool, PanTracker, HandleTracker,DragTracker}