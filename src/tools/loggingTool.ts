import { AbstractTool } from "./abstractTool.js";
import {LocalDragEvent, LocalMouseEvent} from '../events.js'
import {Point} from "../data/point.js";

/**
 * Simple logging tool for down and up events
 */
class LoggingTool extends AbstractTool{
    constructor(){
        super();
    }
    onMousedown(mouseEvent:LocalMouseEvent){
        console.log("mousedown", mouseEvent)
    }
    
    onMouseup(mouseEvent:LocalMouseEvent){
        console.log("mouseup", mouseEvent)
    }

    onDragstart(dragEvent:LocalDragEvent){
        console.log("dragstart", dragEvent)
    }
    
    onDragend(dragEvent:LocalDragEvent){
        console.log("dragend", dragEvent)
    }

    onWheel(mouseEvent:LocalMouseEvent, wheelDelta:number){
        console.log("wheelDelta",wheelDelta);
    }
}

export {LoggingTool}