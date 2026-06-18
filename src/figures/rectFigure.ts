import { createAllResizeHandles } from '../handles/resizeHandle.js';


import { CompositeFigure, CreateCompositeFigureParam, CompositeFigureJson } from './compositeFigure.js';
import { Rect } from '../data/rect.js';
import { DrawingView } from '../drawingView.js';
import { Point } from '../data/point.js';
//import { FigurePainting } from '../../legacyStuff/legacyFigures/figurePainting.js';
import { InteractionAnnouncement } from '../interfaces.js';
import { FormElementFactory, FormElement } from '../app_formElements.js';
import { ChangeAttributeCommand, ChangeAttributeCommandParam } from '../commands/changeAttributeCommand.js';
import {DropdownOption} from '../app_formElements.js';

type CreateRectFigureParam = CreateCompositeFigureParam & {
    //canvas?:OffscreenCanvas
    rectStyle?:RectStyleTypes
};

type RectFigureJson = CompositeFigureJson & {
    rectStyle: RectStyleTypes
};

type RectStyleTypes = "default"|"accent"|"imagePlaceholder"
type DrawRect = (ctx:CanvasRenderingContext2D,rect:Rect)=>void


const drawImagePlaceholderCross = function(ctx:CanvasRenderingContext2D,rect:Rect){
    const corners = rect.getCorners();
    ctx.beginPath();
    ctx.moveTo(corners.topLeft.x,corners.topLeft.y);
    ctx.lineTo(corners.bottomRight.x,corners.bottomRight.y);
    ctx.moveTo(corners.topRight.x, corners.topRight.y);
    ctx.lineTo(corners.bottomLeft.x,corners.bottomLeft.y);
    ctx.stroke();
}

const drawAccentBackground = function(ctx:CanvasRenderingContext2D, rect:Rect){
    const {x,y,width,height} = rect;
    const oldFillStyle = ctx.fillStyle;
    ctx.fillStyle = "#9bbbde"
    ctx.fillRect(x,y,width,height);
    ctx.fillStyle = oldFillStyle;
}

const drawRectOutline  = function(ctx:CanvasRenderingContext2D, rect:Rect):void{
    const {width,height,x,y} = rect;
    ctx.strokeRect(x,y,width,height);
}

const drawAccentRect = function(ctx:CanvasRenderingContext2D, rect:Rect):void{
    drawAccentBackground(ctx,rect);
    drawRectOutline(ctx,rect);
}

const drawImagePlaceholderRect = function(ctx:CanvasRenderingContext2D, rect:Rect):void{
    drawRectOutline(ctx,rect);
    drawImagePlaceholderCross(ctx,rect);
}

const drawDefaultRect = function(ctx:CanvasRenderingContext2D, rect:Rect):void{
    drawRectOutline(ctx,rect);
}


const rectStyleRegistry:Record<RectStyleTypes,DrawRect> = {
    "default":   drawDefaultRect,
    "accent":    drawAccentRect,
    "imagePlaceholder": drawImagePlaceholderRect
}

type RectStyleKeys = keyof typeof rectStyleRegistry

const selectParams:DropdownOption<RectStyleKeys>[] = [
    {value:"default", label:"default", iconName:"rect_default"},
    {value:"accent",  label:"accent", iconName:"rect_accent"},
    {value:"imagePlaceholder",  label:"image placeholder", iconName:"rect_placeholder"}
]

/**
 * Creates figure representing a simple rectangle
 * 
 * @param {object} param
 * @param {number} param.y
 * @param {number} param.x 
 * @param {number} param.width
 * @param {number} param.height
 */
class RectFigure extends CompositeFigure{
    readonly name = "RectFigure";

    constructor(param:CreateRectFigureParam){
        super(param);
        
        this.attributes.register({
            "rectStyle":String
        });

        const rectStyle:RectStyleTypes = param.rectStyle ||"default";
        this.attributes.set("rectStyle",rectStyle);
    }

    drawFigure(ctx:CanvasRenderingContext2D){
        const rect = this.getRect();
        const rectStyleAttribute = this.getAttribute("rectStyle") as RectStyleTypes;
        const drawRect:DrawRect = rectStyleRegistry[rectStyleAttribute];
        drawRect(ctx,rect);
    }

    getHandles(drawingView:DrawingView){
        const basicHandles = super.getHandles(drawingView);
        const resizeHandles = createAllResizeHandles(this,drawingView)
        return [...basicHandles, ...resizeHandles];
    }
    getFormElements(drawingView: DrawingView, formElementFactory: FormElementFactory): FormElement<any>[] {
        const rectStyleDropdown =  formElementFactory.createDropdown({
            label:"style:",
            selectedValue:this.getAttribute("rectStyle"),
            options:selectParams,
            changeHandler:(changedTo:string)=>{
                const changeAttributeParam:ChangeAttributeCommandParam = {
                    figure:this,
                    attribute:"rectStyle",
                    value:changedTo
             }
             const rectStyleCommand = new ChangeAttributeCommand(changeAttributeParam,drawingView);
             drawingView.do(rectStyleCommand);
            }
        });

        return [rectStyleDropdown]

    }
    getParameters():CreateRectFigureParam{
        const baseParameters = super.getParameters();
        const rectParameters = {
            ...baseParameters,
            "rectStyle":this.attributes.get("rectStyle")
            // canvas: this.#painting.getCanvas()
        };
        return rectParameters;
    }
    changeRect(updatedRect: Rect, affectInner: boolean): void {
        const oldRect = this.getRect();
        super.changeRect(updatedRect,affectInner);
        const rectResize = Rect.getDifference(oldRect,updatedRect);
        // this.#painting.crop(rectResize);
    }

    //TODO: move to interfaces or other place to share constraint types.
    getConstraintType():"ProportionalConstraint"|"MidpointProportionalConstraint"{
        return "ProportionalConstraint"
    }
    //#region: Paintable
    // paintFromTo(from: Point, to: Point): void {
    //     this.#painting.paintFromTo(from,to);
    // }

    // //get/set canvas is needed for undo/redo
    // getCanvas(): OffscreenCanvas {
    //     return this.#painting.getCanvas();
    // }
    // setCanvas(canvas: OffscreenCanvas): void {
    //     this.#painting.setCanvas(canvas)
    // }
    // clear(){
    //     this.#painting.clear();
    // }
  
    getInteractions(): InteractionAnnouncement {
        return {
            clickable: false,
            draggable: true,
            // paintable: true,
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
        const rectFigureJson = {
            ...baseFigureJson,
            rectStyle:this.attributes.get("rectStyle")
        }
        return rectFigureJson;
    }

    static createWithDefaultParameters():RectFigure{
        const rectFigure = new RectFigure({
            rect: new Rect({
                "x":0,
                "y":0,
                "width":100,
                "height":50
            }),
            rectStyle:"default"
        });
        return rectFigure;
    }
}

export {RectFigure, CreateRectFigureParam, RectFigureJson}
