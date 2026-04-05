import { Tool } from "./tool.js"
/**
 * A tool that does nothing, but is a valid tool (NoOp = no operations) 
 */
class NoOpTool extends Tool{
    name = "noOp"
    constructor(){
        super()
    }
}
export {NoOpTool}