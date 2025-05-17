/**
 * Extend to create new Commands
 *  
 * While commands can take any number of parameters, the standard is passing a parameter obejct
 * 
 * Usually redo() just calls do(). 
 */
class Command{
    constructor(){}
    do(){}
    undo(){}
    redo(){}
}

// Composite Command: allows to combine several commands, with start/end transactions: 
// See https://freegroup.github.io/draw2d/index.html#/api/draw2d/command/commandstack

// Maybe have Command → UndoableCommand, since we might want to have something like commands for creating selections etc. 


export {Command}