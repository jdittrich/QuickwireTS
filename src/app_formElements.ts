
interface FormBooleanChangeCallback { (changedValue:boolean):void};
import { Point } from "./data/point.js";
import { Drawing } from "./drawing.js";
import { DrawingView } from "./drawingView.js";
//Provides a constant interface that shields the DOM and the implementation away.
import { selectionEventName } from "./events.js";
import { Figure } from "./figures/figure.js";

abstract class FormElement{
    domElement:HTMLElement
    label:string
    abstract removeEventHandler():void
    abstract addEventHandler():void
    remove(){
        this.removeEventHandler();
        this.domElement.remove();
    }
}

class FormElementCheckbox extends FormElement{
    changeHandler:FormBooleanChangeCallback
    domElement:HTMLElement = null; 
    label:string = null; 
    #checkbox:HTMLInputElement
    constructor(label:string,startValue:boolean,changeHandler:FormBooleanChangeCallback, document:HTMLDocument){
        super();
        this.changeHandler = changeHandler;
        this.label = label;
        this.#createDomElement(document);
        this.addEventHandler();
    }
    addEventHandler(){
        //call the passed handler
        this.#checkbox.onchange = (event)=> {
            const isChecked = this.#checkbox.checked;
            this.changeHandler(isChecked);
        }
    }
    removeEventHandler(){
        this.#checkbox.onchange = null; 
    }
    #createDomElement(document:HTMLDocument){
        const checkbox = document.createElement("input");
        checkbox.type="checkbox";
        const labelElement = document.createElement("label");
        const labelText = document.createTextNode(this.label);
        //assemble!
        labelElement.append(labelText);
        labelElement.append(checkbox);
        this.domElement= labelElement;
        this.#checkbox = checkbox; 
    }
    /**
     * Bridges between the UI element 
     * and the internal interface
     */
    getCurrentValue():boolean{
        const isChecked:boolean = this.#checkbox.checked;
        return isChecked;
    }

}

/*Displays form controls for the currently selected figure */
class FigureBar{
    domElement:HTMLElement = null;
    #drawingView:DrawingView;
    #formElementFactory = null; 
    #canvasContainer:HTMLElement = null; 
    #currentFormElements:FormElement[] = []
    constructor(document:HTMLDocument,drawingView:DrawingView, canvasContainer:HTMLElement){
        this.#drawingView = drawingView;
        this.#canvasContainer = canvasContainer; //needed for relative positioning
        this.#drawingView.addEventListener(selectionEventName,this.#handleSelectionChange.bind(this)); 
        
        this.#formElementFactory = new FormElementFactory(document);

        this.domElement = document.createElement("nav");
        this.domElement.className = "figureBar";
        this.domElement.style.position = "absolute";
        this.domElement.style.backgroundColor = "green";
    }
    hide(){
        this.domElement.style.visibility = "hidden";
    }
    show(){
        this.domElement.style.visibility = "visible";
    }
    #updatePosition(selectedElement:Figure){
        const documentRect     = selectedElement.getBoundingBox();
        const figureScreenRect = this.#drawingView.documentToScreenRect(documentRect);
        const canvasRectRelativeToClient = this.#canvasContainer.getBoundingClientRect();
        
        const newPos = new Point({
            x:canvasRectRelativeToClient.x + figureScreenRect.left/devicePixelRatio,
            y:canvasRectRelativeToClient.y + figureScreenRect.top/devicePixelRatio
        })
        this.domElement.style.top = newPos.y+"px";
        this.domElement.style.left = newPos.x+"px";
    }
    #updateControls(selectedElement:Figure){
        this.#emptyBar();
        const formElements = selectedElement.getFormElements(this.#drawingView, this.#formElementFactory);
        formElements.forEach(element => {
            this.domElement.append(element.domElement);    
        });
        this.#currentFormElements = formElements;
    }
    #emptyBar(){
        this.#currentFormElements.forEach(formElement=>formElement.remove());
    }
    #handleSelectionChange(){
        const selectedElement = this.#drawingView.getSelection();
        //first check if empty and thus to be hidden and cleared
        if(!selectedElement){
            this.#emptyBar(); //empty bar
            this.hide();
        } else {
            this.#updateControls(selectedElement);
            this.#updatePosition(selectedElement)
            this.show();
        } 
        //NOTE: on pan, zoom and change of figure, the position of the toolbar might change.
    }
}

//factory to create UI elements.
class FormElementFactory{
    #doc:HTMLDocument = null; 
    constructor(doc:HTMLDocument){
        this.#doc = doc;
    }
    createCheckbox(label:string,startValue:boolean,changeHandler:FormBooleanChangeCallback){
        this.#doc;
        const checkbox = new FormElementCheckbox(label,startValue,changeHandler, this.#doc);
        return checkbox;
    }
}

export {FormElementFactory, FigureBar,FormElementCheckbox, FormElement}