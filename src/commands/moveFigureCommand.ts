
import { Rect } from '../data/rect.js';
import {Figure} from '../figures/figure.js';
import {CompositeFigure} from '../figures/compositeFigure.js';
import {Command} from './command.js';
import { DrawingView } from '../drawingView.js';
import { Point } from '../data/point.js';
import { CaptureFiguresCommand } from './captureFiguresCommand.js';
import { NullCommand } from './nullCommand.js';

/**
 * resizes/moves trigger recalculations of contained figure’s rects
 * @param {Object} param
 * @param {Figure} param.figure
 * @param {Rect}   param.changedRect
 */


type CreateMoveFigureParam={
    figure:Figure;
    moveBy:Point;
}


class MoveFigureCommand extends Command{
    name= "MoveFigureCommand"
    #figure:Figure
    #movement:Point
    #captureCommand: NullCommand | CaptureFiguresCommand
    #fromContainer:CompositeFigure
    #toContainer:CompositeFigure
    constructor(params:CreateMoveFigureParam, drawingView:DrawingView){
        super();
        const {figure, moveBy} = params
        this.#figure = figure;
        this.#movement = moveBy;
        this.#fromContainer = figure.getContainer();

        //find new container
        const drawing = drawingView.drawing;
        const originalBoundingBox = figure.getBoundingBox();
        const changedBoundingBox  = originalBoundingBox.movedCopy(moveBy);
        const figureEnclosingRect = drawing.findEnclosingCompositeFigure(changedBoundingBox);
        
        if(!figureEnclosingRect){
            console.log("changed figure would be out of bounds, aborting command");
        }
            
        this.#toContainer = figureEnclosingRect;
        
        //setup capture, if composite figure is moved
        if(figure instanceof CompositeFigure){
            this.#captureCommand = new CaptureFiguresCommand({figure:figure}, drawingView)
        } else {
            this.#captureCommand = new NullCommand();
        }
    }
    do(){
        const movement = this.#movement;
        this.#figure.moveBy(movement);
        this.#toContainer.appendFigure(this.#figure);
        this.#captureCommand.do()
    }
    undo(){
        this.#captureCommand.undo();
        this.#fromContainer.appendFigure(this.#figure);
        const inverseMovement = this.#movement.inverse()
        this.#figure.moveBy(inverseMovement);
    }
    redo(){
        this.do();
    }
}

export {MoveFigureCommand}