
import {Rect} from  "./rect.js";


type SegmentJson = {
    start: number|null; 
    end: number|null;
}

/**
 * A class for a segment i.e. is has a start and end (and a distance derived from them)
 */
class Segment{
    #start:number
    #end:number
    /**
     * Takes two numbers. Called start and end to avoid the abstract num1, num2;
     * if end<start, they will be swapped, so that start on a Distance is always the smaller number.
     */
    constructor(start:number,end:number){
        if(start>end){
            [start, end] = [end, start];//swap
        }
        this.#start = start <= end ? start: end;
        this.#end   = end >= start ? end:start
    }
    get distance(){
        return Math.abs(this.start-this.end);
    }
    get start(){
        return this.#start;
    }
    get end(){
        return this.#end
    }
    /**
     * Returns a number. If the position is on start point its 0, if its on the end point its one,
     * if its inside the Segment its >0<1.  
     */
    positionToProportion(position:number):number{
        const proportion = (position - this.start)/this.distance
        return proportion;
    }
    isContainingPoint(position:number):boolean{
        const largerThanStart = position >= this.start;
        const smallerThanEnd = position<= this.end;
        const isContainingPoint = largerThanStart && smallerThanEnd;
        return isContainingPoint;
    }
    isContainedInSegment(otherSegment:Segment):boolean{
        const isStartContainedIn = this.start >= otherSegment.start
        const isEndContainedIn   = this.end   <= otherSegment.end
        const isContainedIn = isStartContainedIn && isEndContainedIn;
        return isContainedIn;
    }
    static fromStartEnd(start:number,end:number){
        return new Segment(start,end);
    }
    static fromStartDistance(start:number,length:number){
        const end = start+length
        return new Segment(start, end);
    }
    static fromDistanceEnd(length:number,end:number){
        const start = end-length;
        return new Segment(start,end)
    }
    toArray(){
        return [this.start,this.end];
    }
    toJSON():SegmentJson{
        return {start:this.start,end:this.end}
    }
    toString(){
        return `Segment: start: ${this.start}, end: ${this.end}, distance: ${this.distance}`;
    }
    fromJSON(segmentJson:SegmentJson){
        return new Segment(segmentJson.start,segmentJson.end);
    }
}

//all the variants of what the constraints in one dimension could be: 
type FixedConstraintParam = 
    [number, number, null] | //vary distance to right/bottom (default)
    [number, null, number] | //vary width/height
    [null, number, number] ; //vary distance to left/top

const fixedStrategy = function(outer:Segment,innerConstraints:FixedConstraintParam):Segment{
    const innerStart =  
        innerConstraints[0] != null ? // is left defined? 
            outer.start  + innerConstraints[0] // left defined: add distanced from the left
        : outer.end - innerConstraints[2] - innerConstraints[1]; //left not defined: substract distanced from right  
            
    const innerEnd = 
        innerConstraints[2] != null ?
          outer.end - innerConstraints[2]
        : outer.start  + innerConstraints[0] + innerConstraints[1];
    
    return new Segment(innerStart,innerEnd);
}
 

const proportionalStrategy = function(outer:Segment, proportionalConstraints:ProportionalConstraintParam):Segment{
    const innerStart = outer.start + outer.distance * proportionalConstraints.startProportion
    const innerEnd = outer.start    + outer.distance * proportionalConstraints.endProportion 
    
    return new Segment(innerStart,innerEnd)
}


interface SegmentDeriver{
    derive(outerSegment:Segment):Segment;
}

type ProportionalConstraintParam = {startProportion:number, endProportion:number}
type ProportionalConstraintJson = {
    name:string,
    startProportion:number,
    endProportion:number
}

class ProportionalConstraint implements SegmentDeriver{
    name:"ProportionalConstraint"
    constraints:ProportionalConstraintParam
    constructor(param:ProportionalConstraintParam){
        this.constraints = {
            startProportion: param.startProportion,
            endProportion:   param.endProportion
        }
    }
    derive(outerSegment: Segment): Segment {
        const segment = proportionalStrategy(outerSegment,this.constraints);
        return segment;  
    }

    toJSON():ProportionalConstraintJson{
        const json = {
            name:this.name,
            startProportion:this.constraints.startProportion,
            endProportion: this.constraints.endProportion
        }
        return json;
    }
    static fromJSON(json:ProportionalConstraintJson):ProportionalConstraint{
        const proportionalConstraint = new ProportionalConstraint({startProportion:json.startProportion,endProportion:json.endProportion});
        return proportionalConstraint;
    }
    static fromSegments(outerSegment:Segment, innerSegment:Segment):ProportionalConstraint{
        const startProportion = outerSegment.positionToProportion(innerSegment.start);
        const endProportion   = outerSegment.positionToProportion(innerSegment.end);

        const proportionalConstraint = new ProportionalConstraint({
            startProportion:startProportion,
            endProportion: endProportion
        })
        return proportionalConstraint;
    }
}


type FixedConstraintJson =
      { start: number; end: number; distance: null }
    | { start: number; end: null;   distance: number }
    | { start: null;   end: number; distance: number };

/** 
 * Like a segment, but one of distance, start, end is variable 
 * and solved relative to another segment. 
 * For example you can make the width depend on the outer segment
 * while the start and end point stay constant relative to it.
 */
class FixedConstraint implements SegmentDeriver {
    name: "FixedConstraint"
    constraints:FixedConstraintParam
    constructor(constraints:FixedConstraintParam){
        this.constraints = constraints;
    }
    get start(){
        return this.constraints[0]
    }
    get distance(){
        return this.constraints[1]
    }
    get end(){
        return this.constraints[2]   
    }
    get derivedParameter(){
        if(this.start === null){
            return "start"
        } else if(this.distance === null){
            return "distance"
        } else if(this.end === null){
            return "end"
        } else {
            throw TypeError("One parameter of Constraint needs to be null")
        };
    }
    derive(outer:Segment):Segment{
        const segment = fixedStrategy(outer,this.constraints)
        return segment;
    }
    toString(){
        return `Constraint: derived parameter is ${this.derivedParameter}. Start:${this.start}, Distance:${this.distance}, End:${this.end}`
    }
    toArray():FixedConstraintParam{
        return [...this.constraints];
    }
    toJSON():FixedConstraintJson{
        return {
            start:   this.start,
            distance:this.distance,
            end:     this.end
        } as FixedConstraintJson;
    }
    static fromArray(array:FixedConstraintParam):FixedConstraint{
        return new FixedConstraint(array);
    }

    static fromJSON(json:FixedConstraintJson):FixedConstraint{
        const constraint = new FixedConstraint([json.start,json.distance,json.end] as FixedConstraintParam);
        return constraint;
    }
    static fromSegments(outerSegment:Segment, innerSegment:Segment, calculate:"start"|"distance"|"end"):FixedConstraint{
         //check
         const innerIsInOuter = innerSegment.isContainedInSegment(outerSegment);
         if(!innerIsInOuter){
            throw RangeError(`Inner Segment is not in outer Segment: Inner is ${innerSegment.toString()}, outer is ${outerSegment.toString()}`)
         }

         //calculate values
         const start    = calculate === "start" ? null : innerSegment.start - outerSegment.start;
         const end      = calculate === "end" ? null : outerSegment.end - innerSegment.end;
         const distance = calculate === "distance" ? null : innerSegment.distance;

         const constraint = this.fromJSON({"end":end,"start":start, "distance":distance} as FixedConstraintJson);
         return constraint;
    }
}

type RectConstraintJson = {
    vertical:ProportionalConstraintJson,
    horizontal:ProportionalConstraintJson
}

type RectConstraintParam = {
    vertical:ProportionalConstraint,
    horizontal:ProportionalConstraint
}

type FromRectsParam = {
    outerRect: Rect;
    innerRect: Rect;
    // calculateVertical: "top"|"height"|"bottom";
    // calculateHorizontal: "left"| "width"| "right";
}

class RectConstraint{
    horizontal:ProportionalConstraint
    vertical:ProportionalConstraint
    constructor(param:RectConstraintParam){
        this.horizontal = param.horizontal;
        this.vertical = param.vertical;
    }
    deriveRect(outerRect:Rect){
        const horizontalOuterSegment = new Segment(outerRect.left,outerRect.right); 
        const verticalOuterSegment = new Segment(outerRect.top,outerRect.bottom);
        
        const derivedHorizontal = this.horizontal.derive(horizontalOuterSegment);
        const derivedVertical = this.vertical.derive(verticalOuterSegment);

        const derivedRect = new Rect({
            x:derivedHorizontal.start,
            y:derivedVertical.start,
            width:derivedHorizontal.distance,
            height:derivedVertical.distance
        });

        return derivedRect;
    }
    toJSON(){
        return {
            "horizontal": this.horizontal.toJSON(),
            "vertical"  : this.vertical.toJSON()
        }
    }
    toString(){
        return `RectConstraint: Vertical:${this.horizontal.toString()}, Horizontal:${this.horizontal.toString()}}`
    }
    static fromJSON(rectConstraintJson:RectConstraintJson){ //now needs to know different constraints types...
        const horizontal = ProportionalConstraint.fromJSON(rectConstraintJson.horizontal)
        const vertical = ProportionalConstraint.fromJSON(rectConstraintJson.vertical)
        const rectConstraint = new RectConstraint({vertical:vertical,horizontal:horizontal});
        return rectConstraint;
    }
    static fromRects(param:FromRectsParam){
        const {innerRect, outerRect} = param
        const outerSegmentHorizontal = Segment.fromStartEnd(outerRect.left, outerRect.right);
        const innerSegmentHorizontal = Segment.fromStartEnd(innerRect.left, innerRect.right);
        
        const outerSegmentVertical = Segment.fromStartEnd(outerRect.top, outerRect.bottom);
        const innerSegmentVertical = Segment.fromStartEnd(innerRect.top, innerRect.bottom);
        // Set value to null, if it is to be calculated by the constraint, 
        // if it is to be kept constant instead, you can derive it from the rectangles

        // const topDistance    = calculateVertical   === "top"     ? null : innerRect.top - outerRect.top;
        // const heightDistance = calculateVertical   === "height"  ? null : innerRect.height;
        // const bottomDistance = calculateVertical   === "bottom"  ? null : outerRect.bottom - innerRect.bottom; 
        // const leftDistance   = calculateHorizontal === "left"    ? null : innerRect.left - outerRect.left;
        // const widthDistance  = calculateHorizontal === "width"   ? null : innerRect.width;
        // const rightDistance  = calculateHorizontal === "right"   ? null : outerRect.right - innerRect.right;

        const constraintVertical   = ProportionalConstraint.fromSegments(outerSegmentVertical, innerSegmentVertical);
        const constraintHorizontal = ProportionalConstraint.fromSegments(outerSegmentHorizontal, innerSegmentHorizontal);
        const rectConstraint = new RectConstraint({horizontal:constraintHorizontal,vertical:constraintVertical});

        return rectConstraint;
    }
}

export {FixedConstraint,ProportionalConstraint, RectConstraint, Segment, fixedStrategy, FromRectsParam}