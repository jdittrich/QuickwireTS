import { createAllResizeHandles } from '../handles/resizeHandle.js';

import {Figure, CreateFigureParam} from './figure.js'
import { Rect } from '../data/rect.js';
import { DrawingView } from '../drawingView.js';

type CreateRectFigureParam = CreateFigureParam;

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
        const resizeHandles = createAllResizeHandles(this, drawingView);
        return [...resizeHandles];
    }
    
    copy():RectFigure{
        const baseParameters = this.copyBaseParameters();
        const rectParameters ={
            ...baseParameters
        }
        const rectFigureCopy = new RectFigure(rectParameters);
        return rectFigureCopy;
    }

    /**
    * @see {Figure.toString}
    */
    toString():string{
       const {x,y,width,height} = this.getRect();
       const containedFigures = this.getContainedFigures();
       const type = this.constructor.name;
       const rectFigureString = `x:${x}, y:${y}, width:${width}, height:${height}, number of contained figures:${containedFigures.length},type:${type}`;
       return rectFigureString;
    }
    
    toJSON(){
        const containedFiguresJson = this.getJsonOfContainedFigures();
        const rectFigureJson =  {
            "type":this.name,
            "rect":this.getRect().toJSON(),
            "containedFigures":containedFiguresJson
        }
        return rectFigureJson;
    }

    /**
     * created a figure from a JSON
     * @param {JSON} figureJson 
     */
    // static fromJSON(figureJson,nameFigureClassMapper){
    //     const containedFigureObjects = super.createContainedFiguresFromJson(figureJson,nameFigureClassMapper);
    //     const rectFigure = new RectFigure({
    //         "rect": Rect.fromJSON(figureJson.rect),
    //         "containedFigures": containedFigureObjects
    //      });
    //      return rectFigure;
    // }

    /**
     * @returns {RectFigure}
     */
    static createWithDefaultParameters(){
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