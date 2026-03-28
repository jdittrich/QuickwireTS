
import { Rect, RectResize } from '../data/rect.js';
import {CompositeFigure} from '../figures/compositeFigure.js';
import {Command} from './command.js';
import { CaptureFiguresCommand } from './captureFiguresCommand.js';
import { DrawingView } from '../drawingView.js';
import { Figure } from '../figures/figure.js';

type CreateResizeFigureParam={
    figure:Figure;
    rectResize:RectResize;
}

type CreateResizeCompositeFigureParam={
    figure:CompositeFigure;
    rectResize:RectResize;
}

// class ResizeCompositeFigureCommand extends Command{
//     name = "resizeCompositeFigure"
//     #figure:CompositeFigure
//     #oldRect:Rect
//     #newRect:Rect
//     #resize:RectResize
//     #captureCommand:CaptureFiguresCommand
//     constructor(param:CreateResizeFigureParam, drawingView:DrawingView){
//         super();
//         const {figure,rectResize} = param;
//         this.#figure = figure
//         this.#resize = rectResize
//         this.#captureCommand = new CaptureFiguresCommand({figure:figure}, drawingView)
//     }
//     do(): void{
//         this.#oldRect = this.#figure.getRect();
//         const newRect = this.#oldRect.resizedCopy(this.#resize);
//         this.#newRect = newRect
//         this.#figure.changeRect(newRect);
//         this.#figure.generateConstraints();
//         this.#captureCommand.do();
//     }   
//     undo(): void {
//         this.#figure.changeRect(this.#oldRect);
//         this.#captureCommand.undo()
//     }
//     redo(): void {
//         this.do();
//     }
// }

class ResizeFigureCommand extends Command{
    protected figure:Figure
    protected resize:RectResize
    name = "ResizeFigureCommand"
    constructor(param:CreateResizeFigureParam, drawingView:DrawingView){
        super();
        const {figure,rectResize} = param;
        this.figure = figure
        this.resize = rectResize
    }
    do(){
        this.figure.resizeByRectResize(this.resize);
        this.figure.generateConstraints()
    }
    undo(){
        const inverseResize:RectResize = {
            top:this.resize.top*-1,
            right:this.resize.right*-1,
            bottom:this.resize.bottom*-1,
            left: this.resize.left*-1
        }
        this.figure.resizeByRectResize(inverseResize);
    }
    redo(){
        this.do();
    }   
}

class ResizeCompositeFigureCommand extends ResizeFigureCommand{
    protected captureCommand:CaptureFiguresCommand
    name = "ResizeCompositeFigureCommand"
    constructor(param:CreateResizeCompositeFigureParam, drawingView:DrawingView){
        super(param, drawingView);
        this.captureCommand = new CaptureFiguresCommand({figure:param.figure}, drawingView)
    }
    do(){
        super.do()
        this.captureCommand.do();
    }
    undo(){
        super.undo()
        this.captureCommand.undo()
    }
    redo(){
        super.redo();
        this.captureCommand.redo()
    }

}



export {ResizeCompositeFigureCommand, ResizeFigureCommand,CreateResizeFigureParam, CreateResizeCompositeFigureParam}