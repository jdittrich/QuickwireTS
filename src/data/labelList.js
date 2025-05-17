//import { isIterable } from "../helpers/isIterable.js";
//import { Label } from "./label.js";

/**
 * A list of Labels
 */
class LabelList{
    #labels = [];
    
    //creation
    constructor(arrayOfLabels){
        if(!Array.isArray(arrayOfLabels)){
            throw TypeError("LabelList constructor needs an Array")
        }
        const allEntriesAreStrings = arrayOfLabels.every(label=>(typeof label ==="string"));
        if(!allEntriesAreStrings) {
            throw TypeError("All entries need to be strings, but they are not");
        }
        this.#labels = [...arrayOfLabels];
    }

    //getters
    getLabels(){
        return [...this.#labels];
    }
    
    //Serialization
    toJSON(){
        return {
            "type":"LabelList",
            "labels":this.getLabels()
        }
    }
    static fromJSON(labelListJson){
        const labelList = new LabelList(labelListJson.labels);
        return labelList;
    }
}

export {LabelList}



