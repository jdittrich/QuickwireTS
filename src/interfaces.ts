import { Rect } from "./data/rect";

interface Drawable{
    draw(ctx:CanvasRenderingContext2D):void
}

interface Highlightable{
    getRect():Rect;
}

export {Drawable,Highlightable}