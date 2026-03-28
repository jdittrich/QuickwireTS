import {Point} from './point.js';

type CreateHorizontalLineParam = {
    top:number;
    horizontal1:number;
    horizontal2:number;
}

type HorizontalLineJson = {
    top: number; 
    horizontal1: number; 
    horizontal2: number;
}

class HorizontalLine{
    // this makes only horizontal lines expressable by the data
    // If I had length rather than left, right, resizes in one direction (away from origin) would be easier, but the other would need calculations
    top:number
    left:number
    right:number

    constructor(param:CreateHorizontalLineParam){
        //the horizontal positions can be in any order, we sort them
        const {left, right} = HorizontalLine.#sortLeftRight(param.horizontal1,param.horizontal2)
        const {top} = param;
        this.left  = left;
        this.right = right;
        this.top = top;
    }
    get leftPoint():Point{
        const leftPoint = new Point({
            x:this.left,
            y:this.top
        });
        return leftPoint
    }
        get rightPoint(){
        const rightPoint = new Point({
            x:this.right,
            y:this.top
        });
        return rightPoint
    }
    get bottom(){
        return this.top;
    }
   
    movedCopy(moveBy:Point):HorizontalLine{
        const updatedLeft  = this.left + moveBy.x;
        const updatedRight = this.right + moveBy.x;
        const updatedTop   = this.top + moveBy.y;
        const movedLine = new HorizontalLine({horizontal1:updatedLeft, horizontal2:updatedRight, top:updatedTop});
        return movedLine;
    }
    copy(){
        const horizontalLineCopy = new HorizontalLine({
            top:this.top,
            horizontal1:this.left,
            horizontal2:this.right
        });
        return horizontalLineCopy
    }
    toJSON():HorizontalLineJson{
        const horizontalLineJSON = {
            top:this.top,
            horizontal1:this.left,
            horizontal2:this.right
        }
        return horizontalLineJSON;
        
    }
    static fromJSON(json:HorizontalLineJson){
        const horizontalLine = new HorizontalLine({
            top:json.top,
            horizontal1:json.horizontal1,
            horizontal2:json.horizontal2
        })
        return horizontalLine;
    }

    static createFromPoints(point1:Point,point2:Point){
        const param = this.#paramFromPoints(point1,point2);
        const horizontalLine = new HorizontalLine(param);
        return horizontalLine;
    }
    static #paramFromPoints(point1:Point,point2:Point):CreateHorizontalLineParam{
        const {left,right} = this.#sortLeftRight(point1.x,point2.x);
        const {top,bottom} = this.#sortTopBottom(point1.y,point2.y);
        return {
            "horizontal1":left,
            "horizontal2":right,
            "top":bottom //lowermost point decides position
        }
    }
    static #sortLeftRight(point1:number,point2:number){
        const sorted = this.#sort(point1,point2)
        return {left:sorted[0],right:sorted[1]};
    }
    static #sortTopBottom(point1:number,point2:number){
        const sorted = this.#sort(point1,point2)
        return {top:sorted[0],bottom:sorted[1]}
    }
    static #sort(point1:number,point2:number){
        const unsorted = [point1,point2]
        const sorted = unsorted.toSorted()
        return sorted;
    }
    
}

export {HorizontalLine, CreateHorizontalLineParam, HorizontalLineJson}