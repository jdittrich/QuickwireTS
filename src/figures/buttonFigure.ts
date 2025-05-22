import { Figure, CreateFigureParam } from "./figure.js";
import { createAllResizeHandles } from '../handles/resizeHandle.js';
import {EditTextHandle} from '../handles/editTextHandle.js';
import { DeleteFigureHandle } from "../handles/deleteFigureHandle.js";
import { Rect } from "../data/rect.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";

type CreateButtonParam = CreateFigureParam & {
    label:String;
}  

class ButtonFigure extends Figure{
    name = "ButtonFigure";
    #buttonLabel = "";
    #labelRect = new Rect({x:0,y:0,width:1,height:1});

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

    drawFigure(ctx){
        const rect = this.getRect();
        const {width,height,x,y} = rect;
        const center = rect.getCenter();
        const label = this.getAttribute("label");
        ctx.strokeStyle = "#040";
        ctx.strokeRect(x,y,width,height);

        // place label in center, use text width and height to find place of center
        const metrics = ctx.measureText(label);
        const labelY = center.y + ((metrics.hangingBaseline-metrics.ideographicBaseline)/2);
        const labelX = center.x - (metrics.width/2);
        ctx.fillText(label, labelX, labelY);

        // store label rect
        const labelHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        this.#labelRect = new Rect({
            x:labelX,
            y:labelY,
            width:metrics.width,
            height:labelHeight
        });
        
    }

    
    getHandles(drawingView:DrawingView):Handle[]{
        const textEditHandle = new EditTextHandle(this,drawingView,{
            attributeName:"label",
            textRect: this.#labelRect
        });
        const deleteFigureHandle = new DeleteFigureHandle(this,drawingView)
        const resizeHandles  = createAllResizeHandles(this, drawingView);
        return [
            deleteFigureHandle,
            textEditHandle,
            ...resizeHandles
        ];
    }
    


    /**
     * @see {Figure.toString}
    */
   toString(): string{
        const {x,y,width,height} = this.getRect();
        const containedFigures = this.getContainedFigures();
        const label = this.getAttribute("label");
        const type = this.constructor.name;
        const buttonFigureString = `x:${x}, y:${y}, width:${width}, height:${height}, label:${label},number of contained figures:${containedFigures.length},type:${type}`;
        return buttonFigureString;
    }

    copy(){
        const baseParameters = this.copyBaseParameters();
        const buttonFigureCopy = new ButtonFigure({
            ...baseParameters,
            label:this.getAttribute("label")
        });
        return buttonFigureCopy;
    }

    /**
     * Serializes figure to JSON
     * @returns {object} as json
     */
    toJSON(): object{
        const rectJson = this.getRect().toJSON();
        const containedFigureJson = this.getJsonOfContainedFigures();

        const buttonFigureJson =  {
            "type":this.name,
            "rect": rectJson,
            "label": this.getAttribute("label"),
            "containedFigures":containedFigureJson,
        }
        return buttonFigureJson;
    }

    /**
    * created a figure from a JSON
    * @param {JSON} figureJson 
    * @param {function} nameFigureClassMapper gets a string, returns the class 
    */
//    static fromJSON(figureJson,nameFigureClassMapper){
//        const containedFigureObjects = super.createContainedFiguresFromJson(figureJson,nameFigureClassMapper);
//        const buttonFigure = new ButtonFigure({
//             "rect": Rect.fromJSON(figureJson.rect),
//             "label":            figureJson.label,
//             "containedFigures": containedFigureObjects
//         });
//         return buttonFigure;
//     }

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