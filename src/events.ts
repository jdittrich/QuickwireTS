

import { Point } from "./data/point.js";
import {ViewTransform} from "./transform.js";
import { DrawingView } from "./drawingView.js";
import { AbstractTool } from "./tools/abstractTool.js";

interface LocalMouseEventParam { 
    screenPosition: Point; 
    previousPosition: Point; 
    view: DrawingView; 
}

/**
 * Potential Refactor: Make it only rely on the transform object
 * 
 * Vague Idea: Parametrize transform so you get a bunch of values to rehydrate?
 */

/**
 * Our own mouse event. 
 * It does not depend on the DOM mouse events (except for calculating the initial mouse position)
 * It knows the drawingView, so it can provide positions and movement in document coordinates. 
 */
class LocalMouseEvent{ 
    #screenPosition:Point
    #previousPosition:Point
    drawingView:DrawingView
    /**
     * @param {Object}      param
     * @param {Point}       param.screenPosition - where the event on the view happened in screen coordinates (in contrast to document coordinates)
     * @param {Point}       param.previousPosition
     * @param {DrawingView} param.view - needs access to point transformation methods of view.
     */
    constructor(param: LocalMouseEventParam){
        // if(!param.screenPosition || !param.previousPosition || !param.view){
        //     throw new Error("At least one needed parameter is not defined");
        // }
        this.#screenPosition = param.screenPosition
        this.#previousPosition = param.previousPosition
        this.drawingView = param.view; 
    }

    getScreenPosition(): Point{
        const screenPosition = this.#screenPosition.copy();
        return screenPosition;
    }

    /**
     * Vector between current mouse position and the previous one in screen coordinates
     */
    getScreenMovement(): Point{
        const screenMovement = this.#screenPosition.offsetFrom(this.#previousPosition);
        return screenMovement
    }

    getDocumentPosition(): Point{
        const transformedPosition = this.drawingView.screenToDocumentPosition(this.#screenPosition);
        return transformedPosition;
    }

    getDocumentMovement(): Point{
        //we cant use the view’s  transform since movements are relative to each other, and thus should not consider pan.
        //setup conversion only for scale, not pan
        const viewScale = this.drawingView.getScale()
        const transform = new ViewTransform(0,0,viewScale);

        const screenMovement = this.getScreenMovement()
        //remember, document coordinates are the domain’s coordinates, thus, to screen is untransform!
        const documentMovement = transform.untransformPoint(screenMovement); 

        return documentMovement;
    }

    getDrawingView(): DrawingView{
        return this.drawingView;
    }
    
    getPreviousScreenPosition(): Point{ //dunno if I need this
        return this.#previousPosition.copy();
    }
}

interface LocalDragEventParam extends LocalMouseEventParam {
    downPoint: Point
} 

class LocalDragEvent extends LocalMouseEvent{
    #downPoint:Point

    /**
     * @param {Object}      param
     * @param {Point}       param.screenPosition - where the event on the view happened in screen coordinates (in contrast to document coordinates)
     * @param {Point}       param.previousPosition
     * @param {DrawingView} param.view - needs access to point transformation methods of view.
     * @param {Point}       param.downPoint
     */
    constructor(param:LocalDragEventParam){
        super(param);
        this.#downPoint = param.downPoint;
    }
    getMousedownScreenPosition(){
       return this.#downPoint;
    }
    getMousedownDocumentPosition(){
        const transformedPosition = this.drawingView.screenToDocumentPosition(this.#downPoint);
        return transformedPosition;
    }

    /**
     * Vector from start of drag to current mouse position, in screen coordinates

     */
    getScreenDragMovement(): Point{
        const  currentScreenPosition = this.getScreenPosition()
        const  dragDistance = this.#downPoint.offsetTo(currentScreenPosition);
        return dragDistance
    }

    /**
     * Vector from start of drag to current mouse position, in document coordinates
     */
    getDocumentDragMovement(): Point{
        //we cant use the view’s  transform since movements are relative to each other, and thus should not consider pan 
        //i.e. the drag does not get shorter or longer, when when the panned.
        //thus: setup conversion only for scale, not pan
        const viewScale = this.drawingView.getScale()
        const transform = new ViewTransform(0,0,viewScale);

        const screenDragMovement = this.getScreenDragMovement()
        //remember, document coordinates are the domain’s coordinates, thus, to screen is untransform!
        const documentDragMovement = transform.untransformPoint(screenDragMovement); 

        return documentDragMovement
    }
}

const toolChangeEventName = "toolChange"; 

class ToolChangeEvent extends Event{
    toolName:string = null; 
    constructor(toolName:string){
        super(toolChangeEventName);
        this.toolName = toolName
    }
}

export {LocalMouseEvent, LocalDragEvent, ToolChangeEvent, toolChangeEventName}