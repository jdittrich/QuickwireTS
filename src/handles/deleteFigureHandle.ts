import { Handle } from "./handle.js";
import { RemoveFigureAndContainedCommand } from "../commands/removeFigureCommand.js";
import { Rect } from "../data/rect.js";

class DeleteFigureHandle extends Handle{
    #figureToDelete = null;
    #size = 20;

    /**
     * 
     * @param {Figure} figure 
     * @param {DrawingView} drawingView 
     */
    constructor(figure, drawingView){
        super(figure,drawingView)    
    }

    draw(ctx: CanvasRenderingContext2D):void{
        const {x,y,width,height} = this.getScreenRect();
        ctx.fillStyle ="rgb(145, 60, 60)";
        ctx.fillRect(x,y,width,height);
        
        //draw an x
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 3;
        const dist = 4;
        ctx.beginPath();
        ctx.moveTo(x+dist,y+dist); //upper left
        ctx.lineTo(x+width-dist,y+height-dist); //lower right
        ctx.moveTo(x+dist,y+height-dist); //lower left
        ctx.lineTo(x+width-dist,y+dist) //upper right
        ctx.stroke();        
    }
    getScreenRect(){
        const drawingView = this.getDrawingView();
        const figure = this.getFigure();
        const documentRect = figure.getRect();
        const {topRight:documentTopRight} = documentRect.getCorners();
        const screenTopRight = drawingView.documentToScreenPosition(documentTopRight);
        
        const screenRect = new Rect({
            x: screenTopRight.x + (2*this.#size),
            y: screenTopRight.y - this.#size,
            width: this.#size,
            height: this.#size
        });

        return screenRect;
    }
    onMousedown(localMouseEvent){
        const drawingView = this.getDrawingView();
        const figure = this.getFigure();
        const deleteFigureAndContainedCommand = new RemoveFigureAndContainedCommand(
            {figureToDelete:figure}
            ,drawingView
        );
        drawingView.do(deleteFigureAndContainedCommand);
    }
    getInteractions(){
        return { 
            cursor: "pointer",
            helpText: "delete figure",
            draggable: false, 
            clickable: true 
        };
    }
}

export {DeleteFigureHandle}

