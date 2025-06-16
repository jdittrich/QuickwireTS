import { Command } from "./command.js";
import {Rect}      from "../data/rect.js";
import { Point } from "../data/point.js";
import { Figure } from "../figures/figure.js";
import { DrawingView } from "../drawingView.js";


type CreateFigureCommandParam ={ 
    newFigurePrototype: Readonly<Figure>; 
    cornerPoint1: Point; 
    cornerPoint2: Point; 
}

class CreateFigureCommand extends Command{
   

    #newFigure:Figure
    #newFigureRect:Rect
    #appendFigures:Figure[]
    #toContainer:Figure
    drawingView: DrawingView;
    
    constructor(params:CreateFigureCommandParam,drawingView:DrawingView){
        //needs drawing View for: Hit testing, figureClassMapper
        super()
        const {cornerPoint1, cornerPoint2, newFigurePrototype} = params; 
        
        this.drawingView = drawingView;

        const newFigureRect = Rect.createFromCornerPoints(cornerPoint1, cornerPoint2);
        
        const changedRectInDrawing = drawingView.drawing.isEnclosingRect(newFigureRect);
        if(!changedRectInDrawing){
            throw Error("changedRect out of drawing−s bounds, aborting command");
        }

        const rectEnclosedByFigure:Figure   = drawingView.drawing.findFigureEnclosingRect(newFigureRect);
        const rectEnclosesFigures:Figure[]  = drawingView.drawing.findEnclosedFigures(rectEnclosedByFigure,newFigureRect)


        //create figure
        //const nameFigureClassMapper = drawingView.getNameFigureClassMapper();
        const newFigure:Figure = newFigurePrototype.copy();
        this.#newFigureRect = newFigureRect;
        this.#newFigure = newFigure;
        this.#toContainer = rectEnclosedByFigure;
        this.#appendFigures= rectEnclosesFigures;
    }
    do(){
        console.log("appending figures:", this.#appendFigures);
        //this.#newFigure.setRect(this.#newFigureRect);
        this.#newFigure.changeRect(this.#newFigureRect);
        this.#toContainer.appendFigure(this.#newFigure);
        this.#newFigure.appendFigures(this.#appendFigures); 
        
        this.drawingView.select(this.#newFigure);
    }
    undo(){
        this.drawingView.clearSelection(); 
        //reattach formerly contained figures
        this.#toContainer.appendFigures(this.#appendFigures)
        
        //detach figure
        this.#toContainer.detachFigure(this.#newFigure);
        
    }
    redo(){
        this.do();
    }
}

export {CreateFigureCommand}