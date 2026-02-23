import {Figure} from "./figures/figure.js"
import { SelectionManager } from "./interfaces.js";

class Selection implements SelectionManager{
    #selectedFigure:Figure|null = null;
    constructor(){}
    /**
     * gets selected figure (if existing). Should return null figure?
     */
    getSelection():Figure|null{
        return this.#selectedFigure;
    }

    select(figure:Figure):void{
        this.#selectedFigure = figure;
    }

    clearSelection():void{
        this.#selectedFigure = null; 
    }

    hasSelection(): boolean{
        const hasSelection = !!this.#selectedFigure;
        return hasSelection;
    }
}

export {Selection};
