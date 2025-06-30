import { Drawable } from "../../interfaces.js";
import { Rect } from "../../data/rect.js";
import { Figure } from "../figure.js";
import { DrawingView } from "../../drawingView.js";
import { Handle } from "../../handles/handle.js";

/**
 * An abstract class for graphical elements of figures, 
 * e.g. the handle on a scrollbar or the radio indicator of a radiobutton.
 * 
 * It combines: 
 * - Figure, 
 * - a figure attribute (identified by name), 
 * - a handle to change the attribute
 * - a drawing method that visualized the element
 * 
 * Note: I am not sure how much I like this pattern. It provides composability for complex figures
 * It also introduces a lot of indirections, particularly since it registers itself to its figure
 * in its constructor, so mere creation of the object creates a link between the two. 
 */
abstract class FigureElement implements Drawable{
    #figure:Figure
    constructor(figure:Figure){
        this.#figure = figure;
        figure.addFigureElement(this);
    }
    getFigure():Figure{
        return this.#figure
    }
    getFigureRect():Rect{
        return this.#figure.getRect();
    }
    getFigureAttribute(attributeName:string):any{
        const attributeValue = this.#figure.getAttribute(attributeName);
        return attributeValue;
    }
    setFigureAttribute(attributeName,attributeValue){
        this.#figure.setAttribute(attributeName,attributeValue);
    }
    abstract getElementRect():Rect
    abstract draw(ctx:CanvasRenderingContext2D):void
    getHandles(drawingView:DrawingView):Handle[]{
        return [];
    }
}

export {FigureElement}