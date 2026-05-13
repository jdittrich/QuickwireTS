import { DrawingView } from "../drawingView.js";
import { Point } from "../data/point.js";
import { CompositeFigure } from "../figures/compositeFigure.js";
import { Figure } from "../figures/figure.js";
//import { PaintFigure, Strokes } from "../figures/paintFigure.js";
import { Command } from "./command.js";
import { Stroke, Strokes } from "../tools/paintTool.js";
import { RectFigure } from "../figures/rectFigure.js";

type PaintOnFigureCommandParam = {
    figure:Figure
    strokes:{startX:number,startY:number,endX:number,endY:number}[]
    color:string
    size:number
}

class PaintOnFigureCommand extends Command{
    name:"PaintOnFigureCommand"
    #figure:RectFigure
    #strokes:Strokes =[]
    #size:number
    #color:string
    #originalCanvas:OffscreenCanvas
    /**
     * @param {Object}          params
     * @param {Figure}          params.figureToDrawOn
     * @param {}
     */
    constructor(param:PaintOnFigureCommandParam,drawingView:DrawingView){
        super();
        this.#figure = param.figure as RectFigure;
        this.#strokes = param.strokes;
        this.#size = param.size;
    }
    do(){
        //this.#figure.setIsPainted(true);
        this.#originalCanvas = this.#figure.getCanvas();
        this.#strokes.forEach(stroke=>this.#figure.paintFromTo(
            new Point({x:stroke.startX,y:stroke.startY}),
            new Point({x:stroke.endX,y:stroke.endY}))
        );
    }
    undo(){
        this.#figure.setCanvas(this.#originalCanvas)
    }
    redo(){
        this.do();
    }
}

export {PaintOnFigureCommand}