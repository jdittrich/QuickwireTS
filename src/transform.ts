import { Point } from "./data/point.js";
import { Rect } from "./data/rect.js";
import { ViewTransformerConversions } from "./interfaces.js";

import {mat2d, vec2} from "./libraries/glmatrix/index.js"

/**
 * Provides affine transform matrix operations. 
 * 
 * Is its own class to: 
 * a) provide a simpler interface
 * b) encapsulate matrix math library
 * 
 * Note: The used library glMatrix has an unusual syntax: 
 * `multiply(matrixThatIsChanged,transformMatrix,originalMatrix)` and returning the matrixThatIsChanged, too. 
 * I guess it makes sense when you read it right-to-left, but even then, passing a object-to-be-changed seems strange to me. 
 */

class ViewTransform implements ViewTransformerConversions{
    #matrix:any //the current transform matrix; will be changed by setter methods and used to transform points

    /**
     * Calling without parameters creates an identity matrix via default values
     */
    constructor(translateX=0,translateY=0,scale=1){
        this.#matrix = mat2d.fromValues(scale,0,0,scale,translateX,translateY);
    }

    /**
     * Changes the transform matrix, so that it is scaled, while point stays at the same position in output coordinates
     * Useful for zoom-to-cursor operations or to zoom to a particular object.
     * 
     * @param {Number} newScale 
     * @param {Point} point - …that should stay fixed. Untransformed, i.e. documentCoordinates
     */
    scaleByToPoint(newScale:number,point: Point){
        //First we create the needed matrices
        const moveOriginToPointMatrix   = mat2d.fromTranslation(mat2d.create(),[point.x *(-1), point.y*(-1)]);//matrix to move the point of origin to the mouse cursor (in input/document coordinates)
        const scaleMatrix               = mat2d.fromScaling(    mat2d.create(),[newScale     , newScale    ]); // matrix to scale …duh.
        const moveOriginFromPointMatrix = mat2d.fromTranslation(mat2d.create(),[point.x      , point.y     ]); //matrix to move the point of origin back to its old place.

        //now, matrix multiplications. 
        const movedOriginMatrix    = mat2d.multiply(mat2d.create(), moveOriginToPointMatrix,   this.#matrix);
        const scaledMatrix         = mat2d.multiply(mat2d.create(), scaleMatrix,               movedOriginMatrix);
        const backTranslatedMatrix = mat2d.multiply(mat2d.create(), moveOriginFromPointMatrix, scaledMatrix);

        this.#matrix = backTranslatedMatrix; //assign the result
    }

    getScale():number{
        return this.#matrix[0];
    }
    /**
     * @param {Point} point translates matrix by coordinates of point
     */
    setTranslateBy(point: Point){
        const translationMatrix = mat2d.fromTranslation(mat2d.create(),[point.x, point.y]);
        const newMatrix = mat2d.multiply(mat2d.create(),translationMatrix,this.#matrix);
        this.#matrix = newMatrix;
    }

    getTranslate():Point{
        return new Point({
            x:this.#matrix[4],
            y:this.#matrix[5]
        })
    }

    /** 
    * inverse to @see this.untransformPoint
    */
    transformPoint(point: Point): Point{ //from document to view space
        const transformedPoint = vec2.transformMat2d(vec2.create(),[point.x, point.y],this.#matrix)
        
        return new Point({
            x:transformedPoint[0],
            y:transformedPoint[1]
        });
    }

    /**
     * inverse operation to @see this.transformPoint
     */
    untransformPoint(point:Point):Point{ //from view space to document space
        const inverseMatrix = mat2d.invert(mat2d.create(),this.#matrix);
        const untransformedPoint = vec2.transformMat2d(vec2.create(),[point.x,point.y],inverseMatrix);
        
        return new Point({
            x:untransformedPoint[0], 
            y:untransformedPoint[1]
        });
    }

    screenToDocumentPosition(screenPoint:Point):Point{
        const documentPosition = this.untransformPoint(screenPoint);
        return documentPosition;
    }
    documentToScreenPosition(documentPoint:Point):Point{
        const screenPosition = this.transformPoint(documentPoint);
        return screenPosition;
    }
    screenToDocumentRect(screenRect:Rect):Rect{
        const {topLeft,bottomRight} = screenRect.getCorners();
        const documentTopLeft     = this.screenToDocumentPosition(topLeft);
        const documentBottomRight = this.screenToDocumentPosition(bottomRight);
        const documentRect = Rect.createFromCornerPoints(documentTopLeft, documentBottomRight);
        return documentRect;
    }
    documentToScreenRect(documentRect:Rect):Rect{
        const {topLeft,bottomRight} = documentRect.getCorners();
        const screenTopLeft     = this.documentToScreenPosition(topLeft);
        const screenBottomRight = this.documentToScreenPosition(bottomRight);
        const screenRect = Rect.createFromCornerPoints(screenTopLeft, screenBottomRight);
        return screenRect;
    }
    documentToScreenDistance(documentDistance:Point):Point{
        const scale = this.getScale();
        const inverseScale = 1/scale;

        const screenDistance = new Point({
            x: documentDistance.x * inverseScale,
            y: documentDistance.y * inverseScale,

        })
        return screenDistance;
    }

    screenToDocumentDistance(screenDistance:Point):Point{
        const scale = this.getScale();

        const documentDistance = new Point({
            x: screenDistance.x * scale,
            y: screenDistance.y * scale
        })

        return documentDistance;
    }

    toArray():number[]{
        return [this.#matrix[0], 0, 0, this.#matrix[0], this.#matrix[4], this.#matrix[5]];               
    }

    toString():string{
        return `scale: ${this.#matrix[0]}, translationX:${this.#matrix[4]}, translationY:${this.#matrix[5]}`
    }
}

export {ViewTransform}