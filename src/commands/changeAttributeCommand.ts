import { Command } from "./command.js";
import { DrawingView } from "../drawingView.js";
import { Figure } from "../figures/figure.js"

type ChangeAttributeCommandParam = {
    figure:Figure;
    attribute:string;
    value:any;
}

class ChangeAttributeCommand extends Command{
    #newAttributeValue:any 
    #oldAttributeValue:any
    #AttributeKey     :string
    #figure           :Figure

    /**
     * @param {Object} param
     * @param {Figure} param.figure
     * @param {String} params.attribute
     * @param {*}      params.value
     * 
     * @param {DrawingView} drawingView 
     */
    constructor(param:ChangeAttributeCommandParam,drawingView:DrawingView){
        super();
        const {figure,attribute,value} = param;
        this.#newAttributeValue = value;
        this.#oldAttributeValue = figure.getAttribute(attribute);
        this.#AttributeKey = attribute;
        this.#figure = figure;
    }
    do(){
        this.#figure.setAttribute(this.#AttributeKey, this.#newAttributeValue);
    }
    undo(){
        this.#figure.setAttribute(this.#AttributeKey,this.#oldAttributeValue);
    }
    redo(){
        this.do();
    }
}

export{ChangeAttributeCommand}