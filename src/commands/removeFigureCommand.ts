import { DrawingView } from "../drawingView.js";
import { Figure } from "../figures/figure.js";
import { Command } from "./command.js";

type RemoveFigureAndContainedCommandParam = {
    figureToDelete:Figure
}

class RemoveFigureAndContainedCommand extends Command{
    
    #figureToDelete:Figure
    #figureContainer:Figure
    #drawingView:DrawingView
    
    /**
     * @param {Object}          params
     * @param {Figure}          params.figureToDelete 
     */
    constructor(param:RemoveFigureAndContainedCommandParam,drawingView:DrawingView){
        super();
        this.#drawingView = drawingView;
        this.#figureToDelete  = param.figureToDelete;
        this.#figureContainer = this.#figureToDelete.getContainer();
    }
    do(){
        this.#figureContainer.detachFigure(this.#figureToDelete);
        this.#drawingView.clearSelection();
    }
    undo(){
        this.#figureContainer.appendFigure(this.#figureToDelete); 
        this.#drawingView.select(this.#figureToDelete);       
    }
    redo(){
        this.do();
    }
}

export {RemoveFigureAndContainedCommand as RemoveFigureAndContainedCommand}