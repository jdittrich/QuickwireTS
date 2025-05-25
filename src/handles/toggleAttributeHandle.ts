import { Rect } from "../data/rect.js";
import { ChangeAttributeCommand } from "../commands/changeAttributeCommand.js";
import { Handle } from "./handle.js";
import { Figure } from "../figures/figure.js";
import { DrawingView } from "../drawingView.js";
import { LocalMouseEvent } from "../events.js";
import {RadioButtonListFigure} from "../figures/radioButtonListFigure.js";

class ToggleAttributeHandle extends Handle{
    drawingView: DrawingView;
    #toogleRect:Rect;
    #attributeName:string;
    

    constructor(figure:Figure,drawingView:DrawingView,toggleRect:Rect,attributeName:string){
        super(figure,drawingView);
        this.#toogleRect = toggleRect;
        this.#attributeName = attributeName;
        this
       
    }
    draw(ctx:CanvasRenderingContext2D):void{         
        const {x,y,width,height} = this.getScreenRect();
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "green";
        ctx.strokeRect(x,y,width,height);
        ctx.restore();
    }
    getScreenRect(){
        const drawingView = this.getDrawingView();
        const screenRect = drawingView.documentToScreenRect(this.#toogleRect);
        return screenRect;  
    }
    onMousedown(mouseEvent:LocalMouseEvent){
        const figure = this.getFigure()        
        const oldValue = this.getFigure().getAttribute(this.#attributeName);
        const newValue = !oldValue;
        const toogleAttributeValueCommand = new ChangeAttributeCommand(
            {
                figure:this.getFigure(),
                attribute:this.#attributeName, 
                value:newValue
            },
            this.drawingView
        )

        this.getDrawingView().do(toogleAttributeValueCommand)
    }
    getInteractions(){
        return { 
            cursor: "pointer",
            helpText: "toggle attribute",
            draggable: false, 
            clickable: true 
        };
    }
}


export {ToggleAttributeHandle}