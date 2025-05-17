import { createAllResizeHandles} from "../handles/resizeHandle.js";
import { createListItemToggleHandles} from "../handles/toggleListItemHandle.js";
import {SingleSelectableLabelList} from "../data/singleSelectLabelList.js"

import {Figure, CreateFigureParam} from './figure.js'
import { Rect  } from "../data/rect.js";
import { Point } from "../data/point.js";


type createRadioButtonListFigureParam = CreateFigureParam & {
    radioButtons:SingleSelectableLabelList
}
/**
 * 
 * @param {object} param
 * @param {number} param.y
 * @param {number} param.x 
 * @param {number} param.width
 * @param {number} param.height
 */
class RadioButtonListFigure extends Figure{
    figureType = "RadioButtonListFigure";
    #listEntriesRects = [];  //document rects of single list entries

    /**
     * @param {object} param
     * @param {Rect} param.rect
     * @param {SingleSelectableLabelList} param.radioButtons
     */
    constructor(param:createRadioButtonListFigureParam){
        super(param);
        const radioButtons = param.radioButtons;
        this.registerAttributes({"radioButtons":SingleSelectableLabelList});
        this.setAttribute("radioButtons",radioButtons);
    }

    // getParameters():createRadioButtonListFigureParam{
    //     const baseParameters = this.getBaseParameters();
        
    //     return radioButtonListFigureParameters;
    // }

    //FIXME: number of parameters is ugly. Parameter object or split into functions.
    #drawRadioButton(ctx: CanvasRenderingContext2D, startPos: Point, selected: boolean, label: string,height: number): Rect{
        //set constants
        const radioRadius = 5;
        const radioSelectionRadius = 3;

        //derive needed relative values (as if startPos is 0,0)
        const relativeRadioCenter = new Point({
            "x": radioRadius,
            "y": height/2
        });

        const absoluteRadioCenter = relativeRadioCenter.add(startPos);
        
        //define paths
        const radioCircle = new Path2D(); 
        radioCircle.arc(absoluteRadioCenter.x, absoluteRadioCenter.y, radioRadius, 0, 2 * Math.PI, false);
        
        const radioSelection = new Path2D(); 
        radioSelection.arc(absoluteRadioCenter.x, absoluteRadioCenter.y, radioSelectionRadius, 0, 2 * Math.PI, false);

        //draw things:
        ctx.stroke(radioCircle);
        if(selected){
            ctx.fill(radioSelection);
        }
        
        ctx.fillText(label, startPos.x + radioRadius*2 +10 , startPos.y + (height*0.70));

        const positionRect = Rect.createFromCornerPoints(
            startPos,
            new Point({
                x: startPos.x + radioRadius*2,
                y: startPos.y + height
            })
        );

        return positionRect; 
        /*
        this is currently somewhat ugly. 
        I could map over the function, but this would mean that I have a map with side effects. 
        I could also have the function write to its index of this.#listEntriesRects but it knowing its index is also ugly. 
        I could have a function that does calculate the values and returns them and another that draws them. Does not work if text pushes the next thing...
        
        Probably best to have an area for the list that has predetermined height and width? Oh well, that does not work with tabs, again.
        But probably best to have a list component or the like that considers list stuff? 
        */
    }
    drawFigure(ctx){
        const {width,height,x,y} = this.getRect();
        this.#listEntriesRects = [];
        let startPos = new Point({
            "x":x,
            "y":y
        });
        const listItemHeight = 20;
        const radioButtons = this.getAttribute("radioButtons");
        const labelList = radioButtons.getLabels();
        const selectedIndex = radioButtons.getSelectedIndex();

        labelList.forEach((entry,index)=>{
            const selected = (index === selectedIndex);
            const currentRect = this.#drawRadioButton(ctx,startPos,selected,entry,listItemHeight)
            this.#listEntriesRects.push(currentRect);
            startPos = startPos.add(
                new Point({
                    "x":0,
                    "y":listItemHeight
                })
            );
        });
    }

    getHandles(drawingView){
        const resizeHandles = createAllResizeHandles(this, drawingView);
        const listItemToggleHandles = createListItemToggleHandles(this,drawingView);
        return [...resizeHandles,...listItemToggleHandles];
    }
    
    getListEntryRects(){
        return [...this.#listEntriesRects];
    }

    copy():RadioButtonListFigure{
        const baseParameters = this.copyBaseParameters();
        const radioButtonListFigureParameters = {
            ...baseParameters,
            radioButtons: this.getAttribute("radioButtons").copy()
        }
        const radioButtonListFigureCopy = new RadioButtonListFigure(radioButtonListFigureParameters);
        return radioButtonListFigureCopy;
    }

   /**
    * @see {Figure.toString}
    */
    toString(): string{
       const {x,y,width,height} = this.getRect();
       const containedFigures = this.getContainedFigures();
       const type = this.constructor.name;
       const rectFigureString = `x:${x}, y:${y}, width:${width}, height:${height}, number of contained figures:${containedFigures.length},type:${type}`;
       return rectFigureString;
       
    }
    

    toJSON(){
        const rectJson = this.getRect().toJSON();
        const containedFiguresJson = this.getJsonOfContainedFigures();
        const rectFigureJson =  {
            "type": this.figureType,
            "rect": rectJson,
            "containedFigures":containedFiguresJson,
            "radioButtons":this.getAttribute("radioButtons").toJSON()
        }
        return rectFigureJson;
    }

    /**
     * created a figure from a JSON
     * @param {JSON} figureJson 
     */
    // static fromJSON(figureJson,nameFigureClassMapper){
    //     const containedFigureObjects = super.createContainedFiguresFromJson(figureJson,nameFigureClassMapper);
        
    //     const radioButtonListFigure = new RadioButtonListFigure({
    //         "rect":Rect.fromJSON(figureJson.rect),
    //         "containedFigures": containedFigureObjects,
    //         "radioButtons":SingleSelectableLabelList.fromJSON(figureJson.radioButtons)
    //      });

    //      return radioButtonListFigure;
    // }

    /**
     * @returns {RadioButtonListFigure}
     */
    static createWithDefaultParameters(): RadioButtonListFigure{
        const radioButtonListFigure = new RadioButtonListFigure({
            rect: new Rect({
                "x":0,
                "y":0,
                "width":100,
                "height":50
            }),
            "radioButtons": new SingleSelectableLabelList(["one","two","three", "four", "five"],0)
            });
        return radioButtonListFigure;
    }
}

export {RadioButtonListFigure, createRadioButtonListFigureParam}