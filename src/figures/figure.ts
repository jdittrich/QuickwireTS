import { SubclassShouldImplementError } from '../errors.js';
import {Rect,RectJson, RectParam } from '../data/rect.js';
import {Point} from '../data/point.js';
//import { RectConstraint} from '../data/rectConstraint.js';
import {FigureAttributes} from './figureAttributes.js';
import { Handle } from '../handles/handle.js';
import { DuplicationHandle } from '../handles/duplicationHandle.js';
import { createAllResizeHandles } from '../handles/resizeHandle.js';
import { DeleteFigureHandle } from '../handles/deleteFigureHandle.js';
import { DrawingView } from '../drawingView.js';
import { Drawable, Highlightable, InteractionAnnouncement, InteractionInfoProvider } from '../interfaces.js';
import { CompositeFigure } from './compositeFigure.js';

type CreateFigureParam = {}

type FigureJson = {
    type: String;
}

abstract class Figure implements Drawable, Highlightable, InteractionInfoProvider{

    #attributes = new FigureAttributes();

    #containedBy = null;

    readonly name:string = "baseFigure";
    /**
     * 
     * @param {object} param 
     * @param { } param
     */
    constructor(param: CreateFigureParam){
        
    }
    
    /**
     * returns the copies of parameters shared by all figures: 
     * @returns CreateFigureParam
     */
    getParameters():CreateFigureParam{
        return {}
    }

    //#region: drawing     
    /**
     * Called from other objects, interface to drawing operations.
     * Usually not overwritten by subclasses.
     * Subclasses overwrite drawFigure
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx: CanvasRenderingContext2D){
        //TODO: change for composite
        if(this.getIsVisible()){
            ctx.save();
            this.drawFigure(ctx);
            ctx.restore()
        }
    }
    drawHighlight(ctx: CanvasRenderingContext2D){
        const {x,y,width,height} = this.getBoundingBox();
        ctx.save();
        ctx.strokeStyle = "#5895d6";
        ctx.strokeRect(x,y,width,height);
        ctx.restore();
    }
    
    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    abstract drawFigure(ctx: CanvasRenderingContext2D):void

    //#region: Attributes
    /**
     * Get the attribute by key
     * @param {String} key 
     */
    getAttribute(key: string){
        const value  = this.#attributes.get(key);
        return value; 
    }

    /**
     * Set an attribute value on key.
     * @param {String} key 
     * @param {*} value 
     */
    setAttribute(key: string,value: any){
        this.#attributes.set(key,value);
    }
    /**
     * Registers additional allowed keys.
     * Usually called in constructor.
     * @param {object}   {"Keyname":"ConstructorName"}
     */
    registerAttributes(keyConstructorObject){
        this.#attributes.register(keyConstructorObject)
    };
    
    /**
     * @param {Figure} figure 
     */
    setContainer(container:CompositeFigure){
        this.#containedBy = container;
    }

    /**
     * Returns the figure containing this
     * @returns {Figure}
     */
    getContainer(): CompositeFigure{
        return this.#containedBy;
    }

    /**
     * True if it is currently contained in any other figure, false if not (and thus not part of the drawing)
     * @returns {Boolean}
     */
    isContained(): boolean{
        return !!this.#containedBy;
    }

    /**
     * Get all figures that contain this.
     * @returns {Figure[]}
     */
    getContainers(): CompositeFigure[]{
        let containers:CompositeFigure[] = [];

        let currentFigure:Figure = this; 

        while(currentFigure.getContainer()){
            let container:CompositeFigure = currentFigure.getContainer();
            containers.push(container);
            currentFigure = container;
        }

        return containers;
    }
    // Child management null implementations for composite pattern

    getContainedFigures(): Figure[]{
        return [];
    }

    //#region position and dimensions
    /** 
     * @param {Point} point as vector to move the figure 
    */
    abstract moveBy(point: Point):void
    abstract resizeByPoints(point1:Point, point2:Point):void //useful for reacting to mouse drags e.g. on figure creation
    // The container figure calls this after resizing.
    // if the container figure is resized, contained figures need to react to it somehow
    // (the "normal" reaction is to keep distance to the upper left corner the same)
    abstract outerFigureChange(outerRect:Rect):void 
    abstract generateConstraints():void



    //#region: Handles factory
    /**Returns a list of handles of the figure */ 
    getHandles(drawingView:DrawingView):Handle[]{
        /**
         * NOTE on Architecture: 
         * Why do we need to pass drawingView here?
         * figures do not need to know drawingView (so far)
         * they just need to know how to draw themselves and where they
         * are in document coordinates. 
         * Handles, however do need to know how to draw themselves in relation 
         * to the drawingViews zoom! Handles are always the same size, no matter 
         * how far we zoomed in or out – this is relevant for drawing and hot testing
         * 
         * I could also have the figure return view-independent handle data 
         * and selection draws them and hit-tests.
         * 
         * Or I pass a transform to the handle’s drawing method
         *  
         */
        const duplicationHandle = new DuplicationHandle(this,drawingView);
        const deleteFigureHandle = new DeleteFigureHandle(this,drawingView)

        //const elementHandles = this.#figureElements.flatMap(figure=> figure.getHandles(drawingView));

        return [
            duplicationHandle,
            deleteFigureHandle,
            //...elementHandles
        ];
    }

    //#region FormElementFactory
    /**
     * Similar to Handles. Handles are drawn on canvas
     * but FormElements are handled by App and attached to a toolbar
     * to change figure properties.
     */
    getFormElements(drawingView, formElementFactory){
        return[];
    }

    //#region: hit tests.
    abstract getBoundingBox(): Rect
    isEnclosingPoint(point:Point){
        const rect = this.getBoundingBox()
        const isEnclosingPoint = rect.isEnclosingPoint(point);
        return isEnclosingPoint;
    }
    isEnclosedBy(compositeFigure:CompositeFigure){
        const outerRect = compositeFigure.getBoundingBox();
        const innerRect = this.getBoundingBox();
        const isEnclosingInnerRect = outerRect.isEnclosingRect(innerRect);
        return isEnclosingInnerRect;
    }

    //#region: visibility
    #isVisible = true
    
    /**
     * @returns {Boolean}
     */
    getIsVisible(): boolean{
        return this.#isVisible;
    }

    /**
     * @param {Boolean} isVisible 
     */
    setIsVisible(isVisible: boolean){
        if(typeof isVisible !== "boolean"){throw TypeError("setIsVisible parameter needs to be boolean")}
        this.#isVisible = isVisible;
    }

    //#region: copy
    copy():Figure{
        const parameters = this.getParameters();
        const constructor = this.constructor as unknown as any;
        const newFigure =  new constructor(parameters);
        return newFigure;
    }

    
    //#region serialization/deserialization
    /**
     * string serialization read by people, similar to python’s __str__
    */
    toString(){
       const type = this.name; 
       const basicString = `type:${type}`
       return basicString;
    }
    
    
    /**
     * JSON serialization for storage
     * @returns {JSON}
    */
    toJSON(): FigureJson {
        return {
            type:this.name
        }
    }

    /*
    Why is there no
    abstract fromJSON(FigureJson)
    ?

    Composite figures need some way to create figures of any type.
    In the figure Factory we have a function that recursively creates figures
    that are contained within a compositeFigure. The factory collects all types
    of figures in one place and can switch between them. Doing it here would 
    have needed to much trickery and indirection (at least in the ways I tried.)

    @see{CompositeFigure}
    @see{figureFactory}
    */

    getInteractions(): InteractionAnnouncement {
        return {
            clickable: false,
            draggable: true,
            cursor:"default",
            helpText: "a figure"
        }
    }
}

export {Figure, CreateFigureParam, FigureJson}