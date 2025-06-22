import { ViewTransform} from './transform.js'
import {Tool} from './tools/tool.js'
import { NoOpTool } from './tools/noopTool.js'
import { LocalMouseEvent, LocalDragEvent, InteractionAnnouncementEvent} from './events.js'
import { ToolChangeEvent } from './events.js'
import { NoOpFigure } from './figures/noopFigure.js'
import { CommandStack } from './commands/commandStack.js'
import { Selection} from './selection.js';
import { Point } from './data/point.js';
import { Rect } from "./data/rect.js";
import { Drawing } from './drawing.js'
import { Figure } from './figures/figure.js'
import { Command } from './commands/command.js'
import { Handle } from './handles/handle.js'
import {jsonToFigure} from './figureFactory.js'
import {Highlightable, ToolManager, Previewer, Highlighter,SelectionManager, CommandManager, ViewTransformerConversions, InteractionInfoProvider} from './interfaces.js'
import { SelectionTool } from './tools/selectionTool.js'
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
type NamedTool = {
    tool:Tool,
    name:string
    isDefault?:boolean
}
type DrawingViewParam = { 
    ctx: CanvasRenderingContext2D; 
    drawing: Drawing; 
    ctxSize: Point;
    textDirection:"rtl"|"ltr"
    requestEditorText:Function;
    tools:Array<NamedTool>
}

/**
 * Manages the view, but none of the native UI or the event conversion (which is what app does)
 * 
 * @see App
 *  
 */
class DrawingView 
extends EventTarget 
implements ToolManager,Previewer, Highlighter,SelectionManager, CommandManager, ViewTransformerConversions
{
    #ctx:CanvasRenderingContext2D
    #transform:ViewTransform
    #ctxSize:Point;
    #commandStack = null;
    #selection    = null; 
    #requestEditorText  = null;
    #textDirection = null; 

    drawing:Drawing

    constructor(param:DrawingViewParam){
        super();
        const {ctx,drawing,ctxSize, textDirection, requestEditorText, tools} = param

        //register Tools
        this.#registerTools(tools);
        //drawing
        this.#transform = new ViewTransform();
        this.setCtxSize(ctxSize);//needed to know which area to clear on redraws
        this.#ctx = ctx;
        this.#textDirection = textDirection;
        
        this.drawing = drawing;

        this.#requestEditorText = requestEditorText;
        this.#commandStack = new CommandStack();
        this.#selection = new Selection();
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
        const ctx = this.#ctx;
        // Configs
        //for some reason, setting the font works not if set in the constructor
        // Playpen and Shantell are open fonts, ComicSans comes with Windows, Chalkboard with Mac. 
        ctx.font = "16px 'Playpen Sans','Shantell Sans','Comic Sans MS','Chalkboard'"; 
        ctx.direction = this.#textDirection;
        
        // clear canvas
        this.#ctx.clearRect(0,0,this.#ctxSize.x,this.#ctxSize.y);

        //trigger draws
        this.#drawDrawing(ctx);
        this.#drawPreviews(ctx);
        this.#drawHandles(ctx);
        this.#drawHighlightRects(ctx);

        // const offscreenCanvas = new OffscreenCanvas(this.#ctxSize.x, this.#ctxSize.y);
        // const ctx = offscreenCanvas.getContext("2d");
        // …pass offscreen canvas context to the drawing functions
        // const offscreenContextImage = offscreenCanvas.transferToImageBitmap()
        // this.#ctx.drawImage(offscreenContextImage,0,0);
        ///…but for some reason this looked the same.
        
    }
    #drawDrawing(ctx:CanvasRenderingContext2D):void{
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
    startPreviewOf(figureToPreview: Figure, hideOriginal:Boolean = true):void{ //puts figure in preview
        this.#previewedElement = figureToPreview;
        this.#previewElement = figureToPreview.copy(); //like: copy(this.stringClassMapper)
        this.#isPreviewing = true;
        if(hideOriginal){
            figureToPreview.setIsVisible(false);
        }
        
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

    documentToScreenDistance(documentDistance: Point): Point {
         const screenDistance = this.#transform.documentToScreenDistance(documentDistance);
         return screenDistance;
    }

    screenToDocumentDistance(screenDistance: Point): Point {
        const documentDistance = this.#transform.screenToDocumentDistance(screenDistance);
        return documentDistance;
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
    #tools:Array<NamedTool>=[];
    #activeTool:Tool;
    #defaultTool:Tool;
    //#queuedTool: AbstractTool|null; 

    #registerTools(addTools:Array<NamedTool>){
        this.#tools.push(...addTools);
        const defaultNamedTool = addTools.find(namedTool=> namedTool.isDefault === true)
        if(defaultNamedTool){
            this.setDefaultToolByName(defaultNamedTool.name);
        } else {
            throw Error("One of the passed tools needs to be the default tool by giving in the property isDefault:true")
        }
    }
    /*
    Use this to change tools internally, i.e. by Drawing View or tools changing to other tools. 
    */
    changeTool(tool:Tool):void{
        if(this.#mouseState === "down"){ //guard
            console.log("tool change requested while mouse was down.");
            return; 
        }
        tool.setDrawingView(this);
        this.#activeTool = tool;
        const matchingToolData = this.#tools.find(toolData=> toolData.tool === tool);
        if(matchingToolData){
            this.dispatchEvent(new ToolChangeEvent(matchingToolData.name));
        }
    }

    setDefaultToolByName(defaultToolName:string){
        const defaultNamedTool = this.#tools.find(namedTool=> namedTool.name === defaultToolName);
        if(defaultNamedTool){
            this.#defaultTool = defaultNamedTool.tool;
        } else {
            throw Error(`requested a tool named ${defaultToolName}, but a registered tool with that name could not be found`);
        }
    }
    changeToDefaultTool(){
        this.changeTool(this.#defaultTool ?? new NoOpTool());
    }

    /* 
    Use this function when requesting tool changes from app.js
    Tools need to be registered via #registerTools (called by constructor)
    */
    changeToolByName(toolName:string):void{
        const newTool = this.#tools.find(tool=>tool.name === toolName);
        if(newTool){
            this.changeTool(newTool.tool);
        } else {
            console.log(`tool with name ${toolName} could not be found.`)
        }
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
        this.#lockedDragTool = this.#activeTool; 
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

        this.#activeTool.onMousemove(localMouseEvent);
        
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
        this.#activeTool.onWheel(localMouseEvent,wheelDelta);
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
        this.#activeTool.onHover(mouseEvent);
    }

    #onDragend(dragEvent:LocalDragEvent){
        this.#lockedDragTool.onDragend(dragEvent);
        this.#lockedDragTool.dragExit();
    }

    onKeyDown(){}
    onKeyUp(){}

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

    undo():void{
        this.#commandStack.undo();
        this.updateDrawing();
    }
    redo():void{
        this.#commandStack.redo();
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


    //#region: selection
    select(figure:Figure):void{
        this.#selection.select(figure);
        this.updateDrawing();
    }
    clearSelection():void{
        this.#selection.clearSelection();
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
    // getNameFigureClassMapper():NameFigureClassMapper{
    //     return this.#nameFigureClassMapper;
    // }
    announceInteractionsOf(element:InteractionInfoProvider){
        const interactions = element.getInteractions()
        const interactionEvent = new InteractionAnnouncementEvent(interactions)
        this.dispatchEvent(interactionEvent);
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

export {DrawingView, DrawingViewParam}