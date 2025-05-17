import { ViewTransform} from './transform.js'
import {AbstractTool} from './tools/abstractTool.js'
import { NoOpTool } from './tools/noopTool.js'
import { LocalMouseEvent, LocalDragEvent } from './events.js'
import { ToolChangeEvent } from './events.js'
import { NoOpFigure } from './figures/noopFigure.js'
import { CommandStack } from './commands/commandStack.js'
import { Selection} from './selection.js';
import { Point } from './data/point.js';
import { Rect } from "./data/rect.js";
import { Drawing } from './drawing.js'
import { NameFigureClassMapper } from './_NameFigureClassMapper.js'
import { Figure } from './figures/figure.js'
import { Command } from './commands/command.js'
import { Handle } from './handles/handle.js'
import {jsonToFigure} from './figureFactory.js'
import {Highlightable } from './interfaces.js'
/**
 * 
 * Gets events from app.
 * 
 * @see {App}
 * 
 * Does: 
 * – manage repainting
 * 
 * Knows: 
 * – drawing (i.e. the document)
 * 
 * has: 
 *  selection
 *  tool
 * 
 *  transform 
 *  zoom
 *  pan 
 */
type ToolMap = {
    [key:string]:AbstractTool;
}
type DrawingViewParameters = { 
    ctx: CanvasRenderingContext2D; 
    drawing: Drawing; 
    ctxSize: Point; 
    requestEditorText:Function;
    tools:ToolMap
}


/**
 * Manages the view, but none of the native UI or the event conversion (which is what app does)
 * 
 * @see App
 *  
 */
class DrawingView extends EventTarget{
    #ctx:CanvasRenderingContext2D
    #transform:ViewTransform
    #ctxSize:Point;
    #commandStack = null;
    #selection    = null; 
    #nameFigureClassMapper = null; 
    #requestEditorText  = null;
    
    drawing:Drawing

    constructor(param:DrawingViewParameters){
        super();
        const {ctx,drawing,ctxSize, requestEditorText} = param

        //drawing
        this.#transform = new ViewTransform();
        this.setCtxSize(ctxSize);//needed to know which area to clear on redraws
        this.#ctx = ctx;
        this.drawing = drawing;

        this.#requestEditorText = param.requestEditorText;
        //this.#nameFigureClassMapper = nameFigureClassMapper;
        this.#commandStack = new CommandStack();
        this.#selection = new Selection();
        this.changeTool(new NoOpTool())

        //first draw
        this.#drawAll()
    }

    /**
     * Set the size of the canvas element (i.e. the apps "viewport" to the document)
     */
    setCtxSize(ctxSize: Point):void{
        this.#ctxSize = ctxSize;
    }
    
    //#region: drawing
    updateDrawing():void{
        this.#drawAll()
    }
    #drawAll():void{
        this.#ctx.clearRect(0,0,this.#ctxSize.x,this.#ctxSize.y); //deletes all pixels
        const ctx = this.#ctx;
        
        this.#drawDrawing(ctx);
        this.#drawHandles(ctx);
        this.#drawPreviews(ctx);
        this.#drawHighlightRects(ctx);

        // const offscreenCanvas = new OffscreenCanvas(this.#ctxSize.x, this.#ctxSize.y);
        // const ctx = offscreenCanvas.getContext("2d");
        // …pass offscreen canvas context to the drawing functions
        // const offscreenContextImage = offscreenCanvas.transferToImageBitmap()
        // this.#ctx.drawImage(offscreenContextImage,0,0);
        ///…but for some reason this looked the same.
        
    }
    #drawDrawing(ctx):void{
        const transArr = this.#transform.toArray();
        ctx.setTransform(transArr[0],transArr[1],transArr[2],transArr[3],transArr[4],transArr[5]); //zoom and pan
        this.drawing.draw(ctx);
        ctx.resetTransform(); //so the next one can deal with an untransformed canvas.
    }
    #drawHandles(ctx:CanvasRenderingContext2D):void{
        //no reset needed, since handles know drawingView and find their on-canvas positions themselves.
        //const ctx = this.#ctx;
        const handles = this.getHandles();
        handles.forEach((handle)=> {
            ctx.save();
            handle.draw(ctx);
            ctx.restore();
        });
    }

    //#region highlights
    #highlightElement:Highlightable = new NoOpFigure();

    #drawHighlightRects(ctx:CanvasRenderingContext2D):void{
        ctx.save();
        const rect = this.#highlightElement.getRect();
        const screenRect = this.documentToScreenRect(rect);
        const {x,y,width,height} = screenRect;
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.strokeRect(x,y,width,height);
        ctx.restore();
    }
    startHighlightOf(element:Highlightable):void{
        this.#highlightElement = element;
    }
    endHighlight():void{
        this.#highlightElement = new NoOpFigure();
    }

    //#region: previews
    #previewedElement:Figure|null; //the element which change should be previewed
    #previewElement = new NoOpFigure(); //the copy used to preview the changes
    #isPreviewing = false;

    #drawPreviews(ctx:CanvasRenderingContext2D){ 
        const transArr = this.#transform.toArray();
        ctx.setTransform(transArr[0],transArr[1],transArr[2],transArr[3],transArr[4], transArr[5] );
        this.#previewElement.draw(ctx);
        ctx.resetTransform();
    }

    /**
     * @see {startPreviewOf}
     */
    getPreviewedFigure(): Figure{
        return this.#previewElement;
    }
    /**
     * Use to start a preview of a figure which then can be accessed via getPreviewedFigure
     * Makes the previewed Figure invisible so it looks as if you interact with the original figure
     * @see {getPreviewedFigure}
     */
    startPreviewOf(figureToPreview: Figure):void{ //puts figure in preview
        this.#previewedElement = figureToPreview;
        this.#previewElement = figureToPreview.copy(); //like: copy(this.stringClassMapper)
        this.#isPreviewing = true;
        figureToPreview.setIsVisible(false);
    }

    endPreview():void{
        this.#previewElement = new NoOpFigure();
        this.#previewedElement.setIsVisible(true);
        this.#previewedElement = new NoOpFigure(); 
        this.#isPreviewing = false;
    }

    //#region: Transformations
    panBy(vector: Point):void{
        this.#transform.setTranslateBy(vector);
        this.#drawAll();
    }
    
    /**
     * Set zoom and point to zoom to, then update view. 
     * @param {number} zoom factor. 1=100% zoom
     * @param {Point} point in drawingView coordinates to center the zoom on
     */
    scaleBy(factor:number,point: Point):void{
        this.#transform.scaleByToPoint(factor, point);
        this.#drawAll();
    }

    getScale():number{
        return this.#transform.getScale()
    }

    getPan():Point{
        return this.#transform.getTranslate();
    }
    
    /**
     * Answers the question: What coordinates does this point in the panned-and-zoomed view have in the drawing?
     * @param {Point} point a point in screen coordinates relative to the drawingView
     * @returns {Point} point in drawing coordinates
     */
    screenToDocumentPosition(point: Point): Point{
        const pointInDocument = this.#transform.screenToDocumentPosition(point)
        return pointInDocument;
    }

    /**
     * Answers the question: Where does this point in the drawing land on the panned-and-zoomed view?
     * @param {Point} point in drawing coordinates
     * @returns {Point} in screen coordinates relative to the drawingView 
     */
    documentToScreenPosition(point: Point): Point{
        const pointOnScreen = this.#transform.transformPoint(point);
        return pointOnScreen;
    }

    /**
     * Helper to transform a rect, defined in screen coordinates 
     * to transformed document coordinates.
     * 
     * @param   {Rect} screenRect 
     * @returns {Rect} 
     */
    screenToDocumentRect(screenRect: Rect): Rect{
        const documentRect = this.#transform.screenToDocumentRect(screenRect);
        return documentRect;    
    }   
    /**
     * Helper to transform a rect, defined in document coordinates 
     * to untransformed screen coordinates.
     * 
     * @param   {Rect} documentRect 
     * @returns {Rect} 
     */
    documentToScreenRect(documentRect: Rect): Rect{
        const screenRect = this.#transform.documentToScreenRect(documentRect)
        return screenRect;
    }


    //#region: tool management
    #tool:AbstractTool;
    #queuedTool: AbstractTool|null; 
    #registerTools(){

    }
    /*
    requesting rather than immediately changing tools is needed, since changing a tool mid-action, 
    e.g. at some point during drag yields unpredictable results, since the expected setup on mousedown 
    would not take place.
    */
    changeTool(tool:AbstractTool):void{
        //TODO: teardown (deactivate) old tool
        tool.setDrawingView(this);
        if(this.#mouseState === "down"){ //tool change requested in action, 
            this.#queuedTool = tool; 
        } else {
            this.#tool = tool;
            this.#queuedTool = null; 
        }
        this.dispatchEvent(new ToolChangeEvent(tool));
    }

    /**
     * returns the currently active tool.
     */
    getTool(): AbstractTool{
        return this.#tool;
    }



    //#region: events
    #mouseDownPoint:Point //to calculate drag distances
    #dragging = false; 
    #mouseState:"up"|"down" = "up"; //track assumed button state, needed to recognize unclear state.

    //set *any* position to calculate the first move distance we need *any* valid point here.
    #previousMousePosition = new Point({x:0,y:0}); 
    #lockedDragTool = null; //locked in place by Mousedown, so that no tool is changed during drag.
    /**
     * @param {Point} mousePosition 
     */
    onMousedown(mousePosition: Point){

        // precaution: Mouse might have been released outside of app
        // and thus state is unclear
        if(this.#mouseState === "down"){
            return;
        }

        this.#mouseState = "down";
        this.#mouseDownPoint = mousePosition;
        
        const localMouseEvent = new LocalMouseEvent({
            "screenPosition": mousePosition.copy(),
            "previousPosition": this.#previousMousePosition.copy(),
            "view": this
        });
        this.#lockedDragTool = this.#tool; 
        this.#lockedDragTool.onMousedown(localMouseEvent);
        this.#previousMousePosition = mousePosition.copy();
    }
    
    /**
    * Calls mousemove, then tests if this is a dragstart or dragmove and calls none or one of them if needed.
    * @param {Point} mousePosition
    */
    onMousemove(mousePosition: Point){ 
        const localMouseEvent = new LocalMouseEvent({
            "screenPosition": mousePosition,
            "previousPosition": this.#previousMousePosition,
            "view":this
        });

        this.#tool.onMousemove(localMouseEvent);
        
        if(this.#mouseDownPoint ){
            const localDragEvent = new LocalDragEvent({
                "screenPosition":mousePosition,
                "previousPosition":this.#previousMousePosition,
                "downPoint": this.#mouseDownPoint,
                "view":this
            });
            if(!this.#dragging){ //first drag event
                this.#onDragstart(localDragEvent);
                this.#onDrag(localDragEvent);
                this.#dragging = true;
            } else if(this.#dragging){ //following drag event
                this.#onDrag(localDragEvent);
            }
        } 
        if(!this.#mouseDownPoint){
            this.#onHover(localMouseEvent);
        }
        
        this.#previousMousePosition = mousePosition.copy();
    }

    onMouseup(mousePosition:Point){
        // precaution: Mouse might have been pressed outside of app
        // and thus state is unclear
        if(this.#mouseState === "up"){
            throw Error("mouse can't go up in up state");
        }
        this.#mouseState = "up";
        
        const localMouseEvent = new LocalMouseEvent({
            "screenPosition":mousePosition.copy(),
            "previousPosition":this.#previousMousePosition.copy(),
            "view":this
        })
        
        //check if drag ends, and call this first.
        if(this.#mouseDownPoint && this.#dragging){
            const localDragEvent = new LocalDragEvent({
                "screenPosition":mousePosition,
                "previousPosition":this.#previousMousePosition,
                "downPoint": this.#mouseDownPoint,
                "view":this
            });
            this.#onDragend(localDragEvent);
        }
        this.#lockedDragTool.onMouseup(localMouseEvent)
        //resets
        this.#dragging = false  
        this.#mouseDownPoint = null;
        this.#previousMousePosition = mousePosition.copy();
        this.#lockedDragTool = null;
    }

    /**
     * @param {Point} mousePosition 
     * @param {Number} wheelDelta 
     */
    onWheel(mousePosition: Point, wheelDelta: number){
        const localMouseEvent = new LocalMouseEvent({
            "screenPosition": mousePosition.copy(),
            "previousPosition": this.#previousMousePosition.copy(),
            "view": this
        })
        this.#tool.onWheel(localMouseEvent,wheelDelta);
        this.#previousMousePosition = mousePosition.copy();
    }
    
    //the drag events are automatically called from mousemove and mouseup
    //thus, they are private and not to be called from outside directly. 
    #onDragstart(dragEvent:LocalDragEvent){
        this.#lockedDragTool.onDragstart(dragEvent)
    }
    
    #onDrag(dragEvent:LocalDragEvent){
        this.#lockedDragTool.onDrag(dragEvent);
    }

    #onHover(mouseEvent:LocalMouseEvent){
        this.#tool.onHover(mouseEvent);
    }

    #onDragend(dragEvent:LocalDragEvent){
        this.#lockedDragTool.onDragend(dragEvent);
        this.#lockedDragTool.dragExit();
    }

    isDragging(): boolean{
        return this.#dragging;
    }

    //#region: commands
    /**
     * execute a new command and put it on stack for undoable actions
     */
    do(command: Command):void{
        this.#commandStack.do(command);
        this.updateDrawing();
    }

    canUndo(): boolean{
        const canUndo = this.#commandStack.canUndo();
        return canUndo;
    }

    canRedo(): boolean{
        const canRedo = this.#commandStack.canRedo();
        return canRedo;
    }

    undo():void{
        this.#commandStack.undo();
        this.updateDrawing();
    }
    redo():void{
        this.#commandStack.redo();
        this.updateDrawing();
    }

    //#region: selection
    select(figure:Figure):void{
        this.#selection.select(figure);
        this.updateDrawing();
    }
    clearSelection():void{
        this.#selection.clear();
        this.updateDrawing();
    }
    hasSelection():boolean{
        const hasSelection = this.#selection.hasSelection();
        return hasSelection; 
    }
    getSelection():Figure{
        const selection = this.#selection.getSelection();
        return selection;
    }
    
    //#region: handles
    getHandles(): Handle[]{
        let handles:Handle[] = [];
        const selectedFigure = this.#selection.getSelection();
        if(this.#isPreviewing){
            handles = this.#previewElement.getHandles(this);
        } else if (selectedFigure){
            handles = selectedFigure.getHandles(this);
        }   
        return handles;
    }

    //#region: request native userInterface
    /**
     * @param   {String} message - message shown to users
     * @param   {String} prefillText 
     * @returns {String}
     * @throws if editing is canceled by user.
     */
    requestEditorText(message: string, prefillText: string): string{
        const text = this.#requestEditorText(message,prefillText);
        return text;
    }

    //#region: serialization/deserialization
    getNameFigureClassMapper():NameFigureClassMapper{
        return this.#nameFigureClassMapper;
    }

    fromJSON(Json:Object):void{
        const drawing = jsonToFigure(Json);
        if(drawing instanceof Drawing){
            this.drawing = drawing;    
        } else {
            throw new TypeError("passed Json should generate a Drawing, but generated other type")
        }
        this.updateDrawing();
    }
    toJSON():Object{
        const drawingJSON = this.drawing.toJSON();
        return drawingJSON; 
    }
}

export {DrawingView}