import {LocalDragEvent, LocalMouseEvent} from '../events.js'
import {Point} from '../data/point.js';
import { DrawingView } from '../drawingView.js';


/**
 * Abstract class that tools can extend
 *  
 * - provides every tool with a setView method, which a drawingView.changeTool calls when changing tools
 * - provides empty methods to handle events. Implement in extending class to enable your tool to react to these events.
 *   No need to implement all; if you do not implement them the ones from AbtractTool are called, which do nothing.
 * 
 * NOTES: 
 * - The general event order is: mousemove → mousedown → dragStart → mousemove → drag → dragEnd → mouseup → mousemove
 *   So the "drag" events are enclosed by the normal mouse events (down before dragStart and dragEnd before up), while dragging, mousemove comes before drag.
 * 
 * @see {DrawingView} which calls the tool methods and shows how the calling of the functions is implemented.
 */
class AbstractTool{
    #drawingView = null;
    name = null;
    constructor(){
       
    }
    /**
     * Internal use only. Counterpart to toolManager’s change tool; this way, 
     * Every tool "knows" the view, so it can use it to change to another tool
     * @param {DrawingView} drawingView
     * @see: DrawingView
     */
    setDrawingView(drawingView:DrawingView){ 
        this.#drawingView = drawingView;
    }
    getDrawingView():DrawingView{
        return this.#drawingView;
    }
    onKeydown(){}
    onKeyup(){}
    onMousedown(mouseEvent: LocalMouseEvent){}
    onMousemove(mouseEvent: LocalMouseEvent){}
    onMouseup(mouseEvent: LocalMouseEvent){}
    onHover(mouseEvent: LocalMouseEvent){}
    onDrag(mouseEvent: LocalDragEvent){ }
    onDragstart(mouseEvent: LocalDragEvent){}
    onDragend(mouseEvent: LocalDragEvent){}
    onWheel(mouseEvent:LocalMouseEvent,wheelDelta:number){}
    dragExit(){} //to be called after dragend
    //what if there would be a cleanup method, called before a tool is switched out?
}

export {AbstractTool}