import { DrawingView } from "../drawingView.js";
import { Command } from "./command.js";
import { Figure } from "../figures/figure.js";
import { CompositeFigure } from "../figures/compositeFigure.js";
import { Rect } from "../data/rect.js";

type CaptureFiguresCommandParam={
    figure:CompositeFigure;
    // capturePosition:Rect;
    /* 
    The rect could be derived from the figure, 
    but that would put a lot of logic in the do/undo instead of the constructor.
    It would work for the "do" aspect, but it would be less clear for the undo ()
    */


}

/**
 * This is not to be used alone, but as part of other commands 
 * To automatically contains figures that would be overlapped by the
 * newly changed (moved/resized) compositeFigure.
 */
class CaptureFiguresCommand extends Command{
    name = "CaptureFigures"
    #appendFigures:Figure[]
    #figure:CompositeFigure
    #drawingView:DrawingView
    #container: CompositeFigure
    constructor(param:CaptureFiguresCommandParam, drawingView:DrawingView){
        super();
        const {figure} = param;
        this.#figure = figure
        this.#drawingView = drawingView;

        // const figureRect = figure.getBoundingBox();
        // // find figures that are in the parent container of figure,
        // // but currently fully overlapped by figure.
        // const drawing = drawingView.drawing;
        // const enclosedFiguresInContainer = drawing.findEnclosedFigures(this.#container,figureRect)
        // this.#appendFigures = enclosedFiguresInContainer;
    }
    do(){
        this.#container = this.#figure.getContainer();
        const figureRect = this.#figure.getBoundingBox();
        // find figures that are in the parent container of figure,
        // but currently fully overlapped by figure.
        const drawing = this.#drawingView.drawing;
        const enclosedFiguresInContainer = drawing.findEnclosedFigures(this.#container,figureRect)
        this.#appendFigures = enclosedFiguresInContainer;
        this.#figure.appendFigures(this.#appendFigures);
    }
    undo(){
        this.#container.appendFigures(this.#appendFigures);
    }
    redo(){
        this.#figure.appendFigures(this.#appendFigures);
    }
}

export {CaptureFiguresCommand, CaptureFiguresCommandParam}