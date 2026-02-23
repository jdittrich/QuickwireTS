import { Rect, RectResize }   from "../data/rect.js";
import { Point } from "../data/point.js";
import { Handle } from "./handle.js";
//import { ChangeFigureRectCommand } from "../commands/changeRectCommand.js";
import { ResizeCompositeFigureCommand } from "../commands/resizeRectCommand.js"
import { SubclassShouldImplementError } from "../errors.js";
import { Figure } from "../figures/figure.js";
import { CompositeFigure } from "../figures/compositeFigure.js";
import { DrawingView } from "../drawingView.js";
import { LocalDragEvent } from "../events.js";
import {InteractionAnnouncement, InteractionInfoProvider} from "../interfaces.js"


abstract class ResizeHandle extends Handle{
    size = 16;
    constructor(figure:CompositeFigure,drawingView:DrawingView){
        super(figure,drawingView);
    }
    getScreenRect(){
        const size = this.size;
        const documentLocation = this.getLocation();
        const drawingView = this.getDrawingView();
        const screenLocation = drawingView.documentToScreenPosition(documentLocation);
        const {x,y} = screenLocation;
        const screenRect = new Rect({
            x: x - (size/2),
            y: y - (size/2),
            height:size,
            width:size
        }) 
        return screenRect;
    }
    abstract getLocation():Point

    createChangedRect(dragDocumentMovement:Point):Rect{
        const rectResize = this.createRectResize(dragDocumentMovement);
        const figure = this.getFigure();
        const rect = figure.getBoundingBox();
        const changedRect = rect.resizedCopy(rectResize);
        return changedRect;
    }
    #isInBounds(rectResize:RectResize):boolean{
        const drawingView = this.getDrawingView();
        const figure = this.getFigure();
        const rect = figure.getBoundingBox();
        const proposedRect = rect.resizedCopy(rectResize);
        const isInBounds = drawingView.drawing.isEnclosingRect(proposedRect);
        return isInBounds;
    }

    abstract createRectResize(dragDocumentMovement:Point):RectResize

    onDragstart(dragEvent:LocalDragEvent):void{
        const drawingView = this.getDrawingView();
        drawingView.startPreviewOf(this.getFigure()); 
    }
    onDrag(dragEvent:LocalDragEvent){
        const drawingView = this.getDrawingView();
        const dragMovement = dragEvent.getDocumentDragMovement();
        const previewFigure = drawingView.getPreviewedFigure() as CompositeFigure;
        const newRect = this.createChangedRect(dragMovement) //resizeRect
        previewFigure.changeRect(newRect);
    }
    onDragend(dragEvent:LocalDragEvent){
        const dragMovement = dragEvent.getDocumentDragMovement();
        const rectResize = this.createRectResize(dragMovement);
        if(!this.#isInBounds){
            console.log("Changed Figure would be out of bounds, aborting command");
            return;
        }
        //create command
        //NOTE: maybe try/catch?
        const resizeCommand = new ResizeCompositeFigureCommand({
            "figure":this.getFigure() as CompositeFigure,
            "rectResize": rectResize
        },dragEvent.getDrawingView());

        dragEvent.getDrawingView().do(resizeCommand);
    }
    dragExit(){
        const drawingView = this.getDrawingView();
        drawingView.endPreview();
    }
    getDefaultInteractions(){
        return { 
            cursor: "nwse-resize",
            helpText: "resize figure",
            draggable: true, 
            clickable: false 
        };
    }
}

// 20.2.26: Probably create a getResize and keep changeRect. ChangeRect is cumulative
// so its not great for ongoing stuff. 
class ResizeTopRightHandle extends ResizeHandle{
    constructor(figure:CompositeFigure,drawingView:DrawingView){
        super(figure,drawingView);
    }
    getLocation():Point{
        const figure = this.getFigure();
        const rect = figure.getBoundingBox();
        const {topRight:location} = rect.getCorners();
        return location
    }

    createRectResize(dragDocumentMovement:Point):RectResize{
        const rectResize = {
            top:    dragDocumentMovement.y,
            right:  dragDocumentMovement.x,
            bottom: 0,
            left: 0,
        }
        return rectResize;
    }
    getInteractions(){
        const defaultInteractions = this.getDefaultInteractions()
        return { 
            ...defaultInteractions,
            cursor: "ne-resize"
        };
    }
}

class ResizeBottomRightHandle extends ResizeHandle{
    constructor(figure:CompositeFigure,drawingView:DrawingView){
        super(figure,drawingView);
    }
    getLocation():Point{
        const figure = this.getFigure();
        const rect = figure.getBoundingBox();
        const {bottomRight:location} = rect.getCorners();
        return location;
    }
    createRectResize(dragDocumentMovement: Point): RectResize {
        const rectResize = {
            top:    0,
            right:  dragDocumentMovement.x,
            bottom: dragDocumentMovement.y,
            left: 0,
        }
        return rectResize;
    }

    getInteractions(){
        const defaultInteractions = this.getDefaultInteractions()
        return { 
            ...defaultInteractions,
            cursor: "se-resize"
        };
    }
}

class ResizeBottomLeftHandle extends ResizeHandle{
    constructor(figure:CompositeFigure,drawingView:DrawingView){
        super(figure,drawingView);
    }
    getLocation(){
        const figure = this.getFigure();
        const rect = figure.getBoundingBox();
        const {bottomLeft:location} = rect.getCorners();
        return location;
    }

    createRectResize(dragDocumentMovement: Point): RectResize {
        const rectResize = {
            top:    0,
            right:  0,
            bottom: dragDocumentMovement.y,
            left: dragDocumentMovement.x
        }
        return rectResize;
    }

    getInteractions(){
        const defaultInteractions = this.getDefaultInteractions()
        return { 
            ...defaultInteractions,
            cursor: "sw-resize"
        };
    }
}

class ResizeTopLeftHandle extends ResizeHandle{
    constructor(figure:CompositeFigure,drawingView:DrawingView){
        super(figure,drawingView);
    }
    getLocation(){
        const figure = this.getFigure();
        const rect = figure.getBoundingBox();
        const {topLeft:location} = rect.getCorners();
        return location;
    }

    createRectResize(dragDocumentMovement: Point): RectResize {
        const rectResize = {
            top:    dragDocumentMovement.y,
            right:  0,
            bottom: 0,
            left: dragDocumentMovement.x
        }
        return rectResize;
    }

    getInteractions(){
        const defaultInteractions = this.getDefaultInteractions()
        return { 
            ...defaultInteractions,
            cursor: "nw-resize"
        };
    }
}


//Helper functions to create collections of handles

/**
 * Generates standard set of resize handles 
 */
function createAllResizeHandles(figure: CompositeFigure,drawingView: DrawingView): ResizeHandle[]{
    const trHandle = new ResizeTopRightHandle(figure,drawingView);
    const brHandle = new ResizeBottomRightHandle(figure,drawingView);
    const blHandle = new ResizeBottomLeftHandle(figure,drawingView);
    const tlHandle = new ResizeTopLeftHandle(figure,drawingView);
    return [brHandle,trHandle,blHandle,tlHandle];
}

// function createLeftRightResizeHandles(figure:CompositeFigure,drawingView:DrawingView): ResizeHandle[]{
//     const rHandle = new ResizeRightHandle(figure,drawingView);
//     const lHandle = new ResizeLeftHandle(figure,drawingView);
//     return [rHandle,lHandle];
// }

export {ResizeHandle as ResizeHandle, createAllResizeHandles}