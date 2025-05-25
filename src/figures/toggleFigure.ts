import { Figure, CreateFigureParam } from "./figure.js";
import { Rect } from "../data/rect.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import { createAllResizeHandles } from '../handles/resizeHandle.js';
import {EditTextHandle} from '../handles/editTextHandle.js';
import {DuplicationHandle} from '../handles/duplicationHandle.js';
import { DeleteFigureHandle } from "../handles/deleteFigureHandle.js";
import { ToggleAttributeHandle } from "../handles/toggleAttributeHandle.js";

type ToggleLook ="checkbox"|"radio"|"toggle"
type CreateToggleParam = CreateFigureParam & {
    label:String;
    isSelected:Boolean;
    toggleLook?:ToggleLook;
}

// class CheckboxFigure extends Figure{
//     name = "CheckboxFigure";
//     #labelRect = new Rect({x:0,y:0,width:1,height:1});
//     #checkboxRect = new Rect({x:0,y:0,width:1,height:1});
//     #checkboxSize = 16;
//     constructor(param:CreateCheckboxParam){
//         super(param);
//         this.registerAttributes({"label":String});
//         this.registerAttributes({"isSelected":Boolean})
//         this.setAttribute("label",param.label);
//         this.setAttribute("isSelected",param.isSelected);
//     };

//     setLabel(changedLabel:string){
//        this.setAttribute("label",changedLabel);
//     }
//     getLabel(){
//         const label = this.getAttribute("label");
//         return label;
//     }
//     #getCheckboxRect(){
//         const figureRect = this.getRect();
        
//         const checkboxRect = new Rect({
//             x     :figureRect.x,
//             y     :figureRect.y,
//             width :this.#checkboxSize,
//             height:this.#checkboxSize
//         });
//         return checkboxRect;
//     }
//     drawFigure(ctx:CanvasRenderingContext2D){
//         const checkboxRect = this.#getCheckboxRect();
//         const label = this.getAttribute("label");
        
//         const metrics = ctx.measureText(label);
//         const labelWidth = metrics.width;
//         const labelHeight = metrics.hangingBaseline-metrics.ideographicBaseline;
//         const labelXPos = checkboxRect.x + checkboxRect.width +5
//         const labelYPos = checkboxRect.y + 10;
//         this.#labelRect = new Rect({x:labelXPos, y: labelYPos, width: labelWidth, height:labelHeight});


//         //draw checkbox

//         ctx.strokeRect(checkboxRect.x,checkboxRect.y,this.#checkboxSize,this.#checkboxSize);

//         //optionally: draw checkmark
//         if(this.getAttribute("isSelected")){
//             ctx.beginPath();
//             ctx.moveTo(checkboxRect.x+4, checkboxRect.y+(this.#checkboxSize/2));
//             ctx.lineTo(checkboxRect.x+(this.#checkboxSize/2), checkboxRect.y+this.#checkboxSize-4);
//             ctx.lineTo(checkboxRect.x+this.#checkboxSize-3, checkboxRect.y+3);
//             ctx.stroke()
//         }

//         //draw label
//         ctx.fillStyle = "#000"
//         ctx.fillText(label, labelXPos, labelYPos);        
//     }

    
//     getHandles(drawingView:DrawingView):Handle[]{
//         const textEditHandle = new EditTextHandle(this,drawingView,{
//             attributeName:"label",
//             textRect: this.#labelRect
//         });
//         const toggleCheckboxHandle = new ToggleAttributeHandle(this,drawingView,this.#getCheckboxRect(),"isSelected");
//         const duplicationHandle = new DuplicationHandle(this,drawingView);
//         const deleteFigureHandle = new DeleteFigureHandle(this,drawingView)
//         const resizeHandles  = createAllResizeHandles(this, drawingView);
//         return [
//             duplicationHandle,
//             deleteFigureHandle,
//             textEditHandle,
//             toggleCheckboxHandle,
//             ...resizeHandles
//         ];
//     }
    


//     /**
//      * @see {Figure.toString}
//     */
//    toString(): string{
//         const {x,y,width,height} = this.getRect();
//         const containedFigures = this.getContainedFigures();
//         const label = this.getAttribute("label");
//         const type = this.constructor.name;
//         const buttonFigureString = `x:${x}, y:${y}, width:${width}, height:${height}, label:${label},number of contained figures:${containedFigures.length},type:${type}`;
//         return buttonFigureString;
//     }

//     copy(){
//         const baseParameters = this.copyBaseParameters();
//         const buttonFigureCopy = new CheckboxFigure({
//             ...baseParameters,
//             label:this.getAttribute("label"),
//             isSelected:this.getAttribute("isSelected")
//         });
//         return buttonFigureCopy;
//     }

//     /**
//      * Serializes figure to JSON
//      * @returns {object} as json
//      */
//     toJSON(): object{
//         const rectJson = this.getRect().toJSON();
//         const containedFigureJson = this.getJsonOfContainedFigures();

//         const buttonFigureJson =  {
//             "type":this.name,
//             "rect": rectJson,
//             "label": this.getAttribute("label"),
//             "isSelected": this.getAttribute("isSelected"),
//             "containedFigures":containedFigureJson,
//         }
//         return buttonFigureJson;
//     }

//     /**
//     * created a figure from a JSON
//     * @param {JSON} figureJson 
//     * @param {function} nameFigureClassMapper gets a string, returns the class 
//     */

//     static createWithDefaultParameters(){
//         const checkboxFigure = new CheckboxFigure({
//             "rect": new Rect({
//                 "x":0,
//                 "y":0,
//                 "width":150,
//                 "height":40
//             }),
//             label:"Checkbox Label",
//             isSelected:true
//         });
//         return checkboxFigure;
//     }
// }

class ToggleFigure extends Figure{
    #toggleFigureLook = null;
    toggleLook:ToggleLook
    constructor(param:CreateToggleParam){
        super(param);
        this.registerAttributes({"label":String});
        this.registerAttributes({"isSelected":Boolean})
        this.setAttribute("label",param.label);
        this.setAttribute("isSelected",param.isSelected);

        //choose drawing Strategy
        switch(param.toggleLook){
            case "checkbox":
                this.#toggleFigureLook = new ToogleCheckmarkLook(this)
                break;
            default:
                throw new Error("no drawing strategy was found")
        }        
        this.toggleLook = param.toggleLook;
    }
    setLabel(changedLabel:string){
       this.setAttribute("label",changedLabel);
    }
    getLabel(){
        const label = this.getAttribute("label");
        return label;
    }
    drawFigure(ctx:CanvasRenderingContext2D){
        this.#toggleFigureLook.drawFigure(ctx);
    }
    getHandles(drawingView:DrawingView):Handle[]{
        const textEditHandle = new EditTextHandle(this,drawingView,{
            attributeName:"label",
            textRect: this.#toggleFigureLook.getLabelRect()
        });
        const toggleCheckboxHandle = new ToggleAttributeHandle(this,drawingView,this.#toggleFigureLook.getToggleRect(),"isSelected");
        const duplicationHandle = new DuplicationHandle(this,drawingView);
        const deleteFigureHandle = new DeleteFigureHandle(this,drawingView)
        const resizeHandles  = createAllResizeHandles(this, drawingView);
        return [
            duplicationHandle,
            deleteFigureHandle,
            textEditHandle,
            toggleCheckboxHandle,
            ...resizeHandles
        ];
    }
    toString(): string{
        const {x,y,width,height} = this.getRect();
        const containedFigures = this.getContainedFigures();
        const label = this.getAttribute("label");
        const look  = this.toggleLook;
        const type = this.constructor.name;
        const buttonFigureString = `x:${x}, y:${y}, width:${width}, height:${height}, label:${label},number of contained figures:${containedFigures.length},type:${type}, look:${look}`;
        return buttonFigureString;
    }

    copy(){
        const baseParameters = this.copyBaseParameters();
        const buttonFigureCopy = new ToggleFigure({
            ...baseParameters,
            label:this.getAttribute("label"),
            isSelected:this.getAttribute("isSelected"),
            toggleLook: this.toggleLook
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

        const toggleFigureJson =  {
            "type":this.name,
            "rect": rectJson,
            "label": this.getAttribute("label"),
            "isSelected": this.getAttribute("isSelected"),
            "containedFigures":containedFigureJson,
            "toggleLook":this.toggleLook
        }
        return toggleFigureJson;
    }

    /**
    * created a figure from a JSON
    * @param {JSON} figureJson 
    * @param {function} nameFigureClassMapper gets a string, returns the class 
    */

    static createWithDefaultParameters(toggleLook:ToggleLook){
        const toggleFigure = new ToggleFigure({
            "rect": new Rect({
                "x":0,
                "y":0,
                "width":150,
                "height":40
            }),
            label:"Label",
            isSelected:true,
            toggleLook:toggleLook
        });
        return toggleFigure;
    }
}

/* drawing strategies for different looks.
should be able to draw (drawFigure)
and return the areas for the toggle and the lable
so that handles can be placed next to them or over them
*/
class ToogleCheckmarkLook {
    #figure:ToggleFigure;
    #checkboxSize=16;
    #cachedLableRect: Rect = new Rect({x:0,y:0,width:1,height:1}); 

    constructor(figure:ToggleFigure){
       this.#figure = figure;
    }

    drawFigure(ctx:CanvasRenderingContext2D):void{

        const label = this.#figure.getAttribute("label");
        const labelRect = this.#calculateLableRect(ctx);
        const toggleRect = this.getToggleRect();

        ctx.strokeRect(toggleRect.x,toggleRect.y,this.#checkboxSize,this.#checkboxSize);

        //optionally: draw checkmark
        if(this.#figure.getAttribute("isSelected")){
            ctx.beginPath();
            ctx.moveTo(toggleRect.x+4, toggleRect.y+(this.#checkboxSize/2));
            ctx.lineTo(toggleRect.x+(this.#checkboxSize/2), toggleRect.y+this.#checkboxSize-4);
            ctx.lineTo(toggleRect.x+ this.#checkboxSize-3, toggleRect.y+3);
            ctx.stroke()
        }

        //draw label
        ctx.fillStyle = "#000"
        ctx.fillText(label, labelRect.left, labelRect.bottom);    
    }
    getToggleRect():Rect{        
        const figureRect = this.#figure.getRect();
        const checkboxRect = new Rect({
            x     :figureRect.x,
            y     :figureRect.y,
            width :this.#checkboxSize,
            height:this.#checkboxSize
        });
        return checkboxRect;
    }
    #calculateLableRect(ctx):Rect{
        const label = this.#figure.getAttribute("label");
        const metrics = ctx.measureText(label);
        const labelWidth = metrics.width;
        const labelHeight = metrics.hangingBaseline-metrics.ideographicBaseline;
        const toggleRect = this.getToggleRect();
        const labelXPos = toggleRect.x + toggleRect.width +5
        const labelYPos = toggleRect.y + 10;
        this.#cachedLableRect = new Rect({x:labelXPos, y: labelYPos, width: labelWidth, height:labelHeight});
        return this.#cachedLableRect;
    }
    getLabelRect():Rect{
        return this.#cachedLableRect;
    }
}
//export {CheckboxFigure, CreateCheckboxParam}
export {ToggleFigure, CreateToggleParam}