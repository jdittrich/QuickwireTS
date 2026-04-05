import { Point } from "../data/point.js";
import { Rect } from "../data/rect.js";
import { LocalDragEvent } from "../events.js";
import { HorizontalLine } from "../data/horizontalLine.js";
import {Figure} from '../figures/figure.js';
import { HorizontalLineFigure} from "../figures/lineFigure.js"
import { RectFigure } from "../figures/rectFigure.js";
import { Tool } from "./tool.js";
import { CreateFigureCommand } from "../commands/createFigureCommand.js";

class CreateFigureMultiTracker extends Tool{
    /**
     * Returns a line or rect figure based on the mouse movement
     */
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
    onDrag(mouseEvent: LocalDragEvent): void {
        const currentMousePoint = mouseEvent.getDocumentPosition(); 
        const documentMouseDownPoint = mouseEvent.getMousedownDocumentPosition();
        const figure = this.getFigureFromPoints(currentMousePoint,documentMouseDownPoint);
        
        // use figure for preview
        mouseEvent.drawingView.startPreviewOf(figure);
        mouseEvent.drawingView.updateDrawing();
    }
    onDragend(mouseEvent: LocalDragEvent): void {
        const documentMousePoint = mouseEvent.getDocumentPosition(); 
        const documentMouseDownPoint = mouseEvent.getMousedownDocumentPosition();
        const figure = this.getFigureFromPoints(documentMousePoint,documentMouseDownPoint);
        const drawingView = mouseEvent.drawingView;
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
}

export {CreateFigureMultiTracker}