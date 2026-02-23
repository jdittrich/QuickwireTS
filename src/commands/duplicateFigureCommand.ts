import { Figure } from "../figures/figure.js";
import { Point } from "../data/point.js";
import { Rect } from "../data/rect.js";
import { DrawingView } from "../drawingView.js";
import { CompositeFigure } from "../figures/compositeFigure.js";

interface Command {
    do():void
}

interface Undoable {
    undo():void
    redo():void
}

type DuplicateFigureCommandParam = {
    figure:Figure; //figure that shall be duplicated
    moveFigureBy:Point
}
class DuplicateFigureCommand implements Command, Undoable{
    name = "DuplicateFigure"
    #toContainer        :CompositeFigure
    //#appendFigures      :Figure[]
    #duplicateFigure    :Figure
    #moveDuplicateFigureBy:Point
    #drawingView:DrawingView = null;

    constructor(param:DuplicateFigureCommandParam,drawingView:DrawingView){
        const figureToDuplicate = param.figure;
        const moveDuplicateFigureBy = param.moveFigureBy;
        
        const drawing = drawingView.drawing;

        const movedFigureBoundingBox = figureToDuplicate.getBoundingBox().movedCopy(moveDuplicateFigureBy)

        const changedRectInDrawing = drawing.isEnclosingRect(movedFigureBoundingBox);

        if(!changedRectInDrawing){
            throw Error("changedRect out of drawing−s bounds, aborting command");
        }
        const figureEnclosingRect   = drawing.findEnclosingCompositeFigure(movedFigureBoundingBox);

        this.#drawingView = drawingView;
        this.#duplicateFigure = figureToDuplicate.copy();
        this.#toContainer = figureEnclosingRect;
        this.#moveDuplicateFigureBy = moveDuplicateFigureBy;

        // const figureToDuplicate = param.figure;
        // const duplicateFigureRect = param.newRect;
        // const drawing = drawingView.drawing;

        // //is the new rect on canvas? → if not, cancel, console.log
        // const changedRectInDrawing = drawing.isEnclosingRect(duplicateFigureRect);
        // if(!changedRectInDrawing){
        //     throw Error("changedRect out of drawing−s bounds, aborting command");
        // }
        // const figureEnclosingRect   = drawing.findEnclosingCompositeFigure(duplicateFigureRect);
        // const rectEnclosesFigures = drawing.findEnclosedFigures(figureEnclosingRect,duplicateFigureRect)

        // this.#drawingView = drawingView;
        // this.#duplicateFigure = figureToDuplicate.copy();
        // //this.#duplicateFigureRect = duplicateFigureRect;
        // this.#toContainer = figureEnclosingRect;
        // this.#appendFigures= rectEnclosesFigures;
    }
    do(): void {
        this.#duplicateFigure.moveBy(this.#moveDuplicateFigureBy);
        this.#toContainer.appendFigure(this.#duplicateFigure);
        this.#drawingView.select(this.#duplicateFigure);

        // this.#duplicateFigure.changeRect(this.#duplicateFigureRect);
        // this.#toContainer.appendFigure(this.#duplicateFigure);
        // this.#duplicateFigure.appendFigures(this.#appendFigures); 
        // this.#drawingView.select(this.#duplicateFigure);
    }
    undo(): void {
        this.#drawingView.clearSelection(); 
        this.#toContainer.detachFigure(this.#duplicateFigure);

        // this.#drawingView.clearSelection(); 
        // //reattach formerly contained figures
        // if(this.#duplicateFigure instanceof CompositeFigure){
        //     this.#toContainer.appendFigures(this.#appendFigures)
        // }
        // //detach figure
        // this.#toContainer.detachFigure(this.#duplicateFigure);
    }
    redo(): void {
        this.do()
    }
}

//DOES NOT EXTEND DuplicateFigureCommand SINCE COMPOSITION OVER INHERITANCE
class DuplicateCompositeFigureCommand  {
    

}

export {DuplicateFigureCommand}
