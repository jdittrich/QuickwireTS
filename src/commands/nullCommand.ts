import { Command } from "./command.js"

/*Does nothing, undos nothing*/
class NullCommand extends Command{
    name = "null command"
    constructor(){
        super()
    }
    do(){

    }
    undo(){

    }
    redo(){

    }
}

export {NullCommand};