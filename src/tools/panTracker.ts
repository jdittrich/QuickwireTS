import { LocalDragEvent } from "../events.js";
import { Tool } from "./tool.js";
import { LocalMouseEvent } from "../events.js";

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

export {PanTracker}