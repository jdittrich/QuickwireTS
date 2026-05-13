import { Rect, RectResize }   from "../data/rect.js";
import { Point } from "../data/point.js";
import { Handle } from "./handle.js";
//import { ChangeFigureRectCommand } from "../commands/changeRectCommand.js";
import { ResizeCompositeFigureCommand, ResizeFigureCommand } from "../commands/resizeRectCommand.js"
import { SubclassShouldImplementError } from "../errors.js";
import { Figure } from "../figures/figure.js";
import { CompositeFigure } from "../figures/compositeFigure.js";
import { DrawingView } from "../drawingView.js";
import { LocalDragEvent } from "../events.js";
import {InteractionAnnouncement, InteractionInfoProvider} from "../interfaces.js"
import { Command } from "../commands/command.js";


abstract class ResizeFigureHandle extends Handle {
    size=16;
    constructor(figure:Figure,drawingView:DrawingView){
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
    abstract createRectResize(dragDocumentMovement:Point):RectResize

    // overwrite this for other (sub)types of (resize)command
    createCommand(rectResize: RectResize): Command {
        return new ResizeFigureCommand({
            "figure":this.getFigure(),
            "rectResize": rectResize
        },this.getDrawingView());
    }
    
    #isInBounds(rectResize:RectResize):boolean{
        // this is a bit crude, since not all figures resize via boundingBoxResize
        // also, we should probably solve that on command level and let the command creation fail
        // with a rangeError.
        const drawingView = this.getDrawingView();
        const figure = this.getFigure();
        const rect = figure.getBoundingBox();
        const proposedRect = rect.resizedCopy(rectResize);
        const isInBounds = drawingView.drawing.isEnclosingRect(proposedRect);
        return isInBounds;
    }
    onDragstart(dragEvent:LocalDragEvent):void{
        const drawingView = this.getDrawingView();
        drawingView.startPreviewOf(this.getFigure());
    }
    onDrag(dragEvent:LocalDragEvent){
        const drawingView = this.getDrawingView();
        //const dragMovement = dragEvent.getDocumentDragMovement();
        const previewFigure = drawingView.getPreviewFigure();
        const movementIncrement = dragEvent.getDocumentMovement();
        const dragRectResize = this.createRectResize(movementIncrement);
        previewFigure.resizeByRectResize(dragRectResize);
    }
    onDragend(dragEvent:LocalDragEvent){
        const dragMovement = dragEvent.getDocumentDragMovement();
        const rectResize = this.createRectResize(dragMovement);
        if(!this.#isInBounds(rectResize)){
            console.log("Changed Figure would be out of bounds, aborting command");
            return;
        }
        
        const resizeCommand = this.createCommand(rectResize);
        dragEvent.getDrawingView().do(resizeCommand);
    }
    dragExit(){
        // const drawingView = this.getDrawingView();
        // drawingView.endPreview();
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



class ResizeLeftHandle extends ResizeFigureHandle{
    constructor(figure:Figure,drawingView:DrawingView){
        super(figure,drawingView);
    }
    getLocation():Point{
        const figure = this.getFigure();
        const rect = figure.getBoundingBox();
        const center = rect.getCenter()
        const location = new Point({x:rect.left,y:center.y});
        return location
    }
    createRectResize(dragDocumentMovement:Point):RectResize{
        const rectResize = {
            top:0,
            right: 0,
            bottom: 0,
            left: dragDocumentMovement.x,
        }
        return rectResize;
    }
    getInteractions(){
        const defaultInteractions = this.getDefaultInteractions()
        return { 
            ...defaultInteractions,
            cursor: "ew-resize"
        };
    }
}

class ResizeRightHandle extends ResizeFigureHandle{
    constructor(figure:Figure,drawingView:DrawingView){
        super(figure,drawingView);
    }
    getLocation():Point{
        const figure = this.getFigure();
        const rect = figure.getBoundingBox();
        const center = rect.getCenter()
        const location = new Point({x:rect.right,y:center.y});
        return location
    }
    createRectResize(dragDocumentMovement:Point):RectResize{
        const rectResize = {
            top:0,
            right: dragDocumentMovement.x,
            bottom: 0,
            left: 0,
        }
        return rectResize;
    }
    getInteractions(){
        const defaultInteractions = this.getDefaultInteractions()
        return { 
            ...defaultInteractions,
            cursor: "ew-resize"
        };
    }
}

// abstract class ResizeCompositeFigureHandle extends Handle{
//     size = 16;
//     constructor(figure:CompositeFigure,drawingView:DrawingView){
//         super(figure,drawingView);
//     }
//     getScreenRect(){
//         const size = this.size;
//         const documentLocation = this.getLocation();
//         const drawingView = this.getDrawingView();
//         const screenLocation = drawingView.documentToScreenPosition(documentLocation);
//         const {x,y} = screenLocation;
//         const screenRect = new Rect({
//             x: x - (size/2),
//             y: y - (size/2),
//             height:size,
//             width:size
//         }) 
//         return screenRect;
//     }
//     abstract getLocation():Point

//     createChangedRect(dragDocumentMovement:Point):Rect{
//         const rectResize = this.createRectResize(dragDocumentMovement);
//         const figure = this.getFigure();
//         const rect = figure.getBoundingBox();
//         const changedRect = rect.resizedCopy(rectResize);
//         return changedRect;
//     }
//     #isInBounds(rectResize:RectResize):boolean{
//         const drawingView = this.getDrawingView();
//         const figure = this.getFigure();
//         const rect = figure.getBoundingBox();
//         const proposedRect = rect.resizedCopy(rectResize);
//         const isInBounds = drawingView.drawing.isEnclosingRect(proposedRect);
//         return isInBounds;
//     }

//     abstract createRectResize(dragDocumentMovement:Point):RectResize

//     onDragstart(dragEvent:LocalDragEvent):void{
//         const drawingView = this.getDrawingView();
//         drawingView.startPreviewOf(this.getFigure()); 
//     }
//     onDrag(dragEvent:LocalDragEvent){
//         const drawingView = this.getDrawingView();
//         const dragMovement = dragEvent.getDocumentDragMovement();
//         const previewFigure = drawingView.getPreviewedFigure() as CompositeFigure;
//         const newRect = this.createChangedRect(dragMovement) //resizeRect
//         previewFigure.changeRect(newRect);
//     }
//     onDragend(dragEvent:LocalDragEvent){
//         const dragMovement = dragEvent.getDocumentDragMovement();
//         const rectResize = this.createRectResize(dragMovement);
//         if(!this.#isInBounds){
//             console.log("Changed Figure would be out of bounds, aborting command");
//             return;
//         }
//         //create command
//         //NOTE: maybe try/catch?
//         const resizeCommand = new ResizeCompositeFigureCommand({
//             "figure":this.getFigure() as CompositeFigure,
//             "rectResize": rectResize
//         },dragEvent.getDrawingView());

//         dragEvent.getDrawingView().do(resizeCommand);
//     }
//     dragExit(){
//         const drawingView = this.getDrawingView();
//         drawingView.endPreview();
//     }
//     getDefaultInteractions(){
//         return { 
//             cursor: "nwse-resize",
//             helpText: "resize figure",
//             draggable: true, 
//             clickable: false 
//         };
//     }
// }

abstract class ResizeCompositeFigureHandle extends ResizeFigureHandle{
    affectInner:boolean=true
    constructor(figure:CompositeFigure,drawingView:DrawingView){
        super(figure,drawingView)
    }
    createCommand(rectResize: RectResize): Command {
        return new ResizeCompositeFigureCommand({
            "figure":this.getFigure() as CompositeFigure,
            "rectResize": rectResize,
            "affectInner": this.affectInner
        },this.getDrawingView());
    }
    onDrag(dragEvent:LocalDragEvent){
        const drawingView = this.getDrawingView();
        //const dragMovement = dragEvent.getDocumentDragMovement();
        const previewFigure = drawingView.getPreviewFigure() as CompositeFigure;
        const movementIncrement = dragEvent.getDocumentMovement();
        const dragRectResize = this.createRectResize(movementIncrement);
        previewFigure.resizeByRectResize(dragRectResize,this.affectInner);
    }
    getDefaultInteractions(){
        return { 
            cursor: "nwse-resize",
            helpText: "resize figure, scaling inner figures",
            draggable: true, 
            clickable: false 
        };
    }
}

abstract class ResizeCompositeFigureHandleNoInner extends ResizeFigureHandle{
    affectInner:boolean = false
    constructor(figure:CompositeFigure,drawingView:DrawingView){
        super(figure,drawingView)
    }
    getColor(): string{
        return "#676ecfff";
    }
    createCommand(rectResize: RectResize): Command {
        return new ResizeCompositeFigureCommand({
            "figure":this.getFigure() as CompositeFigure,
            "rectResize": rectResize,
            "affectInner": this.affectInner
        },this.getDrawingView());
    }
    onDrag(dragEvent:LocalDragEvent){
        const drawingView = this.getDrawingView();
        //const dragMovement = dragEvent.getDocumentDragMovement();
        const previewFigure = drawingView.getPreviewFigure() as CompositeFigure;
        const movementIncrement = dragEvent.getDocumentMovement();
        const dragRectResize = this.createRectResize(movementIncrement);
        previewFigure.resizeByRectResize(dragRectResize,this.affectInner);
    }
    getDefaultInteractions(){
        return { 
            cursor: "nwse-resize",
            helpText: "resize figure, not affecting inner figures",
            draggable: true, 
            clickable: false 
        };
    }
}

class ResizeTopRightHandle extends ResizeCompositeFigureHandle{
    affectInner: boolean = true;
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

class ResizeBottomRightHandle extends ResizeCompositeFigureHandle{
    affectInner: boolean = true;
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

class ResizeBottomLeftHandle extends ResizeCompositeFigureHandle{
    affectInner: boolean = true;
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

class ResizeTopLeftHandle extends ResizeCompositeFigureHandle{
    affectInner: boolean = true;
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

class ResizeCompositeBottomHandle extends ResizeCompositeFigureHandleNoInner{
    affectInner: boolean = false;
    constructor(figure:CompositeFigure,drawingView:DrawingView){
        super(figure,drawingView);
    }

    getLocation(){
        const figure = this.getFigure();
        const rect = figure.getBoundingBox();
        const center = rect.getCenter()
        const bottomCenter = new Point({x:center.x, y:rect.bottom})
        return bottomCenter;
    }

    createRectResize(dragDocumentMovement: Point): RectResize {
        const rectResize = {
            top:    0,
            right:  0,
            bottom: dragDocumentMovement.y,
            left: 0
        }
        return rectResize;
    }

    getInteractions(){
        const defaultInteractions = this.getDefaultInteractions()
        return { 
            ...defaultInteractions,
            cursor: "s-resize"
        };
    }
}

class ResizeCompositeLeftHandle extends ResizeCompositeFigureHandleNoInner{
    affectInner: boolean = false;
    constructor(figure:CompositeFigure,drawingView:DrawingView){
        super(figure,drawingView);
    }

    getLocation(){
        const figure = this.getFigure();
        const rect = figure.getBoundingBox();
        const center = rect.getCenter()
        const leftCenter = new Point({x:rect.left, y:center.y})
        return leftCenter;
    }

    createRectResize(dragDocumentMovement: Point): RectResize {
        const rectResize = {
            top:    0,
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
            cursor: "w-resize"
        };
    }
}

class ResizeCompositeTopHandle extends ResizeCompositeFigureHandleNoInner{
    affectInner: boolean = false;
    constructor(figure:CompositeFigure,drawingView:DrawingView){
        super(figure,drawingView);
    }

    getLocation(){
        const figure = this.getFigure();
        const rect = figure.getBoundingBox();
        const center = rect.getCenter()
        const topCenter = new Point({x:center.x, y:rect.top})
        return topCenter;
    }

    createRectResize(dragDocumentMovement: Point): RectResize {
        const rectResize = {
            top:    dragDocumentMovement.y,
            right:  0,
            bottom: 0,
            left: 0
        }
        return rectResize;
    }

    getInteractions(){
        const defaultInteractions = this.getDefaultInteractions()
        return { 
            ...defaultInteractions,
            cursor: "n-resize"
        };
    }
}

class ResizeCompositeRightHandle extends ResizeCompositeFigureHandleNoInner{
    affectInner: boolean = false;
    constructor(figure:CompositeFigure,drawingView:DrawingView){
        super(figure,drawingView);
    }

    getLocation(){
        const figure = this.getFigure();
        const rect = figure.getBoundingBox();
        const center = rect.getCenter()
        const rightCenter = new Point({x:rect.right, y:center.y})
        return rightCenter;
    }

    createRectResize(dragDocumentMovement: Point): RectResize {
        const rectResize = {
            top:    0,
            right:  dragDocumentMovement.x,
            bottom: 0,
            left: 0
        }
        return rectResize;
    }

    getInteractions(){
        const defaultInteractions = this.getDefaultInteractions()
        return { 
            ...defaultInteractions,
            cursor: "e-resize"
        };
    }
}

//Helper functions to create collections of handles

/**
 * Generates standard set of resize handles 
 */
function createAllResizeHandles(figure: CompositeFigure,drawingView: DrawingView): ResizeCompositeFigureHandle[]{
    const trHandle = new ResizeTopRightHandle(figure,drawingView);
    const brHandle = new ResizeBottomRightHandle(figure,drawingView);
    const blHandle = new ResizeBottomLeftHandle(figure,drawingView);
    const tlHandle = new ResizeTopLeftHandle(figure,drawingView);
    return [brHandle,trHandle,blHandle,tlHandle];
}
function createCropHandles(figure:CompositeFigure, drawingView):ResizeCompositeFigureHandleNoInner[]{
    const tHandle  = new ResizeCompositeTopHandle(figure,drawingView)
    const rHandle  = new ResizeCompositeRightHandle(figure,drawingView)
    const bHandle  = new ResizeCompositeBottomHandle(figure,drawingView)
    const lHandle  = new ResizeCompositeLeftHandle(figure,drawingView)
    return [tHandle,rHandle,bHandle,lHandle];
}


function createLeftRightResizeHandles(figure:Figure,drawingView:DrawingView): ResizeFigureHandle[]{
    const rHandle = new ResizeRightHandle(figure,drawingView);
    const lHandle = new ResizeLeftHandle(figure,drawingView);
    return [rHandle,lHandle];
}

export {ResizeCompositeFigureHandle as ResizeHandle, createAllResizeHandles, createLeftRightResizeHandles, createCropHandles}