import { Rect }   from "../data/rect.js";
import { Point } from "../data/point.js";
import { Handle } from "./handle.js";
import { ChangeFigureRectCommand } from "../commands/changeRectCommand.js";
import { SubclassShouldImplementError } from "../errors.js";
import { Figure } from "../figures/figure.js";
import { DrawingView } from "../drawingView.js";
import { LocalDragEvent } from "../events.js";


class ResizeHandle extends Handle{
    constructor(figure:Figure,drawingView:DrawingView){
        super(figure,drawingView);
    }
    getScreenRect(){
        const size = this.getSize();
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
    getLocation():Point{
        throw new SubclassShouldImplementError("getLocation","ResizeHandle");
    }
    createChangedRect(point:Point):Rect{ 
        throw new SubclassShouldImplementError("createChangedRect", "ResizeHandle");
    }

    onDragstart(dragEvent:LocalDragEvent):void{
        const drawingView = this.getDrawingView();
        drawingView.startPreviewOf(this.getFigure()); 
    }
    onDrag(dragEvent:LocalDragEvent){
        const drawingView = this.getDrawingView();
        const dragMovement = dragEvent.getDocumentDragMovement();
        const previewFigure = drawingView.getPreviewedFigure();
        const newRect = this.createChangedRect(dragMovement)
        previewFigure.setRect(newRect);
    }
    onDragend(dragEvent:LocalDragEvent){
        const drawingView = this.getDrawingView();

        const dragMovement = dragEvent.getDocumentDragMovement();
        const resizedFigureRect = this.createChangedRect(dragMovement);
        const isInBounds = drawingView.drawing.isEnclosingRect(resizedFigureRect);
        if(!isInBounds){
            console.log("Changed Figure would be out of bounds, aborting command");
            return;
        }
        //create command
        //NOTE: maybe try/catch?
        const resizeCommand = new ChangeFigureRectCommand({
            "figure":this.getFigure(),
            "changedRect": resizedFigureRect
        },dragEvent.getDrawingView());

        dragEvent.getDrawingView().do(resizeCommand);
    }
    dragExit(){
        const drawingView = this.getDrawingView();
        drawingView.endPreview();
    }
}

class ResizeTopRightHandle extends ResizeHandle{
    constructor(figure:Figure,drawingView:DrawingView){
        super(figure,drawingView);
    }
    getLocation():Point{
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {topRight:location} = rect.getCorners();
        return location
    }
    createChangedRect(dragDocumentMovement:Point):Rect{
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {bottomLeft,topRight} = rect.getCorners();
        const changedTopRight = topRight.add(dragDocumentMovement);
        const changedRect = Rect.createFromCornerPoints(bottomLeft,changedTopRight); 
        return changedRect;
    }
}

class ResizeBottomRightHandle extends ResizeHandle{
    constructor(figure:Figure,drawingView:DrawingView){
        super(figure,drawingView);
    }
    getLocation():Point{
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {bottomRight:location} = rect.getCorners();
        return location;
    }
    createChangedRect(dragDocumentMovement:Point){
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {bottomRight,topLeft} = rect.getCorners();
        const changedBottomRight = bottomRight.add(dragDocumentMovement);
        const changedRect = Rect.createFromCornerPoints(topLeft,changedBottomRight); 
        return changedRect;
    }
}

class ResizeBottomLeftHandle extends ResizeHandle{
    constructor(figure:Figure,drawingView:DrawingView){
        super(figure,drawingView);
    }
    getLocation(){
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {bottomLeft:location} = rect.getCorners();
        return location;
    }
    createChangedRect(dragDocumentMovement:Point){
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {topRight,bottomLeft} = rect.getCorners();
        const changedBottomLeft = bottomLeft.add(dragDocumentMovement);
        const changedRect = Rect.createFromCornerPoints(topRight,changedBottomLeft); 
        return changedRect;
    }
}

class ResizeTopLeftHandle extends ResizeHandle{
    constructor(figure:Figure,drawingView:DrawingView){
        super(figure,drawingView);
    }
    getLocation(){
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {topLeft:location} = rect.getCorners();
        return location;
    }
    createChangedRect(dragDocumentMovement:Point){
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {topLeft,bottomRight} = rect.getCorners();
        const changedTopLeft = topLeft.add(dragDocumentMovement);
        const changedRect = Rect.createFromCornerPoints(bottomRight,changedTopLeft); 
        return changedRect;
    }
}

//Helper functions to create collections of handles
/**
 * Generates standard set of resize handles 
 */
function createAllResizeHandles(figure: Figure,drawingView: DrawingView): ResizeHandle[]{
    const trHandle = new ResizeTopRightHandle(figure,drawingView);
    const brHandle = new ResizeBottomRightHandle(figure,drawingView);
    const blHandle = new ResizeBottomLeftHandle(figure,drawingView);
    const tlHandle = new ResizeTopLeftHandle(figure,drawingView);
    return [brHandle,trHandle,blHandle,tlHandle];
}

export {ResizeHandle, createAllResizeHandles}