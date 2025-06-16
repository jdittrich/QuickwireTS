import { Label } from "./label";

/**
 * A list of Labels
 */
type LabelListParam = {"labels":string[]}
type LabelListJson = {
    "labels":string[]
}
type Labels = string[];

class LabelList{
    #labels = [];
    
    //creation
    constructor(param:LabelListParam){
        this.#labels = [...param.labels];
    }

    //getters
    get labels():Labels{
        return [...this.#labels];
    }

    copy():LabelList{
        return new LabelList({"labels":this.labels});
    }
    toString():string{
        const labelString = this.#labels.join(",");
        return labelString;
    }
    //Serialization
    toJSON():LabelListJson{
        return {
            "labels":this.labels
        }
    }
    static fromString(labeListString:string){
        const labelArray = labeListString.split(",");
        const labelList =  new LabelList({labels:labelArray});
        return labelList;
    }
    static fromJSON(labelListJson):LabelList{
        const labelList = new LabelList({
            labels:labelListJson.labels
        });
        return labelList;
    }
}

export {LabelList, LabelListJson, LabelListParam}



