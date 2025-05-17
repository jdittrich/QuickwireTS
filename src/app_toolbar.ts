import { DrawingView } from "./drawingView.js";
import { AbstractTool } from "./tools/abstractTool.js";
import { ToolChangeEvent } from "./events.js";


type AddActionCallback = {
    (drawingView:DrawingView):void
};

type AddLoadFileCallback = {
    (drawingView:DrawingView, drawingJson:object):void
}


class ActionBar{
    domElement:HTMLElement 
    drawingView: DrawingView

    constructor(drawingView:DrawingView){
        this.domElement = document.createElement("div");
        this.domElement.className = "qwToolbar";
        this.drawingView = drawingView;
    }
    addTool(label:string, tool:AbstractTool, tooltip:string){
        const button = new ActionBarToolButton(label, this.drawingView, tool, tooltip);
        this.domElement.append(button.domElement);
    }
    addAction(label:string,callback:AddActionCallback, tooltip:string){
        const button = new ActionBarActionButton(label, this.drawingView, callback, tooltip);
        this.domElement.append(button.domElement);
    }
    addLoadFile(label:string,callback:AddLoadFileCallback, tooltip:string){
        const button = new ToolbarLoadFileAsJsonButton(label, this.drawingView, callback, tooltip);
        this.domElement.append(button.domElement);
    }
}

class ActionBarButton{
    domElement:HTMLElement
    constructor(label:string, tooltip=""){
        
        const htmlButton = document.createElement("input");
        htmlButton.setAttribute("type","button");
        htmlButton.setAttribute("value",label);
        htmlButton.setAttribute("title",tooltip);
        htmlButton.className = "qwToolbarButton";
        htmlButton.style = "margin-right:2px; height:1.8rem";
        this.domElement = htmlButton;
    }
}   

class ActionBarToolButton extends ActionBarButton{
    constructor(label:string, drawingView:DrawingView, tool:AbstractTool, tooltip:string){
        super(label,tooltip);
        
        const changeTool = function(){
            drawingView.changeTool(tool);
        }
        this.domElement.addEventListener("click", changeTool,false);
    }

}

class ActionBarActionButton extends ActionBarButton{
    constructor(label:string, drawingView:DrawingView, callback:AddActionCallback, tooltip:string){
        super(label, tooltip);
        const callAction = function(){
            callback(drawingView)
        }
        this.domElement.addEventListener("click", callAction,false);
    }
}

class ToolbarLoadFileAsJsonButton extends ActionBarButton{
    constructor(label:string, drawingView:DrawingView, callback:AddLoadFileCallback, tooltip:string){
        super(label, tooltip);
        this.domElement.setAttribute("type","file");
        const callAction = function(event){
            //guards
            if(event.target.files === undefined) {return};
            if(!event.target.files[0].type.match('application/json')){
                console.log("not a json file");
                return;
            }
            //read text file as JSON
            var reader = new FileReader();
            reader.readAsText(event.target.files[0]);
            reader.onload = function (event) {
               const resultString = event.target.result as string; //as string, since we readAsText before, not readAsArrayBuffer
               const resultJSON = JSON.parse(resultString)
               
               //finally, call the callback
               callback(drawingView,resultJSON);
            }
        }
        this.domElement.addEventListener("change", callAction,false);
    }
}

//===NEW TOOLBAR ==

/**
 * Toolbar that can 
 */
class ToolBar{
    domElement = null;
    drawingView = null;
    selectedTool = ""
    buttons = []
    constructor(drawingView){
        this.domElement = document.createElement("div");
        this.domElement.className = "qwToolbar";
        this.drawingView = drawingView;
        this.drawingView.addEventListener("toolChange",this.updateToolbar.bind(this))
    }

    addToolButton(toolName){
        const button = new ToolButton(toolName, this.drawingView);
        this.domElement.append(button.radiobuttonDom);
        this.domElement.append(button.labelDom);
        this.buttons.push(button)
    }
    updateToolbar(toolChangeEvent:ToolChangeEvent){
        const buttonOfTool = this.buttons.find((button)=>button.toolName === toolChangeEvent.tool)
        if (buttonOfTool){
            buttonOfTool.activate();
        } else {
            console.log("No Button with name "+toolChangeEvent.tool.name+ "found.")
        }
    }
}

type CreateToolButtonParam = {
    toolName:string,
    drawingView: DrawingView
}

class ToolButton{
    radiobuttonDom:HTMLInputElement
    labelDom:HTMLLabelElement
    
    #drawingView:DrawingView
    #toolName:string

    constructor(toolName:string, drawingView:DrawingView){
        this.#drawingView = drawingView;
        this.#toolName = toolName;

        const radiobutton = document.createElement("input");
        const label = document.createElement("label");
        
        const radioId = "radio_"+toolName;
        radiobutton.setAttribute("type","radio");
        radiobutton.setAttribute("id",radioId);
        radiobutton.setAttribute("name","tool");

        label.setAttribute("for",radioId);
        label.setAttribute("tabindex","0");
        label.setAttribute("aria-label",toolName)
        label.textContent  = toolName;

        radiobutton.addEventListener("input",this.requestTool.bind(this))

        this.radiobuttonDom = radiobutton;
        this.labelDom = label;
        
    };
    requestTool(e){
        console.log("requested")
        e.preventDefault();
        this.#drawingView.changeTool(this.#toolName)
    };
    activate(){
        console.log("activated")
        this.radiobuttonDom.checked = true;
    }

}
/*
If I change tools by name (makes sense), 
then I would need to map tools and names somewhere.

So I have: 

object 

{
    "selection":new SelectionTool(),
    "createRect": new CreateRectTool(...),
    "createButton": new CreateButtonTool(...),
}

Internally,  then transfer it into a map via
 entries = Object.entries(myToolMap)
 new Map(entries);
 and store that map. 
 
This moves tool management into drawing view, but makes tools callable via a string. 

*/

export {ActionBar as Toolbar, ActionBarActionButton as ToolbarActionButton, ActionBarToolButton as ToolbarToolButton, ToolbarLoadFileAsJsonButton}