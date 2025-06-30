import { Rect } from "../data/rect.js";
import { RectConstraint } from "../data/rectConstraint.js";
import { Figure, CreateFigureParam, FigureJson } from "./figure.js";
import { HorizontalTabsElement, CreateSingleSelectElementParam } from "./figureElements/singleSelectElement.js";
import { Handle } from "../handles/handle.js";
import { SingleSelectLabelList, SingleSelectLabelListJson } from "../data/singleSelectLabelList.js";
import { DrawingView } from "../drawingView.js";

type CreateHorizontalTabsParam = CreateFigureParam & {
    selectableLabels:SingleSelectLabelList
}

type HorizontalTabsFigureJson = FigureJson & {
    selectableLabels:SingleSelectLabelListJson
};

class HorizontalTabsFigure extends Figure{
    name = "HorizontalTabsFigure";

    labelsAttrName:string = "selectableLabels";
    tabsElement:HorizontalTabsElement
    constructor(param:CreateHorizontalTabsParam){
        super(param);
        const horizontalTabsParam:CreateSingleSelectElementParam = {
            attributeName:this.labelsAttrName,
            rectConstraint:new RectConstraint({vertical:[0,null,0], horizontal:[0,null,0]}),
            labelText: param.selectableLabels
        }
        this.tabsElement = new HorizontalTabsElement(this,horizontalTabsParam);
    };

    drawFigure(ctx:CanvasRenderingContext2D){
        this.tabsElement.draw(ctx);
    }

    
    getHandles(drawingView:DrawingView):Handle[]{
        const handles =  super.getHandles(drawingView);
        return handles;
    }
    
   /**
    * @see {Figure.toString}
    */
   toString(): string{
        const baseString = super.toString();
        const labels = this.getAttribute(this.labelsAttrName);
        const horizontalTabsFigureString = baseString+`selectable labels:${labels.toString()}`;
        return horizontalTabsFigureString;
    }
    getParameters():CreateHorizontalTabsParam{
        const baseParameters = super.getParameters();
        const horizontalTabsParam = {
            ...baseParameters,
            selectableLabels:this.getAttribute(this.labelsAttrName)
        }
        return horizontalTabsParam;
    }

    /**
     * Serializes figure to JSON
     * @returns {object} as json
     */
    toJSON(): HorizontalTabsFigureJson{
        const baseJson = super.toJSON();

        const selectableLabels = this.getAttribute(this.labelsAttrName);

        const horizontalTabsFigureFigureJson =  {
            ...baseJson,
            selectableLabels:selectableLabels.toJSON()
        }
        return horizontalTabsFigureFigureJson;
    }

    static createWithDefaultParameters(){
        const horizontalTabsFigure = new HorizontalTabsFigure({
            "rect": new Rect({
                "x":0,
                "y":0,
                "width":300,
                "height":30
            }),
            selectableLabels: new SingleSelectLabelList({
                labels:["first","second/selected!","third"],
                selectedIndex:1
            })
        });
        return horizontalTabsFigure;
    }
}

export {HorizontalTabsFigure, CreateHorizontalTabsParam, HorizontalTabsFigureJson}