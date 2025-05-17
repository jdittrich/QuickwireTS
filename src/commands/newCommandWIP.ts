import { Figure } from "../figures/figure.js";
import { Point } from "../data/point.js";

interface Command {
    do():void
}

interface Previewable {
    preview():void
}

interface Undoable {
    undo():void
    redo():void
}




type SelectCommandParameters = {
    FiguresToSelect:Figure[]
}

class SelectCommand implements Command {
    constructor(FiguresToSelect, selection){

    }
    do(){

    }
}


type MoveCommandParameters = {
    figuresToMove:Figure[];
    moveBy:Point;
}

class MoveCommand implements Command, Undoable {
    constructor(param:MoveCommandParameters,document){

    }
    do(){

    }
    undo(){

    }
    redo(){

    }
    static preview(param:MoveCommandParameters,previewer:FigurePreviewer){

    }
}

class FigurePreviewer extends Figure{
    
}
