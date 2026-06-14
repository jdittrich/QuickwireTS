import { Figure, CreateFigureParam, FigureJson } from "./figure.js";
import { Rect,RectJson, RectResize } from "../data/rect.js";
import { Point } from "../data/point.js";
import { RectConstraint } from "../data/constraint.js";
import { createAllResizeHandles, createCropHandles } from '../handles/resizeHandle.js';
import { DrawingView } from "../drawingView.js";
import { InteractionAnnouncement } from "../interfaces.js";


type CreateCompositeFigureParam = CreateFigureParam & {
    rect:Rect;
    containedFigures?:Figure[];
}

type CompositeFigureJson = FigureJson & {
    rect:RectJson;
    containedFigures:FigureJson[];   
}


class CompositeFigure extends Figure {
    readonly name:string = "CompositeFigure";
    containedFigures:Figure[] = []
    #rect:Rect;
    #rectConstraint: RectConstraint
    isRoot = false; //only overwritten by the Drawing subclass


    constructor(param:CreateCompositeFigureParam){
        super(param);
        this.setRect(param.rect);
        this.appendFigures(param.containedFigures ?? []);
    }
    
    get rect(){
        return this.#rect.copy();
    }

    //#region: drawing
    draw(ctx: CanvasRenderingContext2D){
        const {x,y,width,height} = this.getRect()
        if(this.getIsVisible()){
            ctx.save();
                this.clipFigure(ctx);

                ctx.save();
                    this.drawFigure(ctx);
                ctx.restore();

                this.drawContainedFigures(ctx); //will be clipped, but not inherit e.g. strokes from the figure
            ctx.restore();
        }
    }

    drawFigure(ctx: CanvasRenderingContext2D): void {
        const {width,height,x,y} = this.getBoundingBox();
        ctx.strokeRect(x,y,width,height);
    }
    
    clipFigure(ctx:CanvasRenderingContext2D){
        ctx.beginPath();
        const {x,y,width,height} = this.getBoundingBox();
        ctx.rect(x,y,width,height);
        ctx.clip(); //prevent drawing outside of figure boundaries
    }

    /**
     * Not to be overwritten by subclasses.
     * Called only internally by draw.
     * @param {CanvasRenderingContext2D} ctx 
     */
    drawContainedFigures(ctx: CanvasRenderingContext2D){
        this.containedFigures.forEach(figure => {
            ctx.save();
                figure.draw(ctx)
            ctx.restore();
        });
    }

    getParameters(): CreateCompositeFigureParam {
        const containedCopies = this.getContainedFigures().map(figure => figure.copy())
       
        const compositeFigureParameters = {
            "rect":this.rect,
            "containedFigures":containedCopies,
        }
        return compositeFigureParameters;
    }
    
    //#region: child management: Containing other figures
    
    /**
     * Overwrites stub method in Figure, which is provided for interface compatibility.
     * Returns array with contained figures BUT not their contained figures, too
     * @returns {Figure[]} 
     */
    getContainedFigures(): Figure[]{
        return [...this.containedFigures];
    }

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
        figureToAppend.generateConstraints();
    }

    /**
     * @param {Figure[]} figuresToAppend 
     * @see {@link appendFigure}
     */
    appendFigures(figuresToAppend: Figure[]){
        //TODO: How to do update the con
        //first check circularity for all, preventing that a part is appended before the error
        const circularityChecks = figuresToAppend.map(figure=>this.#isCircularRelation(figure));
        const atLeastOneCircular = circularityChecks.includes(true);
        if(atLeastOneCircular){
            throw new Error("Can’t append: At least one proposed Child is its own ancestor, would create circular hierarchy.")
        }
        //but if all checks pass: 
        figuresToAppend.forEach(figure=>this.appendFigure(figure));
    }

    /**
     * Checks, if appending to this would create a circular relation i.e. it would be contained in itself.
     * @param {Figure} figureToAppend. It might be Figure or a Composite figure, only for the latter the circular relation is possible.  
     * @returns {Boolean} 
     */
    #isCircularRelation(figureToAppend: Figure): boolean{
        //we have a circularRelation if the figureToAppend is in the list of figures that contain this.
        const isCircular = this.getContainers().includes(figureToAppend as CompositeFigure);
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
        const updatedContainedFigures = this.containedFigures.filter(containedFigure => containedFigure !== figureToRemove);
        this.containedFigures = updatedContainedFigures;
    }

    /**
     * @see {@link CompositeFigure.#removeFromCollection} as inverse
     * @param {Figure} figureToAdd 
     */
    #addToCollection(figureToAdd: Figure){
        if(this.#isInCollection(figureToAdd)){
            throw new Error("Figure to be added is already contained in this figure")
        };
        this.containedFigures.push(figureToAdd);
    }

    /**
     * @param {Figure} figure 
     * @returns {Boolean}
     */
    #isInCollection(figure: Figure): boolean{
        const includesFigure = this.containedFigures.includes(figure);
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
    
    protected setRect(rect:Rect){
        this.#rect = rect;
    }
    resizeByPoints(point1: Point, point2: Point): void {
        const newRect = Rect.createFromCornerPoints(point1, point2);
        this.changeRect(newRect, true);
    }

    //#region: hittests
    getBoundingBox(): Rect {
        const rect = this.rect
        return rect;
    }
    isEnclosingPoint(point: Point): boolean {
        return this.getBoundingBox().isEnclosingPoint(point);
    }
    isEnclosingFigure(figure: Figure): boolean{
        const  otherFigureRect = figure.getBoundingBox();
        const  doesThisEncloseFigure = this.isEnclosingRect(otherFigureRect);
        return doesThisEncloseFigure; 
    }

    isEnclosingRect(rect: Rect): boolean{ 
        const doesThisEncloseRect = this.getBoundingBox().isEnclosingRect(rect);
        return doesThisEncloseRect;
    }

    //#region:Resizes/moves

    moveBy(point: Point) {
        //move bounding box
        const oldRect= this.rect;
        const newRect = oldRect.movedCopy(point);
        this.setRect(newRect);

        //move all contained
        this.containedFigures.forEach(figure=>figure.moveBy(point));
    }
    
    getRect():Rect{
        return this.getBoundingBox();
    }
    // @see {Figure.updateFromConstraints}
    changeRect(updatedRect:Rect, affectInner:boolean):void{

        const oldRect = this.#rect;
        this.#rect = updatedRect;
        if(affectInner){
            //move figures
            const containedFigures = this.getContainedFigures();
            containedFigures.forEach(figure=>figure.outerFigureChange(updatedRect))
        }        
    }
    
    resizeByRectResize(resize:RectResize,affectInner:boolean=true):void{
        const updatedRect = this.#rect.resizedCopy(resize);
        this.changeRect(updatedRect,affectInner);
    }
    outerFigureChange(outerRect:Rect):void {
        const updatedRect = this.#rectConstraint.deriveRect(outerRect);
        this.#rect = updatedRect;
        const containedFigures = this.getContainedFigures();
        containedFigures.forEach(figure=>figure.outerFigureChange(updatedRect))
    }

    
    getConstraintType():"ProportionalConstraint"|"MidpointProportionalConstraint"{
        return "ProportionalConstraint"
    }

    //currently called manually, maybe it should directly be called by resizes.
    generateConstraints():void{
        if(!this.getContainer()){
            throw Error("figure currently not attached, can't generate constraints")
        }
        
        const innerRect = this.rect;
        const outerFigure = this.getContainer()
        const outerRect = outerFigure.rect;

        const constraint = RectConstraint.fromRects({
            "outerRect":outerRect,
            "innerRect":innerRect,
            "type":this.getConstraintType()
        });

        this.containedFigures.forEach(figure=> figure.generateConstraints())

        this.#rectConstraint = constraint;
    }
    //#region: handles
    getHandles(drawingView:DrawingView){
        const basicHandles = super.getHandles(drawingView);
        const resizeHandles = createAllResizeHandles(this,drawingView);
        const cropHandles = createCropHandles(this,drawingView)
        return [...basicHandles, ...resizeHandles, ...cropHandles];
    }
    //#region: interactions
    getInteractions(): InteractionAnnouncement {
        return {
            clickable: false,
            draggable: true,
            paintable: false,
            cursor:"default",
            helpText: "a figure"
        }
    }
    //#region: (de)serialization
    toString(){
       const baseString = super.toString();
       const containedFigures = this.getContainedFigures();
       const compositeString  = `number of contained figures:${containedFigures.length}`
       const compositeFigureString = baseString + compositeString;
       return compositeFigureString;
    }
    /**
     * @returns {Array} with toJSONs of contained figures.
     */
    getJsonOfContainedFigures(): Array<FigureJson>{
        const jsonOfContainedFigures = this.containedFigures.map(figure=>figure.toJSON());
        return jsonOfContainedFigures;
    }
    /**
     * Returns a JSON of the rectangle of the figure.
     * @returns {JSON}
     */
    // getJsonOfRect():RectJson{
    //     const {x,y,width,height} = this.getRect();
    //     return {
    //         "x":x,
    //         "y":y,
    //         "width":width,
    //         "height":height
    //     }
    // }
    /**
     * JSON serialization for storage 
     * @returns {JSON}
    */
   toJSON(): CompositeFigureJson{
       const baseFigureJson = super.toJSON();
       const containedFigureJson = this.getJsonOfContainedFigures();

        const compositeFigureJson = {
            ...baseFigureJson,
            "rect":this.rect.toJSON(),
            "containedFigures":containedFigureJson,
        }
        return compositeFigureJson
    }
    static createWithDefaultParameters():CompositeFigure{
        const compositeFigure = new CompositeFigure({
            rect: new Rect({
                "x":0,
                "y":0,
                "width":100,
                "height":50
            })
        });
        return compositeFigure;
    }
}

export {CompositeFigure, CreateCompositeFigureParam, CompositeFigureJson}