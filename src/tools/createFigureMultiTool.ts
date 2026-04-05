import { Point } from "../data/point.js";
import { Tool } from "./tool.js";
import { DrawingView } from "../drawingView.js";
import { LocalDragEvent, LocalMouseEvent } from "../events.js";
import { Handle } from "../handles/handle.js";
import { HandleTracker } from "./handleTracker.js";
import { CreateFigureMultiTracker } from "./createFigureMultiTracker.js";
import { findElementUnderPoint } from "./trackerSelectionHelper.js";

class CreateFigureMultiTool extends Tool{
    #childTool:Tool
    constructor(){
        super();
        this.name = "CreateFigureMulti"
    }
    setChildTool(childTool:Tool){
        const drawingView = this.getDrawingView();
        this.#childTool = childTool;
        childTool.setDrawingView(drawingView);
    }
    getChildTool():Tool{
        return this.#childTool;
    }
    getTracker(point:Point, drawingView:DrawingView):CreateFigureMultiTracker|HandleTracker{
        const elementUnderPoint = findElementUnderPoint(point,drawingView)

        if(elementUnderPoint instanceof Handle){
            const handleTracker = new HandleTracker(elementUnderPoint);
            return handleTracker
        } else{
            const createFigureMultiTracker = new CreateFigureMultiTracker()
            return createFigureMultiTracker;
        }
    }
    onMousedown(mouseEvent: LocalMouseEvent): void {
        const point = mouseEvent.getDocumentPosition();
        const drawingView = mouseEvent.getDrawingView()
        const tracker = this.getTracker(point,drawingView);
        this.setChildTool(tracker);
    }
    
    onDragstart(mouseEvent: LocalDragEvent){
        this.#childTool.onDragstart(mouseEvent);
    }
    onDrag(mouseEvent: LocalDragEvent){ 
        this.#childTool.onDrag(mouseEvent);
    }
    onDragend(mouseEvent: LocalDragEvent){
        this.#childTool.onDragend(mouseEvent); 
    }
    onWheel(event:LocalMouseEvent,wheelDelta:number){
        const changeFactor = (wheelDelta>0) ? 0.8:1.2; 
        const screenPosition = event.getScreenPosition()
        event.drawingView.scaleBy(changeFactor,screenPosition);
    }
}



export {CreateFigureMultiTool}