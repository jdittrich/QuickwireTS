import { Point } from './data/point.js';
import { Rect } from './data/rect.js';
import { Figure,CreateFigureParam, FigureJson} from './figures/figure.js';
import { findFiguresBelowPoint, findInnermostEnclosingFigure, findInnerMatches} from './hitTest.js';

// the drawing contains other figures, so it is basically a composite figure

type CreateDrawingParam = CreateFigureParam;

type DrawingJson = FigureJson;

class Drawing extends Figure{
    name = "Drawing";
    isRoot = true;

    constructor(param:CreateDrawingParam){
        super(param);
    }
    draw(ctx: CanvasRenderingContext2D){
        const {width, height} = this.getRect();
        ctx.save();
        ctx.fillStyle = "#EEE";
        ctx.fillRect(0,0,width,height);
        ctx.restore()
        this.drawContainedFigures(ctx);
    }
    //#region hit tests

    /**
     * NOTE: maybe I should get rid of this in favor of findFigureEnclosingRect and findEnclosedFigures used separately,
     * so I can get clean types and the error
     * 
     * Convenience method for the most common use for hit-testing figures: 
     * Finding the innermost enclosing figure and the enclosed figures that are 
     * enclosed in this enclosing figures (which would then attached to the figures passed for hit-testing)
     */
    findFiguresEnclosingAndEnclosed(rect:Rect): any{
        const innermostEnclosing = this.findFigureEnclosingRect(rect);
        const innermostEnclosedFigures = findInnerMatches(innermostEnclosing,rect);

        return {
            "rectEnclosesFigures":  innermostEnclosedFigures,
            "rectEnclosedByFigure": innermostEnclosing
        };
    }

    /**
     * Find the innermost figure that fully encloses the passed rectangle
     */
    findFigureEnclosingRect(rect:Rect):Figure{
        const innermostEnclosing = findInnermostEnclosingFigure(this,rect)
        if(!innermostEnclosing){
            throw new Error("The Rect is not enclosed in any Figure, not even the root of the sketch")
        }
        return innermostEnclosing;
    }

    /**
     * finds all figures that are 
     * directly contained by container AND enclosed by rect
     */
    findEnclosedFigures(container:Figure,rect:Rect):Figure[]{
        const innerMatches = findInnerMatches(container, rect);
        return innerMatches
    }

    /**
     * Find innermost figure that fully encloses the passed point.
     * @throws if point is outside of the sketch root figure
     */
    findFigureEnclosingPoint(point:Point):Figure{
        const figuresBelowPoint = findFiguresBelowPoint(this,point,true);
        const figureBelowPoint = figuresBelowPoint[0];
        return figureBelowPoint;
    }

    //NOTE: I probably never need all figures?
    findFiguresEnclosingPoint(point:Point){ 
       const figuresBelowPoint = findFiguresBelowPoint(this,point,false); //…,…,false = don’t allow to select the drawing itself
       return figuresBelowPoint;
    }
    
    toJSON():DrawingJson{
        const baseJson = super.toJSON();
        const drawingFigureJson =  {
            ...baseJson
        }
        return drawingFigureJson;
    }

    getInteractions(){
        return { 
            cursor: "default",
            helpText: "the drawing background",
            draggable: true, 
            clickable: false 
        };
    }
}

export {Drawing}


