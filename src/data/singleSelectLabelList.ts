import { LabelList, LabelListParam, LabelListJson } from "./labelList.js";

type SingleSelectLabelListParam = LabelListParam & {
    "selectedIndex":number
}

type SingleSelectLabelListJson = LabelListJson & {
    selectedIndex:number
}

/**
 * e.g. for radio buttons and tabs
 */
class SingleSelectLabelList extends LabelList{
    #selectedIndex = 0; 

    constructor(param:SingleSelectLabelListParam){
        super(param);
        const {selectedIndex, labels} = param;
        //guards
        if(!Number.isInteger(selectedIndex)){
            throw new TypeError("selected index must be an integer");
        }
        if(selectedIndex<0){
            throw new Error("Selected item index can't be smaller than 0")
        }
        if(selectedIndex > labels.length-1){
            throw new Error(`Selected item index can't exceed list length. Max index is ${labels.length-1} but was ${selectedIndex}.`);
        }

        //assignment
        this.#selectedIndex = selectedIndex;
    }
    /**
     * @returns {Number}
     */
    get selectedIndex(){
        return this.#selectedIndex;
    }

    /**
     * @returns {String}
     */
    get selectedLabel(){
        return this.labels[this.#selectedIndex];
    }

    /**
     * returns a copy of the list. Pass parameters to overwrite parameters
     * @param {object} param 
     * @param {String[]} param.labels
     * @param {Number} param.index
     * @returns 
     */
    copy(){
        // const selectedIndex = overwrites.selectedIndex ?? this.getSelectedIndex();
        // const labels = overwrites.labels ?? this.getLabels();
        const singleSelectLabelList = new SingleSelectLabelList({labels:this.labels,selectedIndex:this.selectedIndex});
        return singleSelectLabelList;
    }
    toString(): string {
        const unselectedEntries = this.labels;
        const selectedIndex = this.selectedIndex;
        const entryToSelect = unselectedEntries[selectedIndex];
        const selectedEntry = "*"+entryToSelect;
        const selectedEntries = unselectedEntries.toSpliced(selectedIndex,1,selectedEntry);
        const singleSelectLabelString = selectedEntries.join(",")
        return singleSelectLabelString;
    }
    
    toJSON(){
        return {
            "labels":this.labels,
            "selectedIndex":this.#selectedIndex
        }
    }
    static fromString(string:string){
        const splitString = string.split(","); 
        const trimmedEntries = splitString.map(entry=> entry.trim());
        const cleanedEntries = trimmedEntries.map(entry=>entry.replace(/^\*/,"")); //remove leading *, indicator for selection
        const selectedIndex = trimmedEntries.findIndex(entry=>entry.startsWith("*"));
        
        const singleSelectLabelList = new SingleSelectLabelList({
            labels:cleanedEntries,
            selectedIndex:selectedIndex
        });

        return singleSelectLabelList;
    }
    static fromJSON(singleSelectListJson:SingleSelectLabelListJson){
        const {labels, selectedIndex} = singleSelectListJson;
        const singleSelectableLabelList = new SingleSelectLabelList({
            labels:labels,
            selectedIndex:selectedIndex
        });
        return singleSelectableLabelList;
    }
}

export {SingleSelectLabelList, SingleSelectLabelListJson}