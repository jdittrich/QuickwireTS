import { DrawingView } from "../drawingView.js";
import { Command } from "./command.js";

class CommandStack extends EventTarget{
    #undoStack:Command[] = []
    #redoStack:Command[] = []

    /**
     * Are there commands that can be undone?
     */
    canUndo():boolean{
        const canUndo = this.#undoStack.length > 0 ? true:false;
        return canUndo;
    }

    /**
     * Are there commands that can be redone (after an undo?)
     */
    canRedo(): boolean{
        const canRedo = this.#redoStack.length > 0 ? true:false;
        return canRedo
    }

    /**
     * Runs the command and puts in on the list of undoable actions
     */
    do(command: Command):void{
        command.do();
        this.#undoStack.unshift(command);
        this.#redoStack = [] //every new command flushes redo
    }

    /**
     * Undoes the most recent command and pushes it on redo list
     */
    undo():void{
        if(this.canUndo() === false){return} //this fails silently… good or bad?
        const commandToUndo = this.#undoStack.shift();
        commandToUndo.undo();
        this.#redoStack.unshift(commandToUndo);
    }

    /**
     * Redoes the most recently undone command and pushes it back on the undo list. 
     */
    redo():void{
        if(this.canRedo()=== false){return}
        const commandToRedo = this.#redoStack.shift();
        commandToRedo.redo();
        this.#undoStack.unshift(commandToRedo);
    }
}

export {CommandStack}