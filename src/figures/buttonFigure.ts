import { Figure, CreateFigureParam, FigureJson } from "./figure.js";
import { createAllResizeHandles } from '../handles/resizeHandle.js';
import {EditTextHandle} from '../handles/editTextHandle.js';
import {DuplicationHandle} from '../handles/duplicationHandle.js';
import { DeleteFigureHandle } from "../handles/deleteFigureHandle.js";
import { Rect } from "../data/rect.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";

type CreateButtonParam = CreateFigureParam & {
    label:String;
}

type ButtonFigureJson = FigureJson & {
    label:string;
}

class ButtonFigure extends Figure{
    name = "ButtonFigure";
    #cachedLabelLength:number
    #cachedLabelHeight: number
    constructor(param:CreateButtonParam){
        super(param);
        this.registerAttributes({"label":String});
        this.setAttribute("label",param.label);
    };

    setLabel(changedLabel:string){
       this.setAttribute("label",changedLabel);
    }
    getLabel(){
        const label = this.getAttribute("label");
        return label;
    }

    #getLabelRect():Rect{
        const rect = this.getRect();
        const center = rect.getCenter();
        const labelY = center.y - ((this.#cachedLabelHeight)/2);
        const labelX = center.x - (this.#cachedLabelLength/2);
        const labelRect = new Rect({
            x:labelX,
            y:labelY,
            width:this.#cachedLabelLength,
            height:this.#cachedLabelHeight
        });
        return labelRect;
    }
    drawFigure(ctx){
        const rect = this.getRect();
        const {width,height,x,y} = rect;
        const label = this.getAttribute("label");
        ctx.strokeStyle = "#040";
        ctx.strokeRect(x,y,width,height);

        // place label in center, use text width and height to find place of center
        const labelMetrics = ctx.measureText(label);
        this.#cachedLabelHeight = labelMetrics.hangingBaseline - labelMetrics.ideographicBaseline;
        this.#cachedLabelLength = labelMetrics.width;
        
        const labelRect = this.#getLabelRect();
        ctx.fillText(label, labelRect.x, labelRect.y+this.#cachedLabelHeight);
    }

    
    getHandles(drawingView:DrawingView):Handle[]{
        const basicHandles =  super.getHandles(drawingView);
        const textEditHandle = new EditTextHandle(this,drawingView,{
            attributeName:"label",
            textRect: this.#getLabelRect()
        });
        return [
            ...basicHandles,
            textEditHandle
        ];
    }
    
    /**
     * @see {Figure.toString}
    */
   toString(): string{
        const baseString = super.toString();
        const label = this.getAttribute("label");
        const buttonFigureString = baseString+`label:${label}`;
        return buttonFigureString;
    }
    getParameters(){
        const baseParameters = super.getParameters();
        const buttonFigureParameters = {
            ...baseParameters,
            label: this.getAttribute("label")
        }
        return buttonFigureParameters;
    }

    /**
     * Serializes figure to JSON
     * @returns {object} as json
     */
    toJSON(): ButtonFigureJson{
        const baseJson = super.toJSON();

        const buttonFigureJson =  {
            ...baseJson,
            "label": this.getAttribute("label"),
        }
        return buttonFigureJson;
    }

    static createWithDefaultParameters(){
        const buttonFigure = new ButtonFigure({
            "rect": new Rect({
                "x":0,
                "y":0,
                "width":150,
                "height":40
            }),
            label:"OK"
        });
        return buttonFigure;
    }
}

export {ButtonFigure, CreateButtonParam}