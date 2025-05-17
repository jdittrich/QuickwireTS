import { Rect } from "../data/rect.js";
import { ChangeAttributeCommand } from "../commands/changeAttributeCommand.js";
import { Handle } from "./handle.js";
import { Figure } from "../figures/figure.js";
import { DrawingView } from "../drawingView.js";
import { LocalMouseEvent } from "../events.js";
import {RadioButtonListFigure} from "../figures/radioButtonListFigure.js";

class ToggleListItemHandle extends Handle{
    #listItemRect:Rect
    #listItemIndex: number
    drawingView: DrawingView;

    constructor(figure:Figure,drawingView:DrawingView,listItemRect:Rect,listItemindex:number){
        //always needs a figure (to be changed) and the drawingView (to access the command structure)
        super(figure,drawingView);
        this.#listItemIndex = listItemindex;
        this.#listItemRect = listItemRect;
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
        const screenRect = drawingView.documentToScreenRect(this.#listItemRect);
        return screenRect;  
    }
    onMousedown(mouseEvent:LocalMouseEvent){
        const figure = this.getFigure()
        const oldSingleSelectList = figure.getAttribute("radioButtons");
        const newSelectedIndex = this.#listItemIndex;
        const newSingleSelectList = oldSingleSelectList.copy({"selectedIndex":newSelectedIndex});
        
        const changeSelectedIndexCommand = new ChangeAttributeCommand(
            {
                figure:this.getFigure(),
                attribute:"radioButtons", 
                value:newSingleSelectList 
            },
            this.drawingView
        )

        this.getDrawingView().do(changeSelectedIndexCommand)
    }
}

/** 
 * @param   {ListFigure} listFigure
 * @param   {DrawingView} drawingView
 * @returns {ListEntryToggleHandle[]} 
 */
function createListItemToggleHandles(listFigure: RadioButtonListFigure, drawingView: DrawingView): ToggleListItemHandle[]{
    const listEntryRects = listFigure.getListEntryRects();
    const toggleHandles = listEntryRects.map((rect,index) => new ToggleListItemHandle(listFigure,drawingView,rect,index));
    return toggleHandles;
};

export {ToggleListItemHandle, createListItemToggleHandles}