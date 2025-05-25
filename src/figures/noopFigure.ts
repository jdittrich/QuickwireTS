import { Figure } from "./figure.js";
import { Rect } from "../data/rect.js";

class NoOpFigure extends Figure{
    constructor(){
        super({ //figure needs some data, so we make some.
            rect: new Rect({
                x:0,
                y:0,    
                width:1,
                height:1
            }),
            containedFigures:[]
        });
        this.name = "noOp";
    }
    //overwrite methods that do anything in base Figure
    drawFigure(ctx:CanvasRenderingContext2D):void{}
    drawHighlight(ctx: CanvasRenderingContext2D): void {}
}

export {NoOpFigure}