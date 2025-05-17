import { getConstructorName } from "../helpers/getConstructorName.js";

/**

 * Manages Key/Value pairs.
 * Any possible key and its type must be registered before setting it via register, like this: register({"isSelected":Boolean})
 */
class FigureAttributes{
    #keyTypes = new Map()
    #attributes = new Map();

    constructor(){}
    set(key:string,value:any){
        this.#checkKeyValue(key,value);
        this.#attributes.set(key,value);
    }
    get(key:string){
        this.#checkKey(key);
        const attributeValue = this.#attributes.get(key);
        return attributeValue;
    }
    /**
     * Registers additional allowed keys.
     * Usually called in constructor.
     * @param {object} attributeTypes - having Key:Constructor pairs, i.e.  
     */
    register(attributeTypes){
        //entries returns an array of [key,value]
        const keyTypePairs = Object.entries(attributeTypes);
        keyTypePairs.forEach((value) =>{
            if(typeof value[1] !== "function"){
                throw new TypeError("Attributes types must be a constructor, i.e. typeof === \'function\' and callable with the new operator");
            }
            this.#keyTypes.set(value[0],value[1]);
        });
    }
    #checkKey(keyname){
        if(typeof keyname !== "string"){
            throw new TypeError("key needs to be of type string")
        } else if(!this.#keyTypes.has(keyname)){
            throw new Error(`key ${keyname} was not found in the list of registered keys`)
        } 
    }
    #checkKeyValue(key,value){
        this.#checkKey(key);

        const expectedConstructor = this.#keyTypes.get(key);
        const actualConstructor = value.constructor;
        
        if(expectedConstructor !== actualConstructor){
            throw new Error(`Mismatch between expected constructor ${expectedConstructor.name} and actual constructor of value, ${expectedConstructor.name}`);
        } 
    }
}

export {FigureAttributes}