import { AbstractTool } from "./abstractTool.js";
import { CreateFigureCommand } from "../commands/createFigureCommand.js";
import { SelectionTool } from "./selectionTool.js";
import {Figure} from '../figures/figure.js';
import { Point } from "../data/point.js";
import { Rect } from "../data/rect.js";
import { LocalDragEvent, LocalMouseEvent } from "../events.js";

//Adds an element to the drawing
class CreateFigureTool extends AbstractTool{
    #figureToCreate:Readonly<Figure>;
    name:string = "";

    constructor(figureToCreate: Figure){
        super();
        this.name = "createFigure"+"_"+figureToCreate.name;
        const frozenFigure = Object.freeze(figureToCreate); //so we don't accidentally mess with the figure. 
        this.#figureToCreate = frozenFigure;
    }

    onDragstart(event: LocalDragEvent){
        event.drawingView.startPreviewOf(this.#figureToCreate as Figure);
    }

    onDrag(event: LocalDragEvent){ 
        const currentMousePoint = event.getDocumentPosition(); 
        const documentMouseDownPoint = event.getMousedownDocumentPosition();
        const previewedFigure = event.drawingView.getPreviewedFigure();
        previewedFigure.setRectByPoints(documentMouseDownPoint,currentMousePoint);
        event.drawingView.updateDrawing();
    }

    onDragend(event: LocalDragEvent){
        const drawingView = this.getDrawingView();
        const documentMousePoint = event.getDocumentPosition(); 
        const documentMouseDownPoint = event.getMousedownDocumentPosition();
        const newFigureRect = Rect.createFromCornerPoints(documentMousePoint,documentMouseDownPoint);
        const newFigureInBounds = drawingView.drawing.isEnclosingRect(newFigureRect);
        
        if(!newFigureInBounds){
            console.log("new Figure would be out of bounds, aborting command")
            return;
        }
        const createFigureCommand = new CreateFigureCommand(
            {
                "newFigurePrototype": this.#figureToCreate,
                "cornerPoint1":       documentMousePoint,
                "cornerPoint2":       documentMouseDownPoint,
            },
            drawingView
        );
        //do the thing
        drawingView.do(createFigureCommand);
    }
    dragExit(){
        const drawingView = this.getDrawingView();
        drawingView.endPreview();

        // this is tricky. If I sync it with the registered tools, I need the right string 
        // of the selection tool. If I just do "changeTool" the "is it the same tool"- matching 
        // in changeTool of drawingView wont match.
        // try to find a better mechanism here, maybe by exporting at least the name, rather than having 
        // any possible string?
        // or I implicitly default-add selection tool (there is no way around it anyway?
        drawingView.changeToolByName("selectionTool");
        //drawingView.changeTool(new SelectionTool());
    }
}

export {CreateFigureTool}