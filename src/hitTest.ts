import { Rect  } from "./data/rect.js";
import { Point } from "./data/point.js";
import {Figure}  from "./figures/figure.js"

/**
 * A predicate function that gets a Figure any other parameter and returns a boolean. E.g. check if figure contains a point
 * @typedef {function} FigurePredicate
 * @param {Figure} figure 
 * @param {*} predicateParameter - another parameter, e.g. a point or rect to check for collision
 * @returns {boolean} 
*/

type FigurePredicate = {
    (figure:Figure,predicateParameter:any):boolean
};

/**
 * Walk a tree structure. Which branches are taken are based on the return value of a predicate function; 
 * if it returns *false*, the branch is not parsed further, the matching is thus "Lazy"; 
 * if it returns *true*,  the figure is pushed on an array and the array parsed further.
 * 
 * I tried to write this less terse, but it did not get easier to understand. 
 * 
 * @param {Figure} rootFigure a figure (has .children array which can contain more figures)
 * @param {*} predicateParameter gets passed to figurePredicate
 * @param {FigurePredicate} figurePredicate funct(figure,predicateParameter) 
 * @returns {array} array of matched figures, starting with the outermost ancestor and ending with the innermost descendant  
 */
function figureWalkTreeLazy(rootFigure: Figure,predicateParameter: any,figurePredicate: FigurePredicate): Figure[]{
    if(!figurePredicate(rootFigure,predicateParameter)){ 
        // base condition;
        // !negation because we often check if something is NOT the case; 
        // the predicate function is often something like (figure,point) => figure.containsPoint(point)
        // return empty array so we can flatMap (see recursion condition)
        return [];
    } else { 
        //recursion condition
        //16.07.24: Array.toReversed here, 
        const submatches = rootFigure.
                getContainedFigures().
                toReversed(). //so that late-in-stack (new figures are on top and appended at the end of the array) are matched earlier
                flatMap(      //flatMap is why base condition returns []; the empty arrays disappear, so I don't need to filter out empty entries.
                    childnode => figureWalkTreeLazy(childnode,predicateParameter,figurePredicate)
                );
        return [...submatches, rootFigure];
    }
}



//ready-to-use functions

/**
 * @param {DocumentView} the main view
 * @param {Point} a point in document coordinates
 * @param {Boolean} includeRoot
 * @returns {array} of figures under the point (or an empty array) starting with innermost matches
 * 
 */
function findFiguresBelowPoint(rootFigure:Figure,point:Point, includeRoot: boolean): Figure[]{
    const matches = figureWalkTreeLazy(rootFigure,point,(figure,point)=>{
        const figureEnclosesPoint = figure.isEnclosingPoint(point)
        return figureEnclosesPoint;
    });
    if(!includeRoot){
        matches.pop(); //removes last element –  the root figure/document
    }
    
    return matches;
}

/**
 * Find any enclosing Figure, e.g. for a hit test
 * @param {Figure} rootFigure - can be any figure, often the root of the whole document. 
 * @param {Figure} testRect - the figure that is enclosed
 * @returns {array} of figures enclosing the rect, starting with the innermost enclosing rect.
 */
function findEnclosingFigures(rootFigure: Figure,testRect: Rect): Figure[]{
    const enclosingFigures = figureWalkTreeLazy(rootFigure,testRect,(figure,testRect)=>{
        const isFigureEnclosingRect = figure.isEnclosingRect(testRect);
        return isFigureEnclosingRect;
    });
    return enclosingFigures;
}


/**
 * Finds the innermost figure that encloses the testRect
 * 
 * @param {Figure} rootFigure 
 * @param {Rect} testRect 
 * @returns {Figure}
*/
function findInnermostEnclosingFigure(rootFigure: Figure, testRect: Rect): Figure{
    const enclosingFigures = findEnclosingFigures(rootFigure,testRect);//all figures that fully enclose the testRect
    const innermostEnclosing = enclosingFigures[0]; //innermost enclosing figure
    return innermostEnclosing;
}

/**
 * 
 * Example: 
 * figure 1 is the innermost figure enclosing testFigure, so the function checks
 * for figures contained in 1. 
 * Of the figures contained in 1, testFigure encloses 3,2 but not 4 
 * 
 * +-1-------------------------------------+
 * |                                       |
 * |      +-testRect-ttttttttttttttt+      |
 * |      t        +2-------+       t      |
 * |      t        |        |       t      |
 * |      t        |        |       t      |
 * |      t        +--------+    +4----+   |
 * |      t                      |  t  |   |
 * |      t   +3-------+         +-----+   |
 * |      t   |        |            t      |
 * |      t   +--------+            t      |
 * |      +ttttttttttttttttttttttttt+      |
 * |                                       |
 * +---------------------------------------+
 * 
 */

/**
 * Finds all figures that are directly contained in figure and enclosed in testRect, too.
 * @param {Figure} containerFigure 
 * @param {Rect} testRect 
 * @returns {Figure[]} 
*/
function findInnerMatches(containerFigure: Figure,testRect: Rect): Figure[]{
    //collects all figures that are contained in the innermostEnclosing figure and also enclosed by the testRect → should be added
    const innerMatches = containerFigure.getContainedFigures().filter((containedFigure)=>{ 
        const containedFigureRect = containedFigure.getRect();
        const isMatch = testRect.isEnclosingRect(containedFigureRect);
        return isMatch;
    });
    return innerMatches;
    
}

function findFiguresEnclosingAndEnclosed(rootFigure:Figure,testRect:Rect):object{
    const innermostEnclosing = findInnermostEnclosingFigure(rootFigure,testRect);
    const innerMatches = findInnerMatches(innermostEnclosing,testRect);
    
    return {
        "rectEnclosesFigures":innerMatches,
        "rectEnclosedByFigure":innermostEnclosing
    }
}

export {
    figureWalkTreeLazy, 
    findFiguresBelowPoint, 
    findEnclosingFigures,
    findInnermostEnclosingFigure,
    findInnerMatches,
    findFiguresEnclosingAndEnclosed //combines findInnermostEnclosingFigure, findInnerMatches
};