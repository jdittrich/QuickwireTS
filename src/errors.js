
class SubclassShouldImplementError extends Error{
    /**
     * 
     * @param {String} method 
     * @param {String} name of currentClass that the method was called on
     */
    constructor(methodName, className){
        const message = `Method ${methodName} called on ${className}, but ${methodName} should be implemented by subclasses`;
        super(message);
        this.name = "subclassShouldImplementError"
    }
}

export {SubclassShouldImplementError}