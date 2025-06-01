import { createAllResizeHandles } from '../handles/resizeHandle.js';

import { Figure, CreateFigureParam, FigureJson } from './figure.js'
import { Rect } from '../data/rect.js';
import { DrawingView } from '../drawingView.js';

type CreateParagraphFigureParam = CreateFigureParam;
type RectFigureJson = FigureJson;
/**
 * Creates figure representing a simple rectangle
 * 
 * @param {object} param
 * @param {number} param.y
 * @param {number} param.x 
 * @param {number} param.width
 * @param {number} param.height
 */
class ParagraphFigure extends Figure {
    name = "ParagraphFigure";
    #randomNumbers = [0.8,0.3,0.7,0.3,0.8,0.0,0.5] //since random() cant be seeded, leading to new numbers every draw

    constructor(param: CreateParagraphFigureParam) {
        super(param);
    }

    drawFigure(ctx: CanvasRenderingContext2D) {
        const { width, height, x, y } = this.getRect();
        
        ctx.lineWidth = 4;
        const lineSpacing = 20
        const linesThatFitRectHeight = Math.floor(height/lineSpacing);
        
        const xLineStart = x+4;
        const xLineEnd = x+width
        
        ctx.beginPath();
        ctx.moveTo(x+0, y+10)
        for (let lineNumber = 1; lineNumber < linesThatFitRectHeight; lineNumber++) { //whole lines
            ctx.moveTo(xLineStart, y+(lineNumber * lineSpacing));
            ctx.lineTo(xLineEnd-(this.#randomNumbers[lineNumber % this.#randomNumbers.length]*50), y+(lineNumber * lineSpacing))
            ctx.stroke();
        }
    }
    getHandles(drawingView: DrawingView) {
        const basicHandles = super.getHandles(drawingView);
        return [...basicHandles];
    }
    getParameters(): CreateParagraphFigureParam {
        const baseParameters = super.getParameters();
        const rectParameters = baseParameters;
        return rectParameters;
    }

    /**
    * @see {Figure.toString}
    */
    toString(): string {
        const baseString = super.toString();
        const rectString = baseString;
        return rectString;
    }

    toJSON(): RectFigureJson {
        const baseFigureJson = super.toJSON();
        const rectFigureJson = baseFigureJson;
        return rectFigureJson;
    }

    static createWithDefaultParameters(): ParagraphFigure {
        const paragraphFigure = new ParagraphFigure({
            rect: new Rect({
                "x": 0,
                "y": 0,
                "width": 100,
                "height": 50
            })
        });
        return paragraphFigure;
    }
}

export { ParagraphFigure, CreateParagraphFigureParam }