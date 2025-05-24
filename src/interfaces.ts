import { Rect } from "./data/rect";
import { Point } from "./data/point";
import { AbstractTool } from "./tools/abstractTool";
import { Figure } from "./figures/figure";
import { Command } from "./commands/command";

interface Drawable{
    draw(ctx:CanvasRenderingContext2D):void
}

interface Highlightable{
    getRect():Rect;
}

interface ToolManager {
    changeTool(tool:AbstractTool):void;
    changeToolByName(toolname:string):void;
}

interface Previewer {
    getPreviewedFigure():Figure;
    startPreviewOf(Figure):void;
    endPreview():void;
}

interface Highlighter{
    startHighlightOf(element:Highlightable):void;
    endHighlight():void;
}

interface CommandManager {
    do(command:Command):void;
    undo():void;
    redo():void;
    canUndo():boolean;
    canRedo():boolean;
}

interface SelectionManager{
    select(figure:Figure):void;
    clearSelection():void;
    hasSelection():boolean;
    getSelection():Figure;
}

interface ViewTransformerConversions {
    screenToDocumentPosition(screenPoint:Point):Point;
    documentToScreenPosition(documentPoint:Point):Point;
    screenToDocumentRect(screenRect:Rect):Rect;
    documentToScreenRect(documentRect:Rect):Rect;
    documentToScreenDistance(documentDistance:Point):Point
    screenToDocumentDistance(screenDistance:Point):Point
}
export {Drawable,Highlightable, Highlighter, ToolManager, Previewer,  CommandManager, SelectionManager, ViewTransformerConversions}