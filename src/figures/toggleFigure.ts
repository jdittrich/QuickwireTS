import { Figure, CreateFigureParam, FigureJson} from "./figure.js";
import { Rect } from "../data/rect.js";
import { Point } from "../data/point.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import {EditTextHandle} from '../handles/editTextHandle.js';
import { ToggleAttributeHandle } from "../handles/toggleAttributeHandle.js";

type CreateToggleParam = CreateFigureParam & {
    label:String;
    isSelected:Boolean;
}

type ToggleFigureJson = FigureJson & {
    isSelected:boolean,
    label: string,
}

/** A class for any figure that can be toggled like radiobuttons, checkmarks etc. */
abstract class LabeledToggleFigure extends Figure{
    height:number = 16
    constructor(param:CreateToggleParam){
        super(param);
        this.registerAttributes({"label":String});
        this.registerAttributes({"isSelected":Boolean})
        this.setAttribute("label",param.label);
        this.setAttribute("isSelected",param.isSelected);
    }
    abstract getLabelRect():Rect
    abstract getToggleRect():Rect

    getHandles(drawingView:DrawingView):Handle[]{
        const basicHandles = super.getHandles(drawingView);

        const textEditHandle = new EditTextHandle(this,drawingView,{
            attributeName:"label",
            textRect: this.getLabelRect()
        });
        const toggleCheckboxHandle = new ToggleAttributeHandle(this,drawingView,this.getToggleRect(),"isSelected");
        return [
            ...basicHandles,
            textEditHandle,
            toggleCheckboxHandle,
        ];
    }
    toString(): string{
        const basicString = super.toString();
        const label = this.getAttribute("label");
        const isSelected = this.getAttribute("isSelected");
        const toggleFigureSpecificString = `isSelected ${isSelected.toString()},label:${label}`;
        const fullString = basicString+toggleFigureSpecificString;
        return fullString;
    }
    getParameters(){
        const baseParameters = super.getParameters();
        const toggleFigureParameters ={
            ...baseParameters,
            label:this.getAttribute("label"),
            isSelected:this.getAttribute("isSelected")
        }
        return toggleFigureParameters;
    }

    getCenteredStartPoint():Point{
        const figureRect = this.getRect();
        const figureCenter = figureRect.getCenter();
        const centeredStartPoint = new Point({x:figureRect.x, y:figureCenter.y-(this.height/2) })
        
        return centeredStartPoint;
    }

    /**
     * Serializes figure to JSON
     * @returns {object} as json
     */
    toJSON(): ToggleFigureJson{
        const baseJson = super.toJSON();

        const toggleFigureJson =  {
            ...baseJson,
            "label": this.getAttribute("label") as string,
            "isSelected": this.getAttribute("isSelected") as boolean
        }
        return toggleFigureJson;
    }
}

type CreateCheckmarkParam = CreateToggleParam;

class CheckmarkFigure extends LabeledToggleFigure {
    #cachedLabelHeight = 10;
    #cachedLabelWidth = 30;
    name = "CheckmarkFigure";

    constructor(param:CreateCheckmarkParam){
        super(param)
    }

    drawFigure(ctx:CanvasRenderingContext2D):void{
        const label      = this.getAttribute("label");

        //update metrics
        const labelMetrics = ctx.measureText(label);
        this.#cachedLabelHeight = labelMetrics.hangingBaseline - labelMetrics.ideographicBaseline;
        this.#cachedLabelWidth = labelMetrics.width;

        const toggleRect = this.getToggleRect();
        ctx.strokeRect(toggleRect.x,toggleRect.y,toggleRect.width, toggleRect.height);

        //optionally: draw checkmark
        if(this.getAttribute("isSelected")){
            ctx.beginPath();
            ctx.moveTo(toggleRect.x+4, toggleRect.y+(this.height/2));
            ctx.lineTo(toggleRect.x+(this.height/2), toggleRect.y+this.height-4);
            ctx.lineTo(toggleRect.x+ this.height-3, toggleRect.y+3);
            ctx.stroke()
        }

        //draw label
        const labelRect = this.getLabelRect();
        ctx.fillStyle = "#000"
        ctx.fillText(label, labelRect.left, labelRect.bottom); 
    }
    getToggleRect():Rect{
        const centeredStartPoint = this.getCenteredStartPoint();
        const toggleRect = new Rect({
            x:centeredStartPoint.x,
            y:centeredStartPoint.y,
            width:this.height,
            height:this.height
        });
        
        return toggleRect;

    }
    getLabelRect():Rect{
        const centeredStartPoint = this.getCenteredStartPoint();
        const labelRect = new Rect({
            x:centeredStartPoint.x + this.height*1.5,
            y:centeredStartPoint.y + (this.height/4),
            width:this.#cachedLabelWidth,
            height:this.#cachedLabelHeight
        });
        return labelRect;
    }
    static createWithDefaultParameters(){
        const checkmarkFigure = new CheckmarkFigure({
            "rect": new Rect({
                "x":0,
                "y":0,
                "width":150,
                "height":40
            }),
            label:"OK",
            isSelected:false
        });
        return checkmarkFigure;
    }
}

type CreateRadiobuttonParam = CreateToggleParam;

class RadiobuttonFigure extends LabeledToggleFigure {
    #cachedLabelHeight = 10;
    #cachedLabelWidth = 30;
    name = "RadiobuttonFigure";
    constructor(param:CreateRadiobuttonParam){
       super(param)
    }

    drawFigure(ctx:CanvasRenderingContext2D):void{
        const label      = this.getAttribute("label");
        const radioRadius = 5;
        const radioSelectionRadius = 3;

        //update metrics
        const labelMetrics = ctx.measureText(label);
        this.#cachedLabelHeight = labelMetrics.hangingBaseline - labelMetrics.ideographicBaseline;
        this.#cachedLabelWidth = labelMetrics.width;

        const toggleRect = this.getToggleRect();
        const radioCenter = toggleRect.getCenter();
        const radioCircle = new Path2D(); 
        radioCircle.arc(radioCenter.x, radioCenter.y, radioRadius, 0, 2 * Math.PI, false);

        const radioSelection = new Path2D(); 
        radioSelection.arc(radioCenter.x, radioCenter.y, radioSelectionRadius, 0, 2 * Math.PI, false);

        ctx.stroke(radioCircle);
        if(this.getAttribute("isSelected")){
            ctx.fill(radioSelection);
        }

        //draw label
        const labelRect = this.getLabelRect();
        ctx.fillStyle = "#000"
        ctx.fillText(label, labelRect.left, labelRect.bottom); 
    }
    getToggleRect():Rect{
        const centeredStartPoint = this.#centeredStartPoint();
        const toggleRect = new Rect({
            x:centeredStartPoint.x,
            y:centeredStartPoint.y,
            width:this.height,
            height:this.height
        });
        
        return toggleRect;

    }
    //The upper left corner point of a horizontally centered box of the height of this.#checkboxSize
    #centeredStartPoint():Point{
        const figureRect = this.getRect();
        const figureCenter = figureRect.getCenter();
        const centeredStartPoint = new Point({x:figureRect.x, y:figureCenter.y-(this.height/2) })
        
        return centeredStartPoint;
    }
    getLabelRect():Rect{
        const centeredStartPoint = this.#centeredStartPoint();
        const labelRect = new Rect({
            x:centeredStartPoint.x + this.height*1.5,
            y:centeredStartPoint.y + (this.#cachedLabelHeight/2),
            width:this.#cachedLabelWidth,
            height:this.#cachedLabelHeight
        });
        return labelRect;
    }
    static createWithDefaultParameters(){
        const radiobuttonFigure = new RadiobuttonFigure({
            "rect": new Rect({
                "x":0,
                "y":0,
                "width":150,
                "height":40
            }),
            label:"OK",
            isSelected:false
        });
        return radiobuttonFigure;
    }

}


//export {CheckboxFigure, CreateCheckboxParam}
export {LabeledToggleFigure, CreateToggleParam, CheckmarkFigure, CreateCheckmarkParam, RadiobuttonFigure, CreateRadiobuttonParam}