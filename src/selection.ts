import {Figure} from "./figures/figure.js"
import { SelectionManager } from "./interfaces.js";

class Selection implements SelectionManager{
    #selectedFigure:Figure|null = null;
    constructor(){}
    /**
     * gets selected figure (if existing)
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
