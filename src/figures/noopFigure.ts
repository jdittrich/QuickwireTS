import { Figure } from "./figure.js";
import { Rect } from "../data/rect.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";

class NoOpFigure extends Figure{
    constructor(){
        super({ //figure needs some data, so we make some.
            rect: new Rect({
                x:0,
                y:0,    
                width:0,
                height:0
            }),
            containedFigures:[]
        });
        this.name = "noOp";
    }
    //overwrite methods that do anything in base Figure
    drawFigure(ctx:CanvasRenderingContext2D):void{}
    drawHighlight(ctx: CanvasRenderingContext2D): void {}
    getHandles(drawingView: DrawingView): Handle[] {
        return []
    }
    

}

export {NoOpFigure}