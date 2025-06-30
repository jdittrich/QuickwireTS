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
import { FigureElement } from './figureElements/figureElement.js';


type CreateFigureParam = {
    rect:Rect;
    containedFigures?:Figure[]
}

type FigureJson = {
    rect:RectJson;
    containedFigures:FigureJson[];
    type: String;
}

abstract class Figure implements Drawable, Highlightable, InteractionInfoProvider{
    #rect = null;

    #attributes = new FigureAttributes();

    #containedBy = null;

    isRoot = false; //only overwritten by the Drawing subclass

    #figureElements:FigureElement[] = []

    name:string = "baseFigure";
    /**
     * 
     * @param {object} param 
     * @param { } param
     */
    constructor(param: CreateFigureParam){
        const rect = param.rect 
        this.#setRect(rect);
        this.appendFigures(param.containedFigures ?? []);
    }
    
    /**
     * returns the copies of parameters shared by all figures: 
     * a copy of the figure rect
     * a copy of the contained figures
     * @returns CreateFigureParam
     */
    getParameters():CreateFigureParam{
        const rectCopy = this.getRect().copy();
        const containedCopies = this.getContainedFigures().map(figure => figure.copy())
        const baseParameters = {
            rect:rectCopy,
            containedFigures: containedCopies
        }
        return baseParameters;
    }
    //#region figureElements
    addFigureElement(figureElement:FigureElement){
        this.#figureElements.push(figureElement);
    }

    //#region: drawing 
    /** Method called from other object. Interface to all needed drawing operations */
    
    /**
     * Called from other objects, interface to drawing operations.
     * Usually not overwritten by subclasses.
     * Subclasses overwrite drawFigure
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx: CanvasRenderingContext2D){
        if(this.getIsVisible()){
            ctx.save()
            this.#clipFigure(ctx);
            this.drawFigure(ctx);
            this.drawContainedFigures(ctx);
            ctx.restore()
        }
    }
    drawHighlight(ctx: CanvasRenderingContext2D){
        const {x,y,width,height} = this.getRect();
        ctx.save();
        ctx.strokeStyle = "#5895d6";
        ctx.strokeRect(x,y,width,height);
        ctx.restore();
    }
    
    //clips the drawing area to the figures rect
    #clipFigure(ctx:CanvasRenderingContext2D){
        ctx.beginPath();
        const {x,y,width,height} = this.getRect();
        ctx.rect(x,y,width,height);
        ctx.clip(); //prevent drawing outside of figure boundaries
    }
    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    drawFigure(ctx: CanvasRenderingContext2D){
        //dunno if that is great, it means I need to write a super() 
        // at the bottom of the draw function, lest the elements might be overwritten 
        // by background
        //this.#figureElements.forEach(figureElement => figureElement.draw(ctx));
    }

    /**
     * Not to be overwritten by subclasses.
     * Called only internally by draw.
     * @param {CanvasRenderingContext2D} ctx 
     */
    drawContainedFigures(ctx: CanvasRenderingContext2D){
        this.#containedFigures.forEach(figure => {
            ctx.save();
            figure.draw(ctx)
            ctx.restore();
        });
    }

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

    //#region: child management
    
    
    /**
     * @param {Figure} figure 
     */
    setContainer(container){
        this.#containedBy = container;
    }

    /**
     * Returns the figure containing this
     * @returns {Figure}
     */
    getContainer(): Figure{
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
    getContainers(): Figure[]{
        let containers:Figure[] = [];

        let currentFigure:Figure = this; 

        while(currentFigure.getContainer()){
            let container:Figure = currentFigure.getContainer();
            containers.push(container);
            currentFigure = container;
        }
        
        return containers;
    }

    /**
     * Returns the difference between the two upper left corners of this figure and the container.
     * @returns {Point}
     */
    offsetFromContainer(): Point{
        if(!this.getContainer()){
            throw new Error("Requested offset from Container, but figure is not currently assigned to a container")
        }
        const container = this.getContainer();
        const containerPosition = container.getPosition();
        const ownPosition = this.getPosition();
        const offset = ownPosition.offsetFrom(containerPosition);

        return offset;
    }

    #containedFigures = [] 

    /**
     * @see {@link detachFigure} as the inverse operation
     * @param {Figure} figure
     */
    appendFigure(figureToAppend:Figure){
        // #Constraint maybe not needed after constraints?
        if(!this.isEnclosingFigure(figureToAppend)){
            new Error(`can't append a figure that would be outside of container. If you append after a change of a figure e.g. drag, change the figure first, then append, not vice versa`);
        }

        if(this.#isCircularRelation(figureToAppend)){
            new Error("can't append a figure that would create a circular graph, i.e. be contained in itself")
        }
        
        if(figureToAppend.getContainer()){
           const currentContainer = figureToAppend.getContainer();
           currentContainer.detachFigure(figureToAppend);
        }
   
        this.#addToCollection(figureToAppend);

        figureToAppend.setContainer(this);
    }

    /**
     * @param {Figure[]} figuresToAppend 
     */
    appendFigures(figuresToAppend: Figure[]){
        //TODO: How to do that with constraints?
        //first check circularity for all, preventing that a part is appended before the error
        const circularityChecks = figuresToAppend.map(figure=>this.#isCircularRelation(figure));
        const atLeastOneCircular = circularityChecks.includes(true);
        if(atLeastOneCircular){
            throw new Error("Can’t append: At least one proposed Child is its own ancestor, would create circular hierarchy.")
        }

        // const containmentChecks = figuresToAppend.map(figure=>this.isEnclosingFigure(figure));
        // const atLeastOneOutside = containmentChecks.includes(false);
        // if(atLeastOneOutside){
        //     throw new Error("Can’t append: At least one proposed Child is outside the this figure")
        // }

        //but if all checks pass: 
        figuresToAppend.forEach(figure=>this.appendFigure(figure));
    }

    /**
     * Checks, if appending to this would create a circular relation i.e. it would be contained in itself.
     * @param {Figure} figureToAppend 
     * @returns {Boolean} 
     */
    #isCircularRelation(figureToAppend: Figure): boolean{
        //we have a circularRelation if the figureToAppend is in the list of figures that contain this.
        const isCircular = this.getContainers().includes(figureToAppend);
        return isCircular;
    }

    /**
     * encapsulate removal from collection of contained figures
     * @see {@link CompositeFigure.#addToCollection} as inverse
     * @param {Figure} figureToRemove 
     */
    #removeFromCollection(figureToRemove: Figure){
        if(!this.#isInCollection(figureToRemove)){
            throw new Error("figure to be removed is not contained in this figure.")
        }
        const updatedContainedFigures = this.#containedFigures.filter(containedFigure => containedFigure !== figureToRemove);
        this.#containedFigures = updatedContainedFigures;
    }

    /**
     * @see {@link CompositeFigure.#removeFromCollection} as inverse
     * @param {Figure} figureToAdd 
     */
    #addToCollection(figureToAdd: Figure){
        if(this.#isInCollection(figureToAdd)){
            throw new Error("Figure to be added is already contained in this figure")
        };
        this.#containedFigures.push(figureToAdd);
    }

    /**
     * @param {Figure} figure 
     * @returns {Boolean}
     */
    #isInCollection(figure: Figure): boolean{
        const includesFigure = this.#containedFigures.includes(figure);
        return includesFigure;
    }

    /**
     * remove figure from container. 
     * Might be called directly or when by appendFigure to move to a new container
     * @see {@link Figure.appendFigure} as the inverse
     */
    detachFigure(figureToRemove:Figure){
        this.#removeFromCollection(figureToRemove)
        figureToRemove.setContainer(null);
    }
    
    /**
     * Returns array with contained figures BUT not their contained figures, too
     * @returns {Figure[]} 
     */
    getContainedFigures(): Figure[]{
        return [...this.#containedFigures];
    }

    //#region position and dimensions via rect
    /** 
     * @param {Point} point as vector to move the figure 
    */
    movePositionBy(point: Point){
        const oldRect =  this.getRect();
        const newRect = oldRect.movedCopy(point);
        this.changeRect(newRect);
    }
    getPosition(): Point{ 
        const position = this.#rect.getPosition();
        return position;
    }
    
    /**
     * Low level, only to be called internally. It won't move contained figures.
     * @param {Rect} rect 
     */
    #setRect(rect: Rect){
        this.#rect = rect.copy(); 
    }

    /**
     * Called when creating a figure, from mousedown point to mouseup point. 
     * NOTE: Maybe it should be refactored into changeRect? Currently (1.3.24) only called on previewedFigure in "createFigureTool"
     * 
     * @see Rect.createFromCornerPoints
     * @param {Point} point1 
     * @param {Point} point2 
     */
    changeRectByPoints(point1: Point,point2: Point){
        const newRect = Rect.createFromCornerPoints(point1, point2);
        this.changeRect(newRect);
    }


    /**
     * For repositioning and resizing.
     * Collaboration: Usually called by updateRectFromConstraints,
     * but e.g. currently previewed elements can also set it directly 
     * (since they have no outer element to be constrainted by)
     */
    changeRect(changedRect:Rect){
        const oldRect = this.getRect();
        if(!oldRect){
            this.#setRect(changedRect);
            return;
        }
        const oldPosition = oldRect.getPosition();
        const newPosition = changedRect.getPosition();
        const moveBy = oldPosition.offsetTo(newPosition);
        this.#setRect(changedRect);

        const containedFigures = this.getContainedFigures();
        containedFigures.forEach(figure=>figure.movePositionBy(moveBy));
        //containedFigures.forEach(figure=>figure.updateRectFromConstraints()) //# For later when we have constraints
    }
    
    /**
    * @returns {Rect} 
    */
    getRect(): Rect{
       const rectCopy = this.#rect.copy(); 
       return rectCopy;
    }
    //#region constraints
    // #constraint
    // /**
    //  * @param {RectConstraint} constraints 
    //  */
    // setConstraint(constraint){
    //     this.#constraint = constraint;
    // }
    // getConstraint(){
    //     return this.#constraint;
    // }

    // /**
    //  * Collaboration: Will be called by outer container when it is resized
    //  */
    // updateRectFromConstraint(){
    //     const container = this.getContainer();
    //     const containerRect = container.getRect();
    //     const constraint = this.getConstraint();

    //     const newRect = constraint.deriveRect(containerRect);
    //     this.changeRect(newRect);
    // }


    //#region Handles factory
    
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
        const resizeHandles  = createAllResizeHandles(this, drawingView);

        const elementHandles = this.#figureElements.flatMap(figure=> figure.getHandles(drawingView));


        return [
            duplicationHandle,
            deleteFigureHandle,
            ...resizeHandles,
            ...elementHandles
        ];
    }

    //#region hit tests.
    isEnclosingPoint(point:Point): boolean{
        const doesContainPoint = this.#rect.isEnclosingPoint(point);
        return doesContainPoint;
    }

    isEnclosingFigure(figure: Figure): boolean{
        const  otherFigureRect = figure.getRect();
        const  doesThisEncloseFigure = this.isEnclosingRect(otherFigureRect);
        return doesThisEncloseFigure; 
    }

    isEnclosingRect(rect: Rect): boolean{ 
        const doesThisEncloseRect = this.#rect.isEnclosingRect(rect);
        return doesThisEncloseRect;
    }
    //# region visibility
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
       const {x,y,width,height} = this.getRect();
       const containedFigures = this.getContainedFigures();
       const basicString = `x:${x}, y:${y}, width:${width}, height:${height},number of contained figures:${containedFigures.length}, type:${type} `
       return basicString;
    }
    
    /**
     * @returns {Array} with toJSONs of contained figures.
     */
    #getJsonOfContainedFigures(): Array<FigureJson>{
        const jsonOfContainedFigures = this.#containedFigures.map(figure=>figure.toJSON());
        return jsonOfContainedFigures;
    }
    /**
     * Returns a JSON of the rectangle of the figure.
     * @returns {JSON}
     */
    #getJsonOfRect():RectJson{
        const {x,y,width,height} = this.getRect();
        return {
            "x":x,
            "y":y,
            "width":width,
            "height":height
        }
    }
    /**
     * JSON serialization for storage
     * @returns {JSON}
    */
   toJSON(): FigureJson{
       const containedFigureJson = this.#getJsonOfContainedFigures();
        const rectJson = this.#getJsonOfRect();

        const baseFigureJson:FigureJson = {
            "rect": rectJson,
            "containedFigures":containedFigureJson,
            "type": this.name 
        }
        return baseFigureJson
    }


    /**
     * Helper
     * @param {Array} containedFiguresJson 
     * @returns {Figure[]} 
     */
    // static createContainedFiguresFromJson(figureJson:FigureJson,nameFigureClassMapper:NameFigureClassMapper): Figure[]{
    //     if(!figureJson.containedFigures){
    //         return [];
    //     }

    //     const containedFiguresInstances = figureJson.containedFigures.map((containedFigureJson)=>{
    //         const type = containedFigureJson.type;
    //         const RequiredFigureClass = nameFigureClassMapper.getClass(type) //figureJson.type goes in…
    //         const figure = RequiredFigureClass.fromJSON(containedFigureJson,nameFigureClassMapper);
    //         return figure;
    //     })
    //     return containedFiguresInstances;
    // }

    // static fromJSON(JSON: FigureJson,nameFigureClassMapper: NameFigureClassMapper){
    //     throw new SubclassShouldImplementError("MainFigure","fromJSON");
    // }

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