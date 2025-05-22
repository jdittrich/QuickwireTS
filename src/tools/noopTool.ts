import { AbstractTool } from "./abstractTool.js"
import {LocalDragEvent, LocalMouseEvent} from '../events.js'

/**
 * A tool that does nothing, but is a valid tool (NoOp = no operations) 
 */
class NoOpTool extends AbstractTool{
    name = "noOp"
    constructor(){
        super()
    }
}

export {NoOpTool}