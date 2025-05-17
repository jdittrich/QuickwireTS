// TODO: 19.11.24 
// maybe make this a changeFigureRect that works for resize and drag? 
// it would be cool to still be able to create a simplified move command by just
// passing a drag vector.  I could have a MoveFigureCommand that I can new, which just wraps a 
// changeRectCommand by returning the new command object from the constructor, see
// https://javascript.info/constructor-new#return-from-constructors (this works for objects, not primitives, e.g. "string", 1234…)
// so I could have a:
// class MoveFigureCommand
// class resizeFigureCommand
// both just return a custom changeRectFigureCommand
// but they all can be used with new ()… (instead of relying on a helper function that can't be new-ed)

import { Point } from '../data/point.js';
import { Rect } from '../data/rect.js';
import {Figure} from '../figures/figure.js';
import {Command} from './command.js';
import {findInnermostEnclosingFigure,findInnerMatches} from "../hitTest.js";
import {RectConstraint} from "../data/rectConstraint.js";
import { DrawingView } from '../drawingView.js';


// type MoveFigureCommandParam = {
//     moveBy:Point;
//     figure:Figure;
// }

// class MoveFigureCommand{ //can be phased out when constraints work.
//     /**
//      * WIP
//      * This is a facade to ChangeFigureRectCommand which can be called with new
//      * @param {Object} moveFigureParam
//      * @param {Point} moveFigureParam.moveBy 
//      * @param {Figure} moveFigureParam.figure 
//      * @returns {ChangeFigureRectCommand}
//      */
//     constructor(moveFigureParam:MoveFigureCommandParam, drawingView:DrawingView){
//         const {figure,moveBy} = moveFigureParam;
//         const oldRect = figure.getRect();
//         const changedRect = oldRect.movedCopy(moveBy);

//         const changeRectParam = {
//             "changedRect":changedRect,
//             "figure":figure
//         }
        
//         const changeFigureRectCommand = new ChangeFigureRectCommand(changeRectParam,drawingView);
//         return changeFigureRectCommand; //this enable the calling with new!
//     }
// }

/**
 * Moves a figure to a new place. 
 * Can catch figures that it encloses.
 * Is caught by figures enclosing it.
 * moves are triggered by dragging the figure
 * moves do NOT trigger constraint use.
 * 
 */
// class NewMoveFigureCommand extends Command{
//     #figure
    
//     #moveBy
//     #moveByInverse

//     #oldConstraint
//     #newConstraint

//     #oldContainer
//     #newContainer

//     #newContained

//     #oldRect
//     #newRect 


//     /*
//     * @param {Object} moveFigureParam
//     * @param {Point} moveFigureParam.moveBy 
//     * @param {Figure} moveFigureParam.figure 
//     */
//     constructor(param, drawingView){
//         super();
//         const {figure,moveBy} = param;
        
//         this.#moveBy        = moveBy;
//         this.#oldRect = figure.getRect();
//         this.#newRect = this.#oldRect.movedCopy(moveBy);


//         //containers:
//         this.#oldContainer = figure.getContainer();
//         const rectEnclosedByFigure = findInnermostEnclosingFigure(drawingView.drawing,this.#newRect);
//         if(!rectEnclosedByFigure){
//             throw new Error("Figure at new position would not be enclosed by any other figure, which usually means it was dropped outside of the document");
//         }
//         this.#newContainer = rectEnclosedByFigure;

//         //caught figures
//         const rectEnclosesFigures = findInnerMatches(rectEnclosedByFigure,this.#newRect);
//         this.#newContained = rectEnclosesFigures;

//         // constraints
//         this.#oldConstraint = figure.getConstraint();
//         const calculatedParameters = this.#oldConstraint.getNamesOfCalculatedParameters();
        
//         this.#newConstraint = RectConstraint.fromRects(
//             this.#newContainer.getRect(),
//             this.#newRect, 
//             calculatedParameters.vertical,
//             calculatedParameters.horizontal
//         )

//     }
//     do(){
//         this.#figure.setConstraint(this.#newConstraint);
//         this.#figure.updateRectFromConstraint();

//         this.#newContained.forEach(figureToAppend=>{
//             const appendRect = figureToAppend.getRect()
//             const calculatedParameters =  figureToAppend.getConstraint();
//             const figureRect = this.#figure.getRect();
//             const updatedConstraint = RectConstraint.fromRects(
//                 figureRect, 
//                 appendRect,
//                 calculatedParameters.vertical,
//                 calculatedParameters.horizontal
//             )
//             figureToAppend.setConstraint(updatedConstraint);
//         });
//         this.#figure.appendFigures(this.#newContained); //appends figures that are enclosed in the new Rectangle
//         this.#newContainer.appendFigure(this.#figure);  //append figure to its new container.
//     }
//     undo(){
//         // old parent
//         // new parent
//         // old pos
//     }
//     redo(){

//     }
// }

/**
 * Resizes figure
 * resizes don't catch figures
 * resizes are triggered by dragging resized handles
 * resizes trigger recalculations of contained figure’s rects
 * @param {Object} param
 * @param {Figure} param.figure
 * @param {Rect}   param.changedRect
 */
// class NewResizeFigureCommand extends Command{
//     #figure
//     constructor(){

//     }
//     do(){

//     }
//     undo(){

//     }
//     redo(){

//     }
// }

type CreateChangeFigureRectParam={
    figure:Figure;
    changedRect:Rect;
}

class ChangeFigureRectCommand extends Command{
    #figure:Figure
    #fromContainer:Figure
    #toContainer:Figure
    #changedRect:Rect
    #oldRect:Rect
    #appendFigures:Figure[]
    #figuresNotContainedAnymore:Figure[]

    constructor(param:CreateChangeFigureRectParam, drawingView:DrawingView){
        super();
        const {figure,changedRect} = param;

        //store non-derived data
        this.#figure = figure;
        this.#fromContainer = figure.getContainer();
        this.#oldRect = figure.getRect();
        this.#changedRect = changedRect;

        const oldPosition = this.#oldRect.getPosition();
        const newPosition = this.#changedRect.getPosition();
        const positionChange = oldPosition.offsetTo(newPosition);

        //find new container and enclosed figures at new position/size of rectangle
        const drawing = drawingView.drawing;
        const changedRectInDrawing = drawing.isEnclosingRect(changedRect);
        if(!changedRectInDrawing){
            throw Error("changedRect out of drawing−s bounds, aborting command");
        }
        const figureEnclosingRect = drawing.findFigureEnclosingRect(changedRect);
        const rectEnclosesFigures = drawing.findEnclosedFigures(figureEnclosingRect,changedRect)
    
        // find out which contained figures are not contained anymore after the change 
        // (e.g. after making the rect much smaller)
        // these need to be appended to the figures enclosing figure ("parent"), ie. #toContainer
        // const currentlyContainedFigures = figure.getContainedFigures(); 
        // const figuresNotContainedAnymore = currentlyContainedFigures.filter((containedFigure)=>{
        //     const containedFigureRect = containedFigure.getRect();
        //     const containedFigureRectAfterMove = containedFigureRect.movedCopy(positionChange);
            
        //     // with the rect of the parent changing and the contained figures moved along, 
        //     // are the child figures still inside the rect?
        //     const  isContained = this.#changedRect.isEnclosingRect(containedFigureRectAfterMove)
        //     const  isNotContained = !isContained;
        //     return isNotContained;
        // })

        // this.#figuresNotContainedAnymore = figuresNotContainedAnymore;
        this.#toContainer = figureEnclosingRect;
        this.#appendFigures = rectEnclosesFigures;
    }
    do(){
        //note: the order of operations is relevant!
        this.#figure.changeRect(this.#changedRect); //moves also the currently contained figures
        this.#figure.appendFigures(this.#appendFigures); //appends figures that are enclosed in the new Rectangle
        //this.#toContainer.appendFigures(this.#figuresNotContainedAnymore); //if new rectangle is smaller, some figures might not be enclosed anymore
        this.#toContainer.appendFigure(this.#figure); //append figure to its new container.
    }
    undo(){        
        this.#fromContainer.appendFigures(this.#appendFigures);
        this.#figure.changeRect(this.#oldRect);
        //this.#figure.appendFigures(this.#figuresNotContainedAnymore); //reappend figures that are included again in the changed rect
        this.#fromContainer.appendFigure(this.#figure);
    }
    redo(){
        this.do();
    }
}

export {ChangeFigureRectCommand}