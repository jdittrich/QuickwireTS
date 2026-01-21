import { Figure, CreateFigureParam, FigureJson } from "./figure.js";
import { Rect,RectJson } from "../data/rect.js";

type CreateCompositeFigureParam = CreateFigureParam & {
    containedFigures?:Figure[]
}

type CompositeFigureJson = FigureJson & {
    containedFigures:FigureJson[];   
}

abstract class CompositeFigure extends Figure{
    name:string = "CompositeFigure";
    containedFigures:Figure[] = []

    constructor(param:CreateCompositeFigureParam){
        super(param);
        this.appendFigures(param.containedFigures ?? []);
    }
 
    /**needs a draw function that considers contained figures */
    draw(ctx: CanvasRenderingContext2D){
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
    
    clipFigure(ctx:CanvasRenderingContext2D){
        ctx.beginPath();
        const {x,y,width,height} = this.getRect();
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
    // //#region: child management: Containing other figures
    // #containedFigures = [] 

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
    
    /**
     * Returns array with contained figures BUT not their contained figures, too
     * @returns {Figure[]} 
     */
    getContainedFigures(): Figure[]{
        return [...this.containedFigures];
    }

    changeRect(suggestedRect:Rect){ 
        //TODO replace with overwritten setRect, there is no need to have two of this, 
        // except setrect would e.g. trigger an event or so.
        
        const oldRect = this.getRect();

        // I guess this is here to prevent wild changes to nested objects on first rect assignment.
        // but I wonder where that happens? 
        // UPDATE: I tried and it does not seem to happen. Commenting out and seeing...
        // if(!oldRect){
        //     this.#setRect(changedRect);
        //     return;
        // }

        //change child rects accordingly
        const newRect = this.sizeConstraint.deriveRect(suggestedRect);
        const oldPosition = oldRect.getPosition();
        const newPosition = newRect.getPosition();
        const moveBy = oldPosition.offsetTo(newPosition);
        this.setRect(newRect);

        const containedFigures = this.getContainedFigures();
        containedFigures.forEach(figure=>figure.movePositionBy(moveBy));
        //containedFigures.forEach(figure=>figure.updateRectFromConstraints()) //# For later when we have constraints
    }
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
    getJsonOfContainedFigures(): Array<FigureJson>{
        const jsonOfContainedFigures = this.containedFigures.map(figure=>figure.toJSON());
        return jsonOfContainedFigures;
    }
    /**
     * Returns a JSON of the rectangle of the figure.
     * @returns {JSON}
     */
    getJsonOfRect():RectJson{
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
       const containedFigureJson = this.getJsonOfContainedFigures();
        const rectJson = this.getJsonOfRect();

        const baseFigureJson:FigureJson = {
            "rect": rectJson,
            "containedFigures":containedFigureJson,
            "type": this.name 
        }
        return baseFigureJson
    }

}

export {CompositeFigure, CreateCompositeFigureParam}