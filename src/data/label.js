class Label{
    #label
    constructor(label){
        if(typeof label !== "string"){
            throw TypeError("labels can only be created from Strings, but parameter was of type "+ typeof label);
        }
        this.#label = label;
    }
    get label(){
        return this.#label
    }
    copy(){
        return new Label(this.#label);
    }
    toJSON(){
        return this.#label;
    }
}

export {Label}
