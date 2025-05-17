import {Figure} from "./figures/figure.js"

class Selection{
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

    clear():void{
        this.#selectedFigure = null; 
    }

    hasSelection(): boolean{
        const hasSelection = !!this.#selectedFigure;
        return hasSelection;
    }

    isSelected(figure: Figure): boolean{
        const isSelected = (figure === this.#selectedFigure);
        return isSelected;
    }
}

export {Selection};
