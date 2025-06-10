import { Figure, CreateFigureParam, FigureJson} from "./figure.js";
import { Rect } from "../data/rect.js";
import { Point } from "../data/point.js";
import { DrawingView } from "../drawingView.js";
import { Handle } from "../handles/handle.js";
import { EditTextHandle} from '../handles/editTextHandle.js';
import { ToggleAttributeHandle } from "../handles/toggleAttributeHandle.js";

import { CheckboxElement, RadioElement ,  LabelElement } from "./figureElements.js";
import { RectConstraint } from "../data/rectConstraint.js";

//=========================
type CreateToggleParam = CreateFigureParam & {
    label:string,
    isSelected:boolean
}

type ToggleFigureJson = FigureJson & {
    "label": string;
    "isSelected": boolean;
}


type CreateCheckboxParam = CreateToggleParam

type CheckboxFigureJson = ToggleFigureJson

class CheckboxFigure extends Figure{
    name="CheckboxFigure"
    #labelAttrName = "label";
    #isSelectedAttrName = "isSelected";

    constructor(param:CreateCheckboxParam){
        super(param);

        new CheckboxElement(this,{
            attributeName:this.#isSelectedAttrName,
            isSelected:true,
            rectConstraint: new RectConstraint({vertical:[null,16,null], horizontal:[0,16,null]})
        });

        new LabelElement(this,{
            attributeName:this.#labelAttrName,
            rectConstraint: new RectConstraint({vertical:[null,16,null], horizontal:[16+10,null,0]}),
            labelText: "a checkbox!"
        });
    }
    drawFigure(ctx: CanvasRenderingContext2D): void {
        super.drawFigure(ctx);
    }
    getHandles(drawingView: DrawingView): Handle[] {
        const handles = super.getHandles(drawingView);
        return handles;
    }
    getParameters(): CreateCheckboxParam {
        const baseParameters = super.getParameters();
        const checkboxFigureParameters:CreateCheckboxParam = {
            ...baseParameters,
            label: this.getAttribute(this.#labelAttrName),
            isSelected:this.getAttribute(this.#isSelectedAttrName)
        }
        return checkboxFigureParameters;
    }
    toString(): string {
        const baseString = super.toString();
        const label = this.getAttribute(this.#labelAttrName);
        const isSelected = this.getAttribute(this.#isSelectedAttrName);
        const checkboxFigureString = baseString+`label:${label}, isSelected:${isSelected}`;
        return checkboxFigureString;
    }

    toJSON(): CheckboxFigureJson {
        const baseJson = super.toJSON();

        const checkboxFigureJson =  {
            ...baseJson,
            label: this.getAttribute(this.#labelAttrName),
            isSelected: this.getAttribute(this.#isSelectedAttrName)
        }
        return checkboxFigureJson;
    }
    static createWithDefaultParameters(){
        const checkboxFigure = new CheckboxFigure({
            "rect": new Rect({
                "x":0,
                "y":0,
                "width":150,
                "height":40
            }),
            label:"a checkmark!",
            isSelected:true
        });
        return checkboxFigure;
    }

}

type CreateRadiobuttonParam = CreateToggleParam;
type RadiobuttonFigureJson = ToggleFigureJson

class RadiobuttonFigure extends Figure{
    name="RadiobuttonFigure"
    #labelAttrName = "label";
    #isSelectedAttrName = "isSelected";

    constructor(param:CreateCheckboxParam){
        super(param);

        new RadioElement(this,{
            attributeName:this.#isSelectedAttrName,
            isSelected:true,
            rectConstraint: new RectConstraint({vertical:[null,16,null], horizontal:[0,16,null]})
        });

        new LabelElement(this,{
            attributeName:this.#labelAttrName,
            rectConstraint: new RectConstraint({vertical:[null,16,null], horizontal:[16+10,null,0]}),
            labelText: "a radiobutton!"
        });
    }
    drawFigure(ctx: CanvasRenderingContext2D): void {
        super.drawFigure(ctx);
    }
    getHandles(drawingView: DrawingView): Handle[] {
        const handles = super.getHandles(drawingView);
        return handles;
    }
    getParameters(): CreateRadiobuttonParam {
        const baseParameters = super.getParameters();
        const radioFigureParameters:CreateRadiobuttonParam = {
            ...baseParameters,
            label: this.getAttribute(this.#labelAttrName),
            isSelected:this.getAttribute(this.#isSelectedAttrName)
        }
        return radioFigureParameters;
    }
    toString(): string {
        const baseString = super.toString();
        const label = this.getAttribute(this.#labelAttrName);
        const isSelected = this.getAttribute(this.#isSelectedAttrName);
        const checkboxFigureString = baseString+`label:${label}, isSelected:${isSelected}`;
        return checkboxFigureString;
    }

    toJSON(): RadiobuttonFigureJson {
        const baseJson = super.toJSON();

        const radiobuttonFigureJson =  {
            ...baseJson,
            label: this.getAttribute(this.#labelAttrName),
            isSelected: this.getAttribute(this.#isSelectedAttrName)
        }
        return radiobuttonFigureJson;
    }
    static createWithDefaultParameters(){
        const radiobuttonFigure = new RadiobuttonFigure({
            "rect": new Rect({
                "x":0,
                "y":0,
                "width":150,
                "height":40
            }),
            label:"a radio button!",
            isSelected:true
        });
        return radiobuttonFigure;
    }

}

export {CreateToggleParam, CheckboxFigure , CreateCheckboxParam, RadiobuttonFigure, CreateRadiobuttonParam}