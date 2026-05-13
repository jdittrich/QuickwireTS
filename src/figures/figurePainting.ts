import { RectResize } from "../data/rect.js";
import { Point } from "../data/point.js";
import { CompositeFigure } from "./compositeFigure.js";
import { RectFigure } from "./rectFigure.js";

class FigurePainting{
    isPainted:boolean = false
    #canvas:OffscreenCanvas
    #figure: RectFigure
    constructor(figure){
        const rect  = figure.getRect();
        this.#canvas = new OffscreenCanvas(rect.width,rect.height);
        this.#figure = figure;
    }
    get ctx(){
        return this.#canvas.getContext("2d");
    }
    getOffset(){
        const rect = this.#figure.getRect();
        const offset = new Point({x:rect.x, y:rect.y});
        return offset;
    }
    draw(ctx:CanvasRenderingContext2D){
        const {x,y} = this.getOffset();
        ctx.drawImage(this.#canvas,x,y);   
    }
    paintFromTo(from:Point,to:Point){
        this.isPainted = true;
        const ctx = this.#canvas.getContext("2d");
        const offset = this.getOffset();
        //adjust for potential erase mode
        //const oldComposite = ctx.globalCompositeOperation;
        //ctx.globalCompositeOperation = this.#paintMode === "erase"? "destination-out":oldComposite;
        
        //normalize painting position to internal canvas starting at 0,0
        //const {topLeft: offset} = this.getRect().getCorners();
        const point1Corrected = from.sub(offset);
        const point2Corrected = to.sub(offset);

        //paint!
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.strokeStyle = "black"
        ctx.moveTo(point1Corrected.x,point1Corrected.y);
        ctx.lineTo(point2Corrected.x,point2Corrected.y);
        ctx.stroke();
        this.isPainted = true; 

        //reset composition
        //ctx.globalCompositeOperation = oldComposite;
    }
    getCanvas():OffscreenCanvas{
        const copiedCanvas = this.#copyCanvas(this.#canvas)
        return copiedCanvas;
    }
    setCanvas(canvas:OffscreenCanvas){
        const newCanvas = this.#copyCanvas(canvas);
        this.#canvas = newCanvas;
    }
    #copyCanvas(canvasToCopy:OffscreenCanvas):OffscreenCanvas{
        const {width, height} = canvasToCopy;
        const copiedCanvas = new OffscreenCanvas(width,height);
        const copiedContext = copiedCanvas.getContext("2d");
        copiedContext.drawImage(canvasToCopy, 0,0);
        return copiedCanvas;
    }
    crop(resize:RectResize){
        const updatedWidth  = this.#canvas.width  + resize.right - resize.left; 
        const updatedHeight = this.#canvas.height + resize.bottom - resize.top;
        //create a new canvas in the new size.
        const croppedCanvas = new OffscreenCanvas(updatedWidth,updatedHeight);
        const offsetLeft =  resize.left*-1;
        const offsetTop  =  resize.top*-1;
        const croppedCanvasCtx = croppedCanvas.getContext("2d");
        croppedCanvasCtx.drawImage(this.#canvas,offsetLeft , offsetTop)
        this.#canvas = croppedCanvas;
    }
    clear(){
        const ctx = this.#canvas.getContext("2d");
        ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.isPainted = false;
    }
}

export {FigurePainting}