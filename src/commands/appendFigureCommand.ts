import { Command } from "./command.js";

import { Figure } from "../figures/figure.js";
import { CompositeFigure } from "../figures/compositeFigure.js";
import { DrawingView } from "../drawingView.js";

type AppendFigureCommandParam ={ 
    figure:Figure
    appendTo:CompositeFigure
}

class AppendFigureCommand extends Command{
    name = "AppendFigure"
    #figureToAppend:Figure
    #toContainer:CompositeFigure;
    #fromContainer:CompositeFigure

    constructor(param:AppendFigureCommandParam,drawingView:DrawingView){
        super();
        const figure = param.figure;
        const toContainer   = param.appendTo;
        const fromContainer = figure.getContainer();

        this.#toContainer = toContainer;
        this.#fromContainer = fromContainer;
        this.#figureToAppend = figure;
    }
    do(): void {
        this.#toContainer.appendFigure(this.#figureToAppend);
    }
    undo(): void {
        if(this.#fromContainer){
            this.#fromContainer.appendFigure(this.#figureToAppend);
        } else {
            this.#toContainer.detachFigure(this.#figureToAppend);
        }
    }
    redo(): void {
        this.do();
    }
}

export {AppendFigureCommand, AppendFigureCommandParam}