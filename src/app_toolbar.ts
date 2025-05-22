import { DrawingView } from "./drawingView.js";
import { AbstractTool } from "./tools/abstractTool.js";
import { ToolChangeEvent } from "./events.js";


type AddActionCallback = {
    (drawingView:DrawingView):void
};

type AddLoadFileCallback = {
    (drawingView:DrawingView, drawingJson:object):void
}

type ToolData = {
    tool:AbstractTool,
    label?:string;
    description?:string;
    icon?:string
}


class Actionbar{
    domElement:HTMLElement 
    drawingView: DrawingView

    constructor(drawingView:DrawingView){
        this.domElement = document.createElement("div");
        this.domElement.className = "qwToolbar";
        this.drawingView = drawingView;
    }
    addAction(label:string,callback:AddActionCallback, tooltip:string){
        const button = new ActionBarActionButton(label, this.drawingView, callback, tooltip);
        this.domElement.append(button.domElement);
    }
    addLoadFile(label:string,callback:AddLoadFileCallback, tooltip:string){
        const button = new ActionbarLoadFileAsJsonButton(label, this.drawingView, callback, tooltip);
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
        this.domElement = htmlButton;
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

class ActionbarLoadFileAsJsonButton extends ActionBarButton{
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



type CreateToolButtonParam = ToolData & {
    drawingView: DrawingView
}

class Toolbar{
    domElement = null;
    drawingView = null;
    selectedTool = ""
    buttons:Array<ToolButton> = []
    constructor(drawingView){
        this.domElement = document.createElement("div");
        this.domElement.className = "qwToolbar";
        this.drawingView = drawingView;
        this.drawingView.addEventListener("toolChange",this.updateToolbar.bind(this))
    }

    addToolButton(addToolButtonParam:ToolData){
        const button = new ToolButton({
            ...addToolButtonParam,
            drawingView:this.drawingView
        });
        this.domElement.append(button.radiobuttonDom);
        this.domElement.append(button.labelDom);
        this.buttons.push(button)
    }
    updateToolbar(toolChangeEvent:ToolChangeEvent){
        const buttonOfTool = this.buttons.find((button)=>button.toolName === toolChangeEvent.toolName)
        if (buttonOfTool){
            buttonOfTool.activate();
        } else {
            console.log("No Button with name "+toolChangeEvent.toolName+" found.")
        }
    }
}


class ToolButton{
    radiobuttonDom:HTMLInputElement
    labelDom:HTMLLabelElement
    
    #drawingView:DrawingView
    toolName:string

    constructor(param:CreateToolButtonParam){
        const {drawingView,label, description, icon} = param;
        const toolName = param.tool.name;
        this.#drawingView = drawingView;
        this.toolName = toolName;

        const radiobuttonDom = document.createElement("input");
        const labelDom = document.createElement("label");
        
        const radioId = "radio_"+toolName;
        radiobuttonDom.setAttribute("type","radio");
        radiobuttonDom.setAttribute("id",radioId);
        radiobuttonDom.setAttribute("name","tool");
        
        labelDom.setAttribute("for",radioId);
        //labelDom.setAttribute("tabindex","0");
        labelDom.setAttribute("aria-label",toolName)
        labelDom.setAttribute("title", description ?? toolName)
        labelDom.classList.add(icon+"_icon");
        labelDom.textContent  = label ?? toolName;

        radiobuttonDom.addEventListener("input",this.buttonClicked.bind(this))

        this.radiobuttonDom = radiobuttonDom;
        this.labelDom = labelDom;
        
    };
    buttonClicked(e:InputEvent){
        console.log("requested")
        e.preventDefault();
        this.#drawingView.changeToolByName(this.toolName)
    };
    activate(){ //called by the toolBar 
        console.log("activated");
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

export {Toolbar, ToolButton, Actionbar , ActionBarActionButton, ActionbarLoadFileAsJsonButton, ToolData}