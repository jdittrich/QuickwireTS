
import { Rect, RectResize } from '../data/rect.js';
import {Figure} from '../figures/figure.js';
import {CompositeFigure} from '../figures/compositeFigure.js';
import {Command} from './command.js';
import { CaptureFiguresCommand } from './captureFiguresCommand.js';
import { DrawingView } from '../drawingView.js';


/**
 * resizes/moves trigger recalculations of contained figure’s rects
 * @param {Object} param
 * @param {Figure} param.figure
 * @param {Rect}   param.changedRect
 */

type CreateChangeFigureRectParam={
    figure:CompositeFigure;
    changedRect:Rect;
}

//Actually, change composite rect, I assume now. 2026.01.28
class ChangeFigureRectCommand extends Command{
    name = "changeFigureRect"
    #figure:CompositeFigure //figure which rect is change
    #fromContainer:CompositeFigure //container of the respective figure before the command is applies
    #toContainer: CompositeFigure //container of the respective figure after the command is applies
    #changedRect:Rect
    #oldRect:Rect
    #appendFigures:Figure[]
    //#figuresNotContainedAnymore:Figure[]

    constructor(param:CreateChangeFigureRectParam, drawingView:DrawingView){
        super();
        const {figure,changedRect} = param;

        //store non-derived data
        this.#figure = figure;
        this.#fromContainer = figure.getContainer();
        this.#oldRect = figure.getBoundingBox();
        this.#changedRect = changedRect;

        // const oldPosition = this.#oldRect.getPosition();
        // const newPosition = this.#changedRect.getPosition();
        // const positionChange = oldPosition.offsetTo(newPosition);

        //find new container and enclosed figures at new position/size of rectangle
        const drawing = drawingView.drawing;
        const changedRectInDrawing = drawing.isEnclosingRect(changedRect);
        if(!changedRectInDrawing){
            throw Error("changedRect out of drawing−s bounds, aborting command");
        }
        const figureEnclosingRect = drawing.findEnclosingCompositeFigure(changedRect);
        const rectEnclosesFigures = drawing.findEnclosedFigures(figureEnclosingRect,changedRect)

        this.#toContainer = figureEnclosingRect;
        this.#appendFigures = rectEnclosesFigures;
    }
    do(){
        //note: the order of operations is relevant!
        // this.#figure.changeRect(this.#changedRect); //moves also the currently contained figures
        // this.#figure.appendFigures(this.#appendFigures); //appends figures that are enclosed in the new Rectangle
        // this.#toContainer.appendFigure(this.#figure); //append figure to its new container.
        //this.#figure.
    }
    undo(){
        // this.#fromContainer.appendFigures(this.#appendFigures);
        // this.#figure.changeRect(this.#oldRect);
        // this.#fromContainer.appendFigure(this.#figure);
    }
    redo(){
        this.do();
    }
}

export {ChangeFigureRectCommand}