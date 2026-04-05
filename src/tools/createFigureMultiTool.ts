import { Tool } from "./tool.js";
import { CreateFigureCommand } from "../commands/createFigureCommand.js";
import { SelectionTool, HandleTracker } from "./selectionTool.js";
import {Figure} from '../figures/figure.js';
import { Point } from "../data/point.js";
import { Rect } from "../data/rect.js";
import { LocalDragEvent, LocalMouseEvent } from "../events.js";
import { RectFigure, CreateRectFigureParam } from "../figures/rectFigure.js";
import { HorizontalLineFigure, CreateHorizontalLineFigureParam} from "../figures/lineFigure.js"
import { HorizontalLine } from "../data/horizontalLine.js";
import { Handle } from "../handles/handle.js";
import { DrawingView } from "../drawingView.js";
import { findElementUnderPoint } from "./trackerSelectionHelper.js";

type FigureTypes = "rect"|"hline"

class CreateFigureMultiTool extends Tool{
    #childTool:Tool
    constructor(){
        super();
        this.name = "CreateFigureMulti"
    }
    setChildTool(childTool:Tool){
        const drawingView = this.getDrawingView();
        this.#childTool = childTool;
        childTool.setDrawingView(drawingView);
    }
    getChildTool():Tool{
        return this.#childTool;
    }
    getTracker(point:Point, drawingView:DrawingView):CreateFigureMultiTracker|HandleTracker{
        const elementUnderPoint = findElementUnderPoint(point,drawingView)

        if(elementUnderPoint instanceof Handle){
            const handleTracker = new HandleTracker(elementUnderPoint);
            return handleTracker
        } else{
            const createFigureMultiTracker = new CreateFigureMultiTracker()
            return createFigureMultiTracker;
        }
    }
    onMousedown(mouseEvent: LocalMouseEvent): void {
        const point = mouseEvent.getDocumentPosition();
        const drawingView = mouseEvent.getDrawingView()
        const tracker = this.getTracker(point,drawingView);
        this.setChildTool(tracker);
    }
    
    onDragstart(mouseEvent: LocalDragEvent){
        this.#childTool.onDragstart(mouseEvent);
    }
    onDrag(mouseEvent: LocalDragEvent){ 
        this.#childTool.onDrag(mouseEvent);
    }
    onMouseup(mouseEvent: LocalMouseEvent): void {
        // const drawingView = mouseEvent.getDrawingView();
        // drawingView.endPreview();
    }
    onDragend(mouseEvent: LocalDragEvent){
        this.#childTool.onDragend(mouseEvent); 
    }
    onWheel(event:LocalMouseEvent,wheelDelta:number){
        const changeFactor = (wheelDelta>0) ? 0.8:1.2; 
        const screenPosition = event.getScreenPosition()
        event.drawingView.scaleBy(changeFactor,screenPosition);
    }
}

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


export {CreateFigureMultiTool}