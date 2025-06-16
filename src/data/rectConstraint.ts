import {Point} from "./point.js";
import {Rect} from  "./rect.js";


type Outer = [number, number]; //dimensions of the outer rectangle: left and right or top and bottom.

//all the variants of what the constraints in one dimension could be: 
type OneIsNull = 
    [number, number, null] | 
    [number, null, number] | 
    [null, number, number] ;
type AllAreNull = [null,null,null];
type CenteredIsNull = [null,number,null];
type FirstTwoNull = [null,null, number];
type LastTwoNull = [number,null,null];

// merge all possible variants in one type
type InnerConstraints = OneIsNull|AllAreNull|CenteredIsNull|FirstTwoNull|LastTwoNull;

// signature for a function that returns the derived values in one dimension (that is [top, bottom] or [left,right])
type ConstraintStrategy = (outer:Outer, innerConstraints:InnerConstraints) => [number,number]


type CreateRectConstraintParam = {
    vertical:InnerConstraints,
    horizontal: InnerConstraints
}

// helpers  for different strategies to derive values.
function midPoint(val1:number, val2:number){
    const middlePoint = ((val1+val2)/2)
    return  middlePoint; 
}

function divideInThirds(val1:number, val2:number):[number,number]{
    const smallerPoint = Math.min(val1,val2);
    const biggerPoint = Math.max(val1,val2);
    const aThird = (biggerPoint-smallerPoint)/3;
    const firstPoint = smallerPoint + aThird
    const secondPoint = smallerPoint + (aThird*2);
    return [firstPoint, secondPoint];
}


/**
 * Constraint strategies: 
 * 
 * The following strategies use "near" and "far". What are these?
 * When your coordinate origin is upper-left, then 
 * horizontally, near is left and far is right: left is nearer to the coordinate origin, right is farther.
 * vertically, near is top and far is bottom. 
 */

const centeredStrategy:ConstraintStrategy=function(outer,innerConstraints:CenteredIsNull){
    const innerNear = midPoint(outer[0],outer[1]) - (innerConstraints[1]/2);
    const innerFar  = midPoint(outer[0],outer[1]) + (innerConstraints[1]/2);
    return [innerNear,innerFar];
}

const midPointFar:ConstraintStrategy= function(outer,innerConstraints:LastTwoNull){
    const innerNear = outer[0]+innerConstraints[0];
    const innerFar= midPoint(innerNear,outer[1]);
    return [innerNear, innerFar];
}

const midPointNear:ConstraintStrategy= function(outer,innerConstraints:FirstTwoNull){
    const innerFar = outer[1]-innerConstraints[2];
    const innerNear = midPoint(outer[0],innerFar);
    return [innerNear, innerFar];
}

//one values is null, it is calculated
const fixedStrategy:ConstraintStrategy = function(outer,innerConstraints:OneIsNull){
    const innerNear =  
        innerConstraints[0] != null ? // is left defined? 
            outer[0]  + innerConstraints[0] // left defined: add distanced from the left
        : outer[1] - innerConstraints[2] - innerConstraints[1]; //left not defined: substract distanced from right  
            
    const innerFar = 
        innerConstraints[2] != null ?
          outer[1] - innerConstraints[2]
        : outer[0]  + innerConstraints[0] + innerConstraints[1];
    
    return [innerNear,innerFar]
}

const  thirdsStrategy:ConstraintStrategy= function(outer, innerConstraints:AllAreNull){
    const thirdsPoints = divideInThirds(outer[0], outer[1]);
    return thirdsPoints;
}

class RectConstraint{
    #vertical:InnerConstraints
    #horizontal:InnerConstraints
    #verticalStrategy:ConstraintStrategy
    #horizontalStrategy:ConstraintStrategy

    #pickStrategy(constraints:InnerConstraints):(outer:Outer, innerConstraints:InnerConstraints) => [number,number]{
        const countNullishValues = constraints.filter(value => value == null).length;
        if(countNullishValues===1){
            return fixedStrategy;
        }else if(!constraints[0] && constraints[1] && !constraints[2]){
        //only center value defined: center fixed length element
            return centeredStrategy
        } else if (!constraints[0] && !constraints[1] && !constraints[2]){
        //no value defined: equal division in thirds
            return thirdsStrategy
        } else if(!constraints[0] && !constraints[1] && constraints[2]){
            return midPointNear;
        } else if(constraints[0] && !constraints[1] && !constraints[2]){
            return midPointFar;
        }  else if (constraints[0] && constraints[1] && constraints[2]){
        //all values are defined
            throw new Error("at least one element in the constraints array needs to be nullish")
        } else {
            throw new Error("this should not be reachable");
        }

    }
    constructor(param:CreateRectConstraintParam){
        
        this.#vertical = param.vertical;
        this.#horizontal = param.horizontal;

        this.#verticalStrategy = this.#pickStrategy(param.vertical);
        this.#horizontalStrategy = this.#pickStrategy(param.horizontal);

    }

    deriveRect(outerRect:Rect):Rect{
            const horizontalValues = this.#horizontalStrategy([outerRect.left,outerRect.right], this.#horizontal);

            const left =  horizontalValues[0];
            const right = horizontalValues[1];

            const verticalValues = this.#verticalStrategy([outerRect.top,outerRect.bottom],this.#vertical);

            const top = verticalValues[0];
            const bottom = verticalValues[1];
            
            const innerRect = Rect.createFromCornerPoints(
                new Point({"x":left, "y":top}),
                new Point({"x":right, "y":bottom})
            );
    
            return innerRect;
    }


    /**
     * Creates a constraint based on two rects and passing for 
     * the vertical and horizontal dimension 
     * which property should be calculated 
     * (rather than kept constant) 
     */
    static fromRects(outerRect: Rect,innerRect: Rect,calculateVertical: "top"|"height"|"bottom",calculateHorizontal: "left"| "width"| "right"){
        // Set value to null, if it is to be calculated by the constraint, 
        // if it is to be kept constant instead, you can derive it from the rectangles
        const topDistance    = calculateVertical   === "top"     ? null : innerRect.top - outerRect.top;
        const heightDistance = calculateVertical   === "height"  ? null : innerRect.height;
        const bottomDistance = calculateVertical   === "bottom"  ? null : outerRect.bottom - innerRect.bottom; 
        const leftDistance   = calculateHorizontal === "left"    ? null : innerRect.left - outerRect.left;
        const widthDistance  = calculateHorizontal === "width"   ? null : innerRect.width;
        const rightDistance  = calculateHorizontal === "right"   ? null : outerRect.right - innerRect.right;

        const constraint = new RectConstraint({
            vertical:[topDistance,heightDistance,bottomDistance] as InnerConstraints,
            horizontal:[leftDistance,widthDistance,rightDistance] as InnerConstraints
        });
        return constraint;
    }
    static fromJSON(json){
        const rectConstraint = new RectConstraint(json);
        return rectConstraint;
    }
    toJSON(){
        const replaceUndefinedWithNull = value=> value === undefined? null:value;
        const horizontal = this.#horizontal.map(replaceUndefinedWithNull);
        const vertical   = this.#vertical.map(replaceUndefinedWithNull);
        return {
            "horizontal": horizontal,
            "vertical"  : vertical
        }
    }
}


export {RectConstraint, fixedStrategy,midPointFar,midPointNear,centeredStrategy}