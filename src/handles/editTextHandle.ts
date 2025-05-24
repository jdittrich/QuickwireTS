// WIP: A handle to edit text on click
// handle is created with a reference to the attribute name of the text 
// click requests a text editor at a certain position on document from drawing view (calculates screen position), 
// which requests from app. 
// on finishing the editing, it hands over the new text to drawingView which hands to handle
// handle triggers a changeParameter command 

import {ChangeAttributeCommand} from "../commands/changeAttributeCommand.js";
import {Handle} from "./handle.js";
import {Rect} from "../data/rect.js";
import {Point} from "../data/point.js";
import { Figure } from "../figures/figure.js";
import { DrawingView } from "../drawingView.js";
import { LocalMouseEvent } from "../events.js";

type EditTextHandleParam = {
    attributeName:string;
    textRect:Rect
}

class EditTextHandle extends Handle {
    #attributeName:string
    #textRect:Rect
    #size = 16;
    constructor(figure:Figure, drawingView:DrawingView,param: EditTextHandleParam){
        super(figure, drawingView);
        this.#attributeName = param.attributeName;
        this.#textRect = param.textRect;
    }

    draw(ctx: CanvasRenderingContext2D){ 
        const {x,y,width,height} = this.getScreenRect();
        ctx.fillStyle = "#c3e7ee";
        ctx.fillRect(x,y,width,height);
        ctx.strokeStyle = "#9bbac0";
        ctx.strokeRect(x,y,width,height);

        ctx.strokeStyle = "#000";
        const xCenter = x+ (this.#size /2);
        const cursorWidth = 2
        const cursorHeight = 8
        const topPos = y+((this.#size-cursorHeight)/2);
        const bottomPos = topPos + cursorHeight;
        //draw a little cursor
        
        ctx.beginPath(); // Start a new path
        ctx.moveTo(xCenter-2,           topPos); 
        ctx.lineTo(xCenter+cursorWidth, topPos);   //‾
        ctx.stroke();

        ctx.beginPath()
        ctx.moveTo(xCenter,    topPos); 
        ctx.lineTo(xCenter,    bottomPos); // | 
        ctx.stroke();
        
        ctx.beginPath(); // Start a new path
        ctx.moveTo(xCenter-2,  bottomPos);
        ctx.lineTo(xCenter+cursorWidth, bottomPos);; //_
        ctx.stroke();
    }

    /**
     * @returns {Rect} the coordinates of the handle on screen
     */
    getScreenRect(): Rect{
        const textRect = this.#textRect;
        const drawingView = this.getDrawingView();
        const {topRight} = textRect.getCorners();
        const drawAnchor = topRight.add(new Point({x:2, y:0}));        
        const drawAnchorScreen = drawingView.documentToScreenPosition(drawAnchor);
        const screenRect = Rect.createFromCornerPoints(
            drawAnchorScreen,
            new Point({
                x: drawAnchorScreen.x + this.#size,
                y: drawAnchorScreen.y - this.#size
            })
        );
        return screenRect;
    }

    onMousedown(mouseEvent: LocalMouseEvent){
        const drawingView = this.getDrawingView();
        const figure      = this.getFigure();
        const currentText = figure.getAttribute(this.#attributeName);
        let newText = ""
        try{
            newText = drawingView.requestEditorText("Edit label",currentText);
        } catch {
            return;
        }
        const changeTextCommand = new ChangeAttributeCommand(
            {   
                figure:figure,
                attribute: this.#attributeName,
                value: newText
            },
            drawingView
        )
        drawingView.do(changeTextCommand);
    }
    getInteractions(){
        return { 
            cursor: "pointer;",
            helpText: "edit text",
            draggable: false, 
            clickable: true 
        };
    }
}

export {EditTextHandle}