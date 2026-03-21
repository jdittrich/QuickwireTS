import { Tool } from "./tool.js";
import { CreateFigureCommand } from "../commands/createFigureCommand.js";
import { SelectionTool } from "./selectionTool.js";
import {Figure} from '../figures/figure.js';
import { Point } from "../data/point.js";
import { Rect } from "../data/rect.js";
import { LocalDragEvent, LocalMouseEvent } from "../events.js";

//Adds an element to the drawing
class CreateFigureTool extends Tool{
    #figureToCreate:Readonly<Figure>;
    #createdFigureOnDrag = false;
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
        previewedFigure.resizeByPoints(documentMouseDownPoint,currentMousePoint);
        event.drawingView.updateDrawing();
    }
    onMouseup(mouseEvent: LocalMouseEvent): void {
        const documentMousePoint = mouseEvent.getDocumentPosition(); 
        if(!this.#createdFigureOnDrag){
            try {
                // this should be a temporary fix, createFigure Command should figure out how large the figure should be, 
                // the mousemovement should be just a suggestion
                this.#createNewFigure(documentMousePoint, documentMousePoint.add(new Point({x:300,y:16})));
            } catch(error){
                console.log(error)
            }
        }
        //cleanup
        const drawingView = this.getDrawingView();
        drawingView.endPreview();
        //drawingView.changeToDefaultTool();
    }
    onDragend(event: LocalDragEvent){
        const documentMousePoint = event.getDocumentPosition(); 
        const documentMouseDownPoint = event.getMousedownDocumentPosition();
        try {
            this.#createNewFigure(documentMouseDownPoint, documentMousePoint);
            this.#createdFigureOnDrag = true;
        } catch(error){
            console.log(error)
        } 
    }
    #createNewFigure(point1:Point,point2:Point){
        const drawingView = this.getDrawingView();

        const createFigureCommand = new CreateFigureCommand(
            {
                "newFigurePrototype": this.#figureToCreate,
                "cornerPoint1":       point1,
                "cornerPoint2":       point2,
            },
            drawingView
        );
        drawingView.do(createFigureCommand);
       
    }
}

export {CreateFigureTool}