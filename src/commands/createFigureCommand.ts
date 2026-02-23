import { Command } from "./command.js";
import {Rect}      from "../data/rect.js";
import { Point } from "../data/point.js";
import { Figure } from "../figures/figure.js";
import { DrawingView } from "../drawingView.js";
import { CompositeFigure } from "../figures/compositeFigure.js";
import { CaptureFiguresCommand, CaptureFiguresCommandParam} from "./captureFiguresCommand.js"
import { NullCommand } from "./nullCommand.js";
import { AppendFigureCommand} from "./appendFigureCommand.js"

type CreateFigureCommandParam ={ 
    newFigurePrototype: Readonly<Figure>; 
    cornerPoint1: Point; 
    cornerPoint2: Point; 
}

//use like: 

class CreateFigureCommand extends Command{
    name="CreateFigure"
    //#drawingView:DrawingView
    //#newFigureRect:Rect
    #newFigure:Figure
    #appendTo:CompositeFigure
    //#appendFigureCommand:AppendFigureCommand
    #captureFiguresCommand:CaptureFiguresCommand | NullCommand
    constructor(param:CreateFigureCommandParam,drawingView:DrawingView){
        super()
        const {cornerPoint1, cornerPoint2, newFigurePrototype} = param; 
        //this.#drawingView = drawingView;
        
        // const changedRectInDrawing = drawingView.drawing.isEnclosingRect(newFigureRect);
        // if(!changedRectInDrawing){
        //     throw Error("changedRect out of drawing’s bounds, aborting command");
        // }

        const newFigure:Figure = newFigurePrototype.copy();
        this.#newFigure = newFigure;
        newFigure.resizeByPoints(cornerPoint1, cornerPoint2)
        const newFigureBoundingBox = newFigure.getBoundingBox();
        
        const appendTo = drawingView.drawing.findEnclosingCompositeFigure(newFigureBoundingBox);
        this.#appendTo = appendTo;
        // this.#appendFigureCommand = new AppendFigureCommand({figure:newFigure, appendTo:appendTo},drawingView)
        if(this.#newFigure instanceof CompositeFigure){
            this.#captureFiguresCommand = new CaptureFiguresCommand({figure:newFigure as CompositeFigure},drawingView);
        } else {
            this.#captureFiguresCommand = new NullCommand()
        }
        
    }
    do():void{ 
        //this.#appendFigureCommand.do()
        this.#appendTo.appendFigure(this.#newFigure);
        this.#captureFiguresCommand.do()
    }
    undo(): void {
        //this.#appendFigureCommand.undo();
        this.#captureFiguresCommand.undo()
        this.#appendTo.detachFigure(this.#newFigure);
        
    }
    redo(): void {
        this.do()
    }
}



// Probably needs a "Create composite figure subclass?". Or have the figure take on own responsibility? 
// But that would not gel well with command patterns
// class CreateFigureCommand extends Command{

//     #newFigure:Figure
//     #newFigureRect:Rect
//     #appendFigures:Figure[]
//     #toContainer:CompositeFigure
//     drawingView: DrawingView;
    
//     constructor(params:CreateFigureCommandParam,drawingView:DrawingView){
//         super()
//         const {cornerPoint1, cornerPoint2, newFigurePrototype} = params; 
        
//         this.drawingView = drawingView;

//         const newFigureRect = Rect.createFromCornerPoints(cornerPoint1, cornerPoint2);
        
//         const changedRectInDrawing = drawingView.drawing.isEnclosingRect(newFigureRect);

//         if(!changedRectInDrawing){
//             throw Error("changedRect out of drawing’s bounds, aborting command");
//         }

//         const rectEnclosedByFigure:CompositeFigure   = drawingView.drawing.findEnclosingCompositeFigure(newFigureRect);
//         const  :Figure[]  = drawingView.drawing.findEnclosedFigures(rectEnclosedByFigure,newFigureRect)


//         //create figure
//         const newFigure:Figure = newFigurePrototype.copy();
//         this.#newFigureRect = newFigureRect;
//         this.#newFigure = newFigure;
//         this.#toContainer = rectEnclosedByFigure;
//         this.#appendFigures= rectEnclosesFigures;
//     }
//     do(){
//         console.log("appending figures:", this.#appendFigures);
//         //this.#newFigure.setRect(this.#newFigureRect);
//         this.#newFigure.changeRect(this.#newFigureRect);
//         this.#toContainer.appendFigure(this.#newFigure);
//         if(this.#newFigure instanceof CompositeFigure){
//             this.#newFigure.appendFigures(this.#appendFigures);
//         }
//         this.drawingView.select(this.#newFigure);
//     }
//     undo(){
//         this.drawingView.clearSelection(); 
//         //reattach formerly contained figures
//         if(this.#newFigure instanceof CompositeFigure){
//             this.#toContainer.appendFigures(this.#appendFigures)
//         }
//         //detach figure
//         this.#toContainer.detachFigure(this.#newFigure);
        
//     }
//     redo(){
//         this.do();
//     }
// }

export {CreateFigureCommand}