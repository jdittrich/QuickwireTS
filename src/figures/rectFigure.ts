import { createAllResizeHandles } from '../handles/resizeHandle.js';


import { CompositeFigure, CreateCompositeFigureParam, CompositeFigureJson } from './compositeFigure.js';
import { Rect } from '../data/rect.js';
import { DrawingView } from '../drawingView.js';
import { Point } from '../data/point.js';
import { FigurePainting } from './figurePainting.js';
import { InteractionAnnouncement } from '../interfaces.js';

type CreateRectFigureParam = CreateCompositeFigureParam & {
    canvas?:OffscreenCanvas
};
type RectFigureJson = CompositeFigureJson;


interface Paintable{
    paintFromTo(from:Point,to:Point):void;
    getCanvas():OffscreenCanvas,
    setCanvas(canvas:OffscreenCanvas):void
}


/**
 * Creates figure representing a simple rectangle
 * 
 * @param {object} param
 * @param {number} param.y
 * @param {number} param.x 
 * @param {number} param.width
 * @param {number} param.height
 */
class RectFigure extends CompositeFigure implements Paintable{
    readonly name = "RectFigure";
    #offscreenCanvas = new OffscreenCanvas(1,1);
    #painting:FigurePainting
    constructor(param:CreateRectFigureParam){
        super(param);
        this.#painting = new FigurePainting(this)
        this.#painting.setCanvas(param.canvas ?? new OffscreenCanvas(param.rect.width,param.rect.height));
    }

    drawFigure(ctx:CanvasRenderingContext2D){
        const {width,height,x,y} = this.getBoundingBox();
        ctx.drawImage(this.#offscreenCanvas,x,y);
        this.#painting.draw(ctx);
        ctx.strokeRect(x,y,width,height);
    }

    getHandles(drawingView:DrawingView){
        const basicHandles = super.getHandles(drawingView);
        const resizeHandles = createAllResizeHandles(this,drawingView)
        return [...basicHandles, ...resizeHandles];
    }
    getParameters():CreateRectFigureParam{
        const baseParameters = super.getParameters();
        const rectParameters = {
            ...baseParameters,
            canvas: this.#painting.getCanvas()
        };
        return rectParameters;
    }
    changeRect(updatedRect: Rect, affectInner: boolean): void {
        const oldRect = this.getRect();
        super.changeRect(updatedRect,affectInner);
        const rectResize = Rect.getDifference(oldRect,updatedRect);
        this.#painting.crop(rectResize);
    }

    getConstraintType(){
        if(this.#painting.isPainted === false){
            return "ProportionalConstraint"
        } else {
            return "MidpointProportionalConstraint"
        }
    }
    //#region: Paintable
    paintFromTo(from: Point, to: Point): void {
        this.#painting.paintFromTo(from,to);
    }

    //get/set canvas is needed for undo/redo
    getCanvas(): OffscreenCanvas {
        return this.#painting.getCanvas();
    }
    setCanvas(canvas: OffscreenCanvas): void {
        this.#painting.setCanvas(canvas)
    }
    clear(){
        this.#painting.clear();
    }
  
    getInteractions(): InteractionAnnouncement {
        return {
            clickable: false,
            draggable: true,
            paintable: true,
            cursor:"default",
            helpText: "a figure"
        }
    }

    //the method used by mouse resizes also scales the image
    // resizeByRectResize(resize:{top:number,right:number,bottom:number,left:number}, affectInner:boolean=true,scaleImage:boolean=false):void{
    //     //const {width:originalWidth,height:OriginalHeight} = this.getRect();
    //     super.resizeByRectResize(resize, affectInner);

        
    //     const {width:updatedWidth,height:updatedHeight} = this.getRect();
    //     const updatedCanvas = new OffscreenCanvas(updatedWidth,updatedHeight);
    //     const updatedContext = updatedCanvas.getContext("2d");
    //     updatedContext.drawImage(this.#offscreenCanvas,0,0,updatedWidth,updatedHeight);
    //     this.#offscreenCanvas = updatedCanvas;
    // }

    // getConstraintType():"ProportionalConstraint"|"MidpointProportionalConstraint"{
    //     if(this.#isPainted === false){
    //         return "ProportionalConstraint"
    //     } else {
    //         return "MidpointProportionalConstraint"
    //     }
    // }

    //#region: (de)serialization

    /**
    * @see {Figure.toString}
    */
    toString():string{
       const baseString = super.toString();
       const rectString = baseString;
       return rectString;
    }
    
    toJSON():RectFigureJson{
        const baseFigureJson = super.toJSON();
        const rectFigureJson = baseFigureJson;
        return rectFigureJson;
    }

    static createWithDefaultParameters():RectFigure{
        const rectFigure = new RectFigure({
            rect: new Rect({
                "x":0,
                "y":0,
                "width":100,
                "height":50
            })
        });
        return rectFigure;
    }
}

export {RectFigure, CreateRectFigureParam, Paintable}
