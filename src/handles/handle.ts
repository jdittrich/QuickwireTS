import { DrawingView } from "../drawingView.js";
import { Figure } from "../figures/figure.js";
import { Point } from "../data/point.js";
import {Rect} from "../data/rect.js";
import { SubclassShouldImplementError } from "../errors.js";
import { LocalDragEvent, LocalMouseEvent } from "../events.js";
import { Drawable, Highlightable, InteractionInfoProvider, InteractionAnnouncement } from "../interfaces.js";


class Handle implements Drawable, Highlightable, InteractionInfoProvider {
    #figure:Figure
    #drawingView:DrawingView

    constructor(figure:Figure, drawingView:DrawingView){
        this.#figure = figure;
        this.#drawingView = drawingView;
    }

    // == Handle methods
    /**
     * returns point in document space
     */
    getLocation(): Point{
        throw new SubclassShouldImplementError("getLocation", "Handle");
    }

    getDrawingView(): DrawingView{
        return this.#drawingView;
    }

    /**
     * Get the figure to which the handle belongs
     */
    getFigure(): Figure{
        return this.#figure;
    }
    
    getScreenRect():Rect{
        throw new SubclassShouldImplementError("getScreenRect", "Handle");
    }
    /**
     * super simple color thing, maybe replace with Color type at some point
     */
    getColor(): string{
        return "#4e9a06";
    }
    getRect(){
        const screenRect = this.getScreenRect();
        const documentRect = this.#drawingView.screenToDocumentRect(screenRect);
        return documentRect;
    }
    // == figure-like methods
        
    /**
     * Draws the handle on the rendering context
     */ 
    draw(ctx: CanvasRenderingContext2D){ 
        const screenRect = this.getScreenRect();
        const {x,y,width,height} = screenRect;

        ctx.fillStyle = this.getColor();
        ctx.fillRect(
            x,
            y,
            width,
            height
        )
    }
    drawHighlight(ctx:CanvasRenderingContext2D){
        const screenRect = this.getScreenRect();
        const {x,y,width,height} = screenRect;
        ctx.strokeStyle = "#000000"; //"#5895d6"
        ctx.strokeRect(x,y,width,height);
    }

    /**
     * 
     * @param {Point} point (document space)
     * @returns {Boolean} - whether the point is in the handle or not 
     */
    isEnclosingPoint(point: Point): boolean{ //can stay
        const pointScreenPosition = this.#drawingView.documentToScreenPosition(point);
        const screenRect = this.getScreenRect();
        const isPointInsideRect = screenRect.isEnclosingPoint(pointScreenPosition)
        return isPointInsideRect;
    } 
    //== tool-like methods
    onDragstart(dragEvent:LocalDragEvent):void{ }
    onDrag(dragEvent:LocalDragEvent):void{ }
    onDragend(dragEvent:LocalDragEvent):void{ }
    onMousedown(mouseEvent:LocalMouseEvent):void{ }
    onMouseup(mouseEvent:LocalMouseEvent):void{ }
    dragExit():void{}

    //== announcer
    getInteractions(){
        return {
            cursor:"pointer",
            helpText:"a handle",
            draggable:true,
            clickable:true
        }
    }
}

export {Handle}