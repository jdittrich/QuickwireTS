import { RectConstraint } from "../../data/rectConstraint.js";
import { Rect } from "../../data/rect.js";
import { FigureElement } from "./figureElement.js";
import { Figure } from "../figure.js";
import { SingleSelectLabelList } from "../../data/singleSelectLabelList.js";
import { drawTextInRect, TextOptions, defaultTextOptions } from "../drawingFunctions/drawTextInRect.js";
import { DrawingView } from "../../drawingView.js";
import { Handle } from "../../handles/handle.js";
import { EditSelectableListHandle } from "../../handles/editTextHandle.js";

type CreateSingleSelectElementParam = {
    rectConstraint:RectConstraint;
    attributeName:string;
    labelText:SingleSelectLabelList;
}

class HorizontalTabsElement extends FigureElement{
    attributeName:string;
    rectConstraint:RectConstraint;
    labelRect: Rect;
    constructor(figure:Figure, param:CreateSingleSelectElementParam){
        super(figure)
        this.rectConstraint = param.rectConstraint;
        figure.registerAttributes({[param.attributeName]:SingleSelectLabelList})
        this.attributeName = param.attributeName;
        this.setFigureAttribute(param.attributeName,param.labelText);
        this.labelRect = new Rect({x:0,y:0,width:0,height:0});
    }
    getElementRect():Rect {
        const figureRect = this.getFigureRect();
        const ownRect = this.rectConstraint.deriveRect(figureRect);
        return ownRect;
    }
    getTabWidth(){
        const elementRect = this.getElementRect();
        const singleSelectLabels = this.getFigureAttribute(this.attributeName);
        const labelCount = singleSelectLabels.labels.length;
        const width =  elementRect.width/labelCount;
        return width;
    }
    draw(ctx:CanvasRenderingContext2D):void{
        const {labels, selectedIndex} = this.getFigureAttribute(this.attributeName);
        const elementRect = this.getElementRect();
        const tabWidth = this.getTabWidth();
        let leftmost = elementRect.x;
        labels.forEach((label,index)=>{
            const currentRect = new Rect({x:leftmost,y:elementRect.y,width:tabWidth,height:elementRect.height})
            const textOptions:TextOptions = {
                ...defaultTextOptions,
                horizontalAlign:"center"
                
            }
            drawTextInRect(ctx,label,currentRect,textOptions);
            ctx.beginPath()
            ctx.roundRect(...currentRect.toArray(), [10, 10, 0, 0]);
            ctx.stroke();
            if(index === selectedIndex){
                ctx.save()
                ctx.lineWidth = 10;
                ctx.beginPath()
                ctx.moveTo(currentRect.left, currentRect.bottom);
                ctx.lineTo(currentRect.right,currentRect.bottom);
                ctx.stroke();
                ctx.restore();
            }

            leftmost = currentRect.right;
        });
    }
    getHandles(drawingView: DrawingView): Handle[] {
        const parsableTextEditHandle = new EditSelectableListHandle(
            this.getFigure(),
            drawingView,
            {
                "attributeName":this.attributeName,
                "textRect": this.getElementRect()
            });
        return [parsableTextEditHandle];
    }
}

export {HorizontalTabsElement, CreateSingleSelectElementParam}