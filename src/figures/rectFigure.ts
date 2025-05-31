import { createAllResizeHandles } from '../handles/resizeHandle.js';

import {Figure, CreateFigureParam, FigureJson} from './figure.js'
import { Rect } from '../data/rect.js';
import { DrawingView } from '../drawingView.js';

type CreateRectFigureParam = CreateFigureParam;
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
class RectFigure extends Figure{
    name = "RectFigure";

    constructor(param:CreateRectFigureParam){
        super(param);
    }

    drawFigure(ctx:CanvasRenderingContext2D){
        const {width,height,x,y} = this.getRect();
        ctx.strokeRect(x,y,width,height);
    }

    getHandles(drawingView:DrawingView){
        const basicHandles = super.getHandles(drawingView);
        return [...basicHandles];
    }
    getParameters():CreateRectFigureParam{
        const baseParameters = super.getParameters();
        const rectParameters = baseParameters;
        return rectParameters;
    }

    /**
    * @see {Figure.toString}
    */
    toString():string{
       const baseString = super.toString();
       const rectString = baseString;
       return rectString;
    }
    
    toJSON():RectFigureJson{
        const baseFigureJson = super.toJSON();
        const rectFigureJson = baseFigureJson;
        return rectFigureJson;
    }

    static createWithDefaultParameters():RectFigure{
        const rectFigure = new RectFigure({
            rect: new Rect({
                "x":0,
                "y":0,
                "width":100,
                "height":50
            })
        });
        return rectFigure;
    }
}

export {RectFigure, CreateRectFigureParam}