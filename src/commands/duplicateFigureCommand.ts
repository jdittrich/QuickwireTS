import { Figure } from "../figures/figure.js";
import { Point } from "../data/point.js";
import { Rect } from "../data/rect.js";
import { DrawingView } from "../drawingView.js";

interface Command {
    do():void
}

interface Undoable {
    undo():void
    redo():void
}

type DuplicateFigureCommandParam = {
    figure:Figure; //figure that shall be duplicated
    newRect:Rect //where to copy the figure to
}
class DuplicateFigureCommand implements Command, Undoable{
    #toContainer        :Figure
    #appendFigures      :Figure[]
    #duplicateFigure    :Figure
    #duplicateFigureRect:Rect
    #drawingView:DrawingView = null;

    constructor(param:DuplicateFigureCommandParam,drawingView:DrawingView){
        const figureToDuplicate = param.figure;
        const duplicateFigureRect = param.newRect;
        const drawing = drawingView.drawing;

        //is the new rect on canvas? → if not, cancel, console.log
        const changedRectInDrawing = drawing.isEnclosingRect(duplicateFigureRect);
        if(!changedRectInDrawing){
            throw Error("changedRect out of drawing−s bounds, aborting command");
        }
        const figureEnclosingRect:Figure   = drawing.findFigureEnclosingRect(duplicateFigureRect);
        const rectEnclosesFigures:Figure[] = drawing.findEnclosedFigures(figureEnclosingRect,duplicateFigureRect)

        this.#drawingView = drawingView;
        this.#duplicateFigure = figureToDuplicate.copy();
        this.#duplicateFigureRect = duplicateFigureRect;
        this.#toContainer = figureEnclosingRect;
        this.#appendFigures= rectEnclosesFigures;
    }
    do(): void {
        this.#duplicateFigure.changeRect(this.#duplicateFigureRect);
        this.#toContainer.appendFigure(this.#duplicateFigure);
        this.#duplicateFigure.appendFigures(this.#appendFigures); 
        this.#drawingView.select(this.#duplicateFigure);
    }
    undo(): void {
        this.#drawingView.clearSelection(); 
        //reattach formerly contained figures
        this.#toContainer.appendFigures(this.#appendFigures)
        //detach figure
        this.#toContainer.detachFigure(this.#duplicateFigure);
    }
    redo(): void {
        this.do()
    }
}

export {DuplicateFigureCommand}
