import { Drawing } from "./drawing.js";
import { DrawingView, DrawingViewParam} from "./drawingView.js";
import { Point } from "./data/point.js";
import { Rect } from "./data/rect.js";

import { RectFigure } from "./figures/rectFigure.js";
import { ButtonFigure } from "./figures/buttonFigure.js";
import { RadioButtonListFigure } from "./figures/radioButtonListFigure.js";

import { SelectionTool } from "./tools/selectionTool.js";
import { CreateFigureTool } from "./tools/createFigureTool.js";
import { Toolbar, ToolButton, Actionbar, ActionBarActionButton, ActionbarLoadFileAsJsonButton, ToolData} from "./app_toolbar.js";
import { InteractionAnnouncementEvent, interactionAnnouncementName, ToolChangeEvent, toolChangeEventName} from "./events.js";
import { AbstractTool } from "./tools/abstractTool.js";
import { InteractionAnnouncement } from "./interfaces.js";
import { ToggleFigure } from "./figures/toggleFigure.js";


/**
 * App is responsible for bridging between 
 * DOM events elements and native application events and drawing.
 * 
 * App communicates with drawingView, which gets the translated native interactions.
 * 
 * @see {DrawingView}   
 */
class App{
    #canvas:HTMLCanvasElement
    #canvasCtx:CanvasRenderingContext2D
    #domContainer:HTMLElement
    #canvasContainer: HTMLElement
    #appContainer:HTMLElement
    #horizontalBarContainer: HTMLElement
    #drawing: Drawing
    #drawingView: DrawingView
    toolbar:Toolbar
    actionbar: Actionbar

    /**
     * @param {HTMLElement} container 
     * @see  this.getLocalEventPosition
     */
    constructor(domContainer:HTMLElement){
        //setup DOM
        this.#domContainer    = domContainer;
        
        //create app container. TODO: Move to private method, return DomFragment
        this.#appContainer = document.createElement("div");
        this.#appContainer.style.margin  = "0";
        this.#appContainer.style.padding  = "0";
        this.#appContainer.style.width   = "100%";
        this.#appContainer.style.height  = "600px";
        this.#domContainer.append(this.#appContainer);
        
        this.#horizontalBarContainer = document.createElement("div");
        this.#horizontalBarContainer.style.margin = "0";
        this.#horizontalBarContainer.style.padding = "0";
        this.#horizontalBarContainer.style.boxSizing;
        this.#horizontalBarContainer.style.width = "100%";
        this.#horizontalBarContainer.classList.add("qwBarContainer");
        this.#appContainer.append(this.#horizontalBarContainer);

        this.#canvasContainer = document.createElement("div");
        this.#canvasContainer.style.margin = "0";
        this.#canvasContainer.style.padding = "0";
        this.#canvasContainer.style.boxSizing ="border-box";
        
        /*if we put this to content-dependent values (auto, fit-content etc.)
         it never shrinks again, only grows; thus a parent-dependent value like 100% */
        this.#canvasContainer.style.width   = "100%";
        this.#canvasContainer.style.height = "100%"; 
        this.#appContainer.append(this.#canvasContainer);
        
        
        //create canvas
        this.#canvas               = document.createElement("canvas");
        this.#canvasCtx            = this.#canvas.getContext("2d");
        this.#canvas.style.padding = "0";
        this.#canvas.style.margin  = "0";
        this.#canvas.width = 800;
        this.#canvas.height = 600;
        this.#canvasContainer.append(this.#canvas);
        
        this.#canvas.addEventListener("mousedown", this.#onMousedown.bind(this));
        this.#canvas.addEventListener("mouseup"  , this.#onMouseup.bind(this));
        this.#canvas.addEventListener("mousemove", this.#onMousemove.bind(this));
        this.#canvas.addEventListener("wheel",     this.#onWheel.bind(this));
        this.#canvas.addEventListener("keydown",   this.#keydown.bind(this));
        this.#canvas.addEventListener("keyup",     this.#keyup.bind(this));
        
        this.#canvas.style.background = "lightgray";
        
        window.addEventListener("resize",this.#setCanvasSize.bind(this));


        //setup drawing view
        this.#drawing = new Drawing(
            {
                rect:new Rect({width:1200,height:1200,x:0,y:0}),
                containedFigures:[]
            }
        );


        const toolsData: ToolData[]   = [
            {
                tool: new SelectionTool(),
                label:"selection tool", 
                description:"pan or select figure and handles",
                icon:"selectionTool"
            },
            {  
                tool: new CreateFigureTool(RectFigure.createWithDefaultParameters()),
                label: "Rectangle",
                description: "create a rectangle figure",
                icon:"rectangleTool"
            },
            {
                tool: new CreateFigureTool(ButtonFigure.createWithDefaultParameters()),
                label: "Button",
                description:"create a button figure",
                icon: "buttonTool"
            },
            {
                tool: new CreateFigureTool(RadioButtonListFigure.createWithDefaultParameters()),
                label: "Radio button list",
                description: "create a list of radio buttons",
                icon: "radioTool"
            },
            {
                tool: new CreateFigureTool(ToggleFigure.createWithDefaultParameters("checkbox")),
                label:"Checkbox figure",
                description: "Checkbox with label",
                icon: "checkboxTool"
            }
        
        ]
        
    
        const drawingView = this.#setupDrawingView(toolsData)
        this.#drawingView = drawingView;
        const toolbar = this.#setupToolbar(toolsData);
        const actionbar = this.#setupActionBar();
        this.#horizontalBarContainer.append(toolbar.domElement);
        this.#horizontalBarContainer.append(actionbar.domElement);
        
        this.#setCanvasSize();
        this.#drawingView.addEventListener(toolChangeEventName,this.#handleToolChange.bind(this));
        this.#drawingView.addEventListener(interactionAnnouncementName, this.#handleInteractionAnnouncement.bind(this));
        
        //for debugging
        // window.drawingView = this.#drawingView;
        // window.drawing = this.#drawing;
    }


    //#region: event handler
    #onMousedown(e:MouseEvent){
        let eventPosRelativeToCanvas = this.#getLocalEventPosition(e);
        this.#drawingView.onMousedown(eventPosRelativeToCanvas);
    }
    #onMouseup(e:MouseEvent){
        let eventPosRelativeToCanvas = this.#getLocalEventPosition(e);
        this.#drawingView.onMouseup(eventPosRelativeToCanvas);
    }
    #onMousemove(e:MouseEvent){
        let eventPosRelativeToCanvas = this.#getLocalEventPosition(e);
        this.#drawingView.onMousemove(eventPosRelativeToCanvas);
    }
    
    #onWheel(e:WheelEvent){
       e.preventDefault();//otherwise everything browser-zooms in addition!

       let eventPosRelativeToCanvas = this.#getLocalEventPosition(e);
        
       //Normalize to +1 (wheel moved to user), -1 (wheel moved from user) 
       let wheelDelta = e.deltaY > 0 ? -1:1;   
       this.#drawingView.onWheel(eventPosRelativeToCanvas, wheelDelta)
    }

    #keydown(e:KeyboardEvent){ //Note: Keyboard events are rather low level. Input events are high level, but only fire on input-ish elements
        this.#drawingView.onKeyDown();
    }
    #keyup(e:KeyboardEvent){
        this.#drawingView.onKeyUp();
    }
    #setupDrawingView(toolsData:ToolData[]){
        const tools = toolsData.map(toolData => toolData.tool);

        const drawingViewParam:DrawingViewParam =  {
            "ctx": this.#canvasCtx,
            "ctxSize": new Point({
                x: this.#canvas.width,
                y: this.#canvas.height
            }),
            "drawing": this.#drawing,
            "requestEditorText":function(message,prefillText){
                const editedText = window.prompt(message,prefillText);
                if(editedText===null){
                    throw new Error("Editing cancelled");
                };
                return editedText;
            },
            "tools": tools
        }

        const drawingView = new DrawingView(drawingViewParam);

        return drawingView;
    }

    #setupToolbar(toolsData:ToolData[]):Toolbar{
        //tool definitions

        const toolbar = new Toolbar(this.#drawingView);

        toolsData.forEach(toolData=>toolbar.addToolButton(toolData))

        return toolbar;
    }

    #setupActionBar():Actionbar{
        const actionbar = new Actionbar(this.#drawingView);

        actionbar.addAction("undo",function(drawingView){drawingView.undo()}, "undo last action");
        actionbar.addAction("redo",function(drawingView){drawingView.redo()}, "redo undone action");
        actionbar.addAction("save",function(drawingView){
            //getJSON and convert to string
            const drawingJson = drawingView.toJSON();
            const drawingJsonAsString = JSON.stringify(drawingJson);

            // create text file blob
            const drawingFileBlob = new Blob([drawingJsonAsString], {type: "application/json"});

            //create a link to the file blob
            const fileUrl = URL.createObjectURL(drawingFileBlob);

            //create link
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = "quickWireDrawing.json";
            
            // "click" link to trigger "download"
            link.click();

            //free memory again
            URL.revokeObjectURL(fileUrl);
        }, "download current wireframe as json");
        actionbar.addLoadFile("load",function(drawingView, drawingJson){
            drawingView.fromJSON(drawingJson);
        }, "create a wireframe from a json file");

        return actionbar;
    }

    /**
     * sets canvas size in relation to its outer container and the devicePixelRatio
     * This ensures it is not blurry on high res displays. 
     * see: https://www.kirupa.com/canvas/canvas_high_dpi_retina.htm
     * needs also a mouse position shift by devicePixelRatio, for this @see App.getLocalEventPosition
     */
    #setCanvasSize(){
        const canvas = this.#canvas;
        const canvasContainer = this.#canvasContainer;
        const canvasRect              = canvasContainer.getBoundingClientRect();
        canvas.width            = canvasRect.width  * devicePixelRatio;
        canvas.height           = canvasRect.height * devicePixelRatio;
        canvas.style.width      = canvasRect.width+"px";
        canvas.style.height     = canvasRect.height+"px";
        this.#drawingView.setCtxSize(new Point({
            x:canvas.width,
            y:canvas.height
        }))
        this.#drawingView.updateDrawing();
    }

    //#region: Event offsets
    /**
     * get the offset of canvas-position to the client’s origin coordinates
     */
    #getCanvasOffset():Point{
        const canvasRelativeToClient = this.#canvas.getBoundingClientRect();

        const offset = new Point({
            x:canvasRelativeToClient.left,
            y:canvasRelativeToClient.top
        });

        return offset;
    }

    /**
     * Adjust the mouse event coordinates for 
     * - Offset of the canvas on screen (it not being at 0,0 of the html document)
     * - dpiCorrection
     * @see App.#setCanvasSize for how both are used.
     */
    #getLocalEventPosition(mouseEvent: MouseEvent): Point{
        const canvasOffset = this.#getCanvasOffset();
        const clientEventPos = new Point({
            "x":mouseEvent.clientX,
            "y":mouseEvent.clientY
        });
        const eventRelativeToCanvas = canvasOffset.offsetTo(clientEventPos);

        const dpiCorrectedEventPosition = new Point({
            "x": eventRelativeToCanvas.x * devicePixelRatio,
            "y": eventRelativeToCanvas.y * devicePixelRatio
        });
        
        return dpiCorrectedEventPosition;
    }

    //WIP Request a cursor
    // encapsulates setting a cursor based on its name
    #cursor = "default";
    #previousCursorClass:string = null;
    #handleToolChange(e:ToolChangeEvent){
        this.setCursor("cursor_tool_"+e.toolName)
    }
    #handleInteractionAnnouncement(e:InteractionAnnouncementEvent){
        this.setCursor("cursor_"+e.cursor);
        this.#canvasContainer.setAttribute("title",e.helpText);
    }
    /**Takes css cursor names*/
    setCursor(cursorName:string){
        console.log("set cursor to ", cursorName);
        this.#appContainer.classList.add(cursorName);
        if(this.#previousCursorClass && (this.#previousCursorClass !== cursorName)){ //delete old cursor class, except if the new is the same as the old one
            this.#appContainer.classList.remove(this.#previousCursorClass);
        }
        this.#previousCursorClass = cursorName;    
    }
    getCursor():string{
        return this.#cursor;
    }
};

export {App};