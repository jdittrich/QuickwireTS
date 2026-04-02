import { Tool } from "./tool.js";
import { CreateFigureCommand } from "../commands/createFigureCommand.js";
import { SelectionTool } from "./selectionTool.js";
import {Figure} from '../figures/figure.js';
import { Point } from "../data/point.js";
import { Rect } from "../data/rect.js";
import { LocalDragEvent, LocalMouseEvent } from "../events.js";
import { RectFigure, CreateRectFigureParam } from "../figures/rectFigure.js";
import { HorizontalLineFigure, CreateHorizontalLineFigureParam} from "../figures/lineFigure.js"
import { HorizontalLine } from "../data/horizontalLine.js";

type FigureTypes = "rect"|"hline"

class CreateFigureMultiTool extends Tool{
    constructor(){
        super();
        this.name = "CreateFigureMulti"
    }


    getFigureFromPoints(currentMousePoint:Point,documentMouseDownPoint:Point):Figure{
        const pointDiff = documentMouseDownPoint.offsetTo(currentMousePoint);
        let figure:Figure = null;
        if(Math.abs(pointDiff.x) > 20 && Math.abs(pointDiff.y)<10){ 
            const horizontalLine = HorizontalLine.createFromPoints(currentMousePoint,documentMouseDownPoint);
            figure = new HorizontalLineFigure({horizontalLine:horizontalLine});
        }else{
            const rect = Rect.createFromCornerPoints(currentMousePoint, documentMouseDownPoint)
            figure = new RectFigure({rect:rect});
        }
        return figure;
    }
    onDragstart(event: LocalDragEvent){
        //event.drawingView.startPreviewOf(this.);
    }
    onDrag(event: LocalDragEvent){ 
        const currentMousePoint = event.getDocumentPosition(); 
        const documentMouseDownPoint = event.getMousedownDocumentPosition();
        const figure = this.getFigureFromPoints(currentMousePoint,documentMouseDownPoint);
        
        // use figure for preview
        event.drawingView.startPreviewOf(figure);
        event.drawingView.updateDrawing();
    }
    onMouseup(mouseEvent: LocalMouseEvent): void {
        // const documentMousePoint = mouseEvent.getDocumentPosition(); 
        // if(!this.#createdFigureOnDrag){
        //     try {
        //         // this should be a temporary fix to allow adding by click, createFigure Command should figure out how large the figure should be, 
        //         // the mousemovement should be just a suggestion
        //         this.#createNewFigure(documentMousePoint, documentMousePoint.add(new Point({x:300,y:16})));
        //     } catch(error){
        //         console.log(error)
        //     }
        // }
        // //cleanup
        const drawingView = this.getDrawingView();
        drawingView.endPreview();
        //drawingView.changeToDefaultTool();
    }
    onDragend(event: LocalDragEvent){
        const documentMousePoint = event.getDocumentPosition(); 
        const documentMouseDownPoint = event.getMousedownDocumentPosition();
        const figure = this.getFigureFromPoints(documentMousePoint,documentMouseDownPoint);
        const drawingView = event.drawingView;
        try {
            const createFigureCommand = new CreateFigureCommand(
            {
                "newFigurePrototype": figure,
                "cornerPoint1":       documentMousePoint,
                "cornerPoint2":       documentMouseDownPoint,
            },
            drawingView
            );
        
            drawingView.do(createFigureCommand);
        
        } catch(error){
            console.log(error)
        } 
    }
    onWheel(event:LocalMouseEvent,wheelDelta:number){
        const changeFactor = (wheelDelta>0) ? 0.8:1.2; 
        const screenPosition = event.getScreenPosition()
        event.drawingView.scaleBy(changeFactor,screenPosition);
    }
}

export {CreateFigureMultiTool}