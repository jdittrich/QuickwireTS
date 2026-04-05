import { Point } from "../data/point.js";
import { Handle } from "../handles/handle.js";
import { Figure } from "../figures/figure.js";
import { NoOpFigure } from "../figures/noopFigure.js";
import { Drawing } from "../drawing.js";
import { Tool } from "./tool.js";
import { DrawingView } from "../drawingView.js";
import {HandleTracker, DragTracker, PanTracker} from "./selectionTool.js"

type ElementUnderCursor = Handle | Figure;

/**Find out what element (handle, figure, drawing...) is under a point */
function findElementUnderPoint(documentPoint:Point, drawingView:DrawingView):ElementUnderCursor{
    //are we over a figure at all?
    const drawing = drawingView.drawing;
    const figureEnclosingPoint = drawing.findFigureEnclosingPoint(documentPoint);
    
    //remember, drawing is also a figure, so this should rarely happen!
    if(!figureEnclosingPoint){
        return new NoOpFigure();
    }
    //get handles from an already selected figure.
    const handles = drawingView.getHandles();
    const handleUnderPoint = handles.find(handle=> handle.isEnclosingPoint(documentPoint));
    
    if(handleUnderPoint){
        return handleUnderPoint
    } else if (figureEnclosingPoint){
        return figureEnclosingPoint
    } else {
        throw new Error("one of the above conditions should always be the case");
    }
}

/**pass an element (handle, figure, drawing...) and get a tracker tool */
function elementToTracker(elementUnderPoint:ElementUnderCursor, drawingView:DrawingView):Tool{
    const drawing = drawingView.drawing;
    
    if(elementUnderPoint instanceof Handle){
        const handleTracker = new HandleTracker(elementUnderPoint);
        return handleTracker
    } else if (elementUnderPoint === drawing){
        const panTracker = new PanTracker();
        return panTracker;
    } else if (elementUnderPoint instanceof Figure){
        drawingView.select(elementUnderPoint);
        const dragTracker = new DragTracker(elementUnderPoint);
        return dragTracker
    } else {
        throw new Error("one of the above conditions should always be the case");
    }
}

/** pass a point and get the tracker for the element (handle, figure, drawing...)  under the point */
function pointToTracker(documentPoint:Point,drawingView:DrawingView):Tool{
    const element = findElementUnderPoint(documentPoint, drawingView);
    const tracker = elementToTracker(element,drawingView);
    return tracker;
}

export {elementToTracker, findElementUnderPoint, pointToTracker}