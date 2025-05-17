type PointParam = {
    x:number,
    y:number
}

type PointJSON = {
    x:number,
    y:number
}

class Point{
    #x:number;
    #y:number;

    constructor(pointParam:PointParam){
        this.#y = pointParam.y; 
        this.#x = pointParam.x;
    }

    get x():number{
        return this.#x;
    }

    get y():number{
        return this.#y;
    }

    copy(): Point{
        const pointCopy = new Point({
            x:this.x,
            y:this.y
        })
        return pointCopy;
    }
    
    sub(point:Point){
        return new Point({
            x: this.x - point.x,
            y: this.y - point.y
        });
    };
    
    add(point:Point): Point{
        return new Point({
            x: this.x + point.x,
            y: this.y + point.y
        });
    };

    /**
     * Creates inverse, i.e. adding this to a vector should create a point at 0,0;
     */
    inverse(): Point{
        return new Point({
            x: -1 * this.x,
            y: -1 * this.y
        });
    }
    
    /**
     * Get the offset you need to add to the passed point to get to this.
     * Alias for sub. 
     */
    offsetFrom(point: Point): Point{
        return this.sub(point);
    }

    /**
     * get the offset you need to add to this to go to the passed point.
     */
    offsetTo(point: Point): Point{
        return point.sub(this)
    }
    
    toJSON():PointJSON{
        const pointJson = {
            "x":this.x,
            "y":this.y
        } 
        return pointJson;
    }
    static fromJSON(pointJson:PointJSON):Point{
        const point = new Point({
            "x": pointJson.x,
            "y": pointJson.y
        }) 
        return point;
    }
}

export {Point}