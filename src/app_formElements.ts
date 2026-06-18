
import { Point } from "./data/point.js";
import { Drawing } from "./drawing.js";
import { DrawingView } from "./drawingView.js";
//Provides a constant interface that shields the DOM and the implementation away.
import { selectionEventName } from "./events.js";
import { Figure } from "./figures/figure.js";

abstract class FormElement<HandledType>{
    abstract domElement:HTMLElement;
    label:string;
    changeHandler:(changedTo:HandledType)=>void;
    abstract removeHandler():void;
    abstract addHandler(handler:(changedTo:HandledType)=>void):void;
    abstract getCurrentValue():HandledType;
    remove(){
        this.removeHandler();
        this.domElement.remove();
    }
}

// type CreateHorizontalLineFigureParam = CreateFigureParam & {
    //     horizontalLine:HorizontalLine
    //     lineStart?:EndingTypes
    //     lineEnd?:EndingTypes
    // }
    
interface FormBooleanChangeCallback { (changedTo:boolean):void};

type CreateFormElementParam = {
    changeHandler:unknown;
    label:string;
}

type DropdownOption<possibleValues> = {
    iconName:string, // what the user sees
    label:string,    //what the user sees
    value:possibleValues     //what the program gets
}
type CreateDropdownParam<possibleValues> = CreateFormElementParam & {
    changeHandler: (changedTo:string)=>void
    options:DropdownOption<possibleValues>[],
    selectedValue:string
    mirrorIcons?:boolean
}

// class FormElementCheckbox extends FormElement<boolean>{
//     domElement:HTMLElement = null; 
//     label:string = null; 
//     #checkbox:HTMLInputElement
//     constructor(label:string,startValue:boolean,changeHandler:FormBooleanChangeCallback, document:HTMLDocument){
//         super();
//         this.changeHandler = changeHandler;
//         this.label = label;
//         this.#createDomElement(document);
//         this.addHandler(changeHandler);
//     }
//     addHandler(changeHandler){
//         //call the passed handler
//         this.#checkbox.onchange = (event)=> {
//             const isChecked = this.#checkbox.checked;
//             this.changeHandler(isChecked);
//         }
//     }
//     removeHandler(){
//         this.#checkbox.onchange = null; 
//     }
//     #createDomElement(document:HTMLDocument){
//         const checkbox = document.createElement("input");
//         checkbox.type="checkbox";
//         const labelElement = document.createElement("label");
//         const labelText = document.createTextNode(this.label);
//         //assemble!
//         labelElement.append(labelText);
//         labelElement.append(checkbox);
//         this.domElement= labelElement;
//         this.#checkbox = checkbox; 
//     }
//     /**
//      * Bridges between the UI element 
//      * and the internal interface
//      */
//     getCurrentValue(){
//         const isChecked:boolean = this.#checkbox.checked;
//         return isChecked;
//     }
// }

class FormElementDropdown extends FormElement<string>{
    options:string[]
    domElement: HTMLElement;
    #selectElement: HTMLSelectElement;
    constructor(param:CreateDropdownParam<string>, document:HTMLDocument){
        super()
        const {label,changeHandler, options,selectedValue} = param;
        const values = options.map(option => option.value)
        if(!values.includes(selectedValue)){
            throw TypeError(`SelectedValue »${selectedValue}« is not part of values, which consists of ›${values.join("‹,›")}‹`);
        }
        this.changeHandler = changeHandler;
        this.options = values;
        this.label = label;
        this.#createDomElement(document,param);
        this.addHandler(changeHandler)

    }
    addHandler(changeHandler:(changedTo:string)=>void): void {
        this.#selectElement.oninput = () => {
            const currentValue = this.getCurrentValue();
            changeHandler(currentValue);
        }
    }
    removeHandler(): void {
        this.#selectElement.oninput = null;
    }
    getCurrentValue(){
        const selected = this.#selectElement.value;
        return selected;
    }
    #createDomElement(document:HTMLDocument,param:CreateDropdownParam<string>){
        const selectElem = document.createElement("select");
       
        
        const optionElems = param.options.map(option=>{
            let optionElem = document.createElement("option");
            optionElem.value = option.value;
            //select value that the figure  currently on has.
            if(optionElem.value === param.selectedValue){
                optionElem.selected = true;
            }
            optionElem.setAttribute("aria-label",option.label);
            
            const spanElem = document.createElement("span");
            spanElem.className = "selecttextlabel";
            spanElem.textContent = option.label;

            const imgElem = document.createElement("img");
            imgElem.src ="/static/properties/"+option.iconName+".svg"
            imgElem.setAttribute("aria-hidden","true")
            //assemble!
            optionElem.append(imgElem,spanElem);

            return optionElem;
        })
        const labelElement = document.createElement("label");
        labelElement.textContent = param.label;

        const buttonElem = document.createElement("button");
        const selectedContentElem = document.createElement("selectedcontent")

        buttonElem.append(selectedContentElem);

        selectElem.append(buttonElem,...optionElems);
        //labelElement.append(labelText);
        labelElement.append(selectElem);
        this.domElement= labelElement;
        this.#selectElement = selectElem;
    }
}

/*Displays form controls for the currently selected figure */
class FigureBar{
    domElement:HTMLElement = null;
    #drawingView:DrawingView;
    #formElementFactory:FormElementFactory = null; 
    #canvasContainer:HTMLElement = null; 
    #currentFormElements:FormElement<unknown>[] = []
    constructor(document:HTMLDocument,drawingView:DrawingView, canvasContainer:HTMLElement){
        this.#drawingView = drawingView;
        this.#canvasContainer = canvasContainer; //needed for relative positioning
        this.#drawingView.addEventListener(selectionEventName,this.#handleSelectionChange.bind(this)); 
        
        this.#formElementFactory = new FormElementFactory(document);

        this.domElement = document.createElement("div");
        this.domElement.classList.add("qwBar","figureBar");
        // this.domElement.className = "figureBar";
        // this.domElement.style.position = "absolute";
        // this.domElement.style.backgroundColor = "green";
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
            //this.#updatePosition(selectedElement)
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
    // createCheckbox(label:string,startValue:boolean,changeHandler:FormBooleanChangeCallback){
    //     const checkbox = new FormElementCheckbox(label,startValue,changeHandler, this.#doc);
    //     return checkbox;
    // }
    createDropdown(param:CreateDropdownParam<string>){
        const dropdown = new FormElementDropdown(param, this.#doc)
        return dropdown;  
    }
    
}

export {FormElementFactory, FigureBar, FormElement, DropdownOption}