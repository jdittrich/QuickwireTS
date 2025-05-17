import { Point } from "./point.js";

type RectParam = { 
    width: number; 
    height: number; 
    y: number;
    x: number; 
}

type RectJson = {
    width: number; 
    height: number; 
    y: number;
    x: number; 
}

type RectCorners = {
    topRight:   Point;
    bottomRight:Point;
    bottomLeft: Point;
    topLeft:    Point;
}

class Rect{
    #width:number
    #height: number
    #y: number
    #x:number
    
    /**
     * A rectangle, positioned on a coordinate system
     * Immutable data object, methods might return new instances. 
     */
    constructor(createRectParam: RectParam){
        this.#width = createRectParam.width;
        this.#height = createRectParam.height;
        this.#y = createRectParam.y;
        this.#x = createRectParam.x;
    }

    get right():number{
        return this.#x + this.#width;
    }
    get bottom():number{
        return this.#y + this.#height;
    }
    get top():number{
        return this.#y;
    }
    get left():number{
        return this.#x;
    }
    get x():number{
        return this.#x;
    }
    get y():number{
        return this.#y;
    }
    get height():number{
        return this.#height;
    }
    get width():number{
        return this.#width;
    }

    /**
     * Returns a new rect with the same dimensions
     */
    copy(){
        return new Rect({
            width:  this.#width,
            height: this.#height,
            x:      this.#x,
            y:      this.#y 
        })
    }
    
    /** Get points */

    /**
     * upper left corner point
     */
    getPosition():Point{
        return new Point({
            y:this.y,
            x:this.x
        })
    }

    /**
     * get center point
     * @returns{Point}     
     */
    getCenter(){ 
        return new Point({
            y: this.y + (this.#height/2),
            x: this.x + (this.#width/2)
        })
    }

    /**
     * Returns the corner points
     */
    getCorners():RectCorners{
        const corners = {
            "topRight":new Point({
                "x":this.x + this.width,
                "y":this.y
            }),
            "bottomRight": new Point({
                "x":this.x + this.width,
                "y":this.y + this.height
            }),
            "bottomLeft": new Point({
                "x":this.x,
                "y":this.y + this.height
            }),
            "topLeft": new Point({
                "x":this.x,
                "y":this.y
            })
        };

        return corners;
    }
    
    /**
     * Returns a rectangle with same width, height and the position translated by the coordinates in moveBy
     */
    movedCopy(moveBy:Point):Rect{
        const newPos = this.getPosition().add(moveBy);
        
        return new Rect({
            x:newPos.x,
            y:newPos.y,
            width: this.width,
            height: this.height
        });
    }


    //#region: hit testing
    /**
     * Does this contain the point?
     */
    isEnclosingPoint(point:Point): boolean{
        const isBeyondStartHorizontal = point.x >=  this.x;
        const isNotBeyondEndHorizontal = point.x <= this.x + this.width;
        const isInHorizontalRange = isBeyondStartHorizontal && isNotBeyondEndHorizontal;

        const isBeyondStartVertical = point.y  >= this.y;
        const isNotBeyondEndVertical = point.y  <= this.y  + this.height
        const isInVerticalRange   = isBeyondStartVertical && isNotBeyondEndVertical; 

        return isInHorizontalRange && isInVerticalRange
    }

    /**
     * Does this fully contain the passed rect?
     * Contains means inside not "on", otherwise a rect could contain itself
     */
    isEnclosingRect(rect:Rect): boolean{
        const topIsHigher = this.y < rect.y;
        const bottomIsLower = (this.y + this.height) > (rect.y + rect.height);
        const leftIsMoreLeft = this.x < rect.x;
        const rightIsMoreRight = (this.x+this.width)> (rect.x+rect.width);

        return topIsHigher && bottomIsLower && leftIsMoreLeft && rightIsMoreRight;
    }

    /**
     * is there a partial or full overlap between this and the passed rect?
     */
    isOverlappingRect(rect:Rect):boolean{
        //from: https://stackoverflow.com/a/306332/263398
        const isNotFullyLeftToMe  =  this.x < (rect.x + rect.width); //my left side further left than your right side
        const isNotFullyRightToMe = (this.x + this.width) > rect.x;   //my right side further right than your right side
        const isNotFullyOverMe    =  this.y < (rect.y + rect.height);   // my top side higher than your bottom side
        const isNotFullyBelowMe   = (this.y + this.height) > rect.y;    //my bottom side lower than your top side

        const overlaps = isNotFullyLeftToMe && isNotFullyRightToMe && isNotFullyOverMe && isNotFullyBelowMe;
        return overlaps
    }

    toJSON():RectJson{
        return{
            "x": this.x,
            "y": this.y,
            "height":this.height,
            "width": this.width
        }
    }

    static fromJSON(rectJson:RectJson){
        const {x,y,width,height} = rectJson;
        const rect = new Rect({
            "x":      x,
            "y":      y,
            "width":  width,
            "height": height,
        })
        return rect; 
    }
    /**
     * Creates a Rect from any two points
     */
    static createFromCornerPoints(point1: Point, point2: Point): Rect{
      
          
        const leftmostPosition   = Math.min(point1.x, point2.x);
        const rightmostPosition  = Math.max(point1.x, point2.x);
        const topmostPosition    = Math.min(point1.y, point2.y);
        const bottommostPosition = Math.max(point1.y, point2.y);

        const upperLeftCorner   = new Point({"x":leftmostPosition, "y":topmostPosition});
        const bottomRightCorner = new Point({"x":rightmostPosition,"y":bottommostPosition});
        const dimensions = upperLeftCorner.offsetTo(bottomRightCorner);

        const rectFromCornerPoints = new Rect({
            x:upperLeftCorner.x,
            y:upperLeftCorner.y,
            width: dimensions.x,
            height:dimensions.y
        });

        return rectFromCornerPoints;
    }
}

export {Rect, RectParam, RectJson}