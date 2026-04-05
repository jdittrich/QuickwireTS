import { LocalDragEvent } from "../events.js";
import { Tool } from "./tool.js";
import { LocalMouseEvent } from "../events.js";
import { Handle } from "../handles/handle.js";


/**
 * Pass drag interactions to handles
 */
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

export {HandleTracker}