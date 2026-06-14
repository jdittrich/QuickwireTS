
import { Rect } from "../built/data/rect.js";
import { RectConstraint } from "../built/data/constraint.js";


export const test_rectConstraint = QUnit.module('rectConstraint', function(hooks){
    hooks.beforeEach(function(){
        this.outerRect = new Rect({
            x:20,
            y:10,
            width:35,
            height:25
        });
    });

    QUnit.test('calculate single null parameter ("fixed")', function(assert){
        const rectConstraint = RectConstraint.fromJSON({
                horizontal:{start:null,distance:10,end:5}, 
                vertical:{start:10,distance:null,end:10}
        });
        const constraintRect =  rectConstraint.deriveRect(this.outerRect);
        assert.equal(constraintRect.left,   40, "left");
        assert.equal(constraintRect.top,    20, "top");
        assert.equal(constraintRect.width,  10, "width");
        assert.equal(constraintRect.height,  5, "height");// outerBottom is 35, so inner is 35-10= 25; outerTop is 10, inner is 10+10=20, and 25-20 = 5
    });

    // QUnit.test('constraint as null object always deriving a rect equivalent to passed one', function(assert){
    //     const rectConstraint = RectConstraint.createNullConstraint();

    //     const constraintRect =  rectConstraint.deriveRect(this.outerRect);
    //     assert.equal(constraintRect.left,   this.outerRect.left, "left");
    //     assert.equal(constraintRect.top,    this.outerRect.top, "top");
    //     assert.equal(constraintRect.width,  this.outerRect.width, "width");
    //     assert.equal(constraintRect.height, this.outerRect.height, "height")
    // });

    //cause I had a bug where if(somevalue){...} and if somevalue was 0, it was false. 
    QUnit.test('calculate single null parameter ("fixed") with 0 values', function(assert){
        const rectConstraint = RectConstraint.fromJSON({
                horizontal:{start:null,distance:4,end:0}, 
                vertical:{start:0,distance:null,end:0}
        })
        const constraintRect =  rectConstraint.deriveRect(this.outerRect);
        assert.equal(constraintRect.left,   51, "left");
        assert.equal(constraintRect.top,    10, "top"); 
        assert.equal(constraintRect.width,   4, "width");
        assert.equal(constraintRect.height, 25, "height");// outerBottom is 35, so inner is 35-10= 25; outerTop is 10, inner is 10+10=20, and 25-20 = 5
    });

    // QUnit.test('calculate centered, fixed dimensions position', function(assert){
    //     const rectConstraint = new RectConstraint({
    //             horizontal:[null,10,null], 
    //             vertical:[null,20,null]
    //     });
    //     const constraintRect =  rectConstraint.deriveRect(this.outerRect);
    //     assert.equal(constraintRect.top,    12.5, "top");
    //     assert.equal(constraintRect.left,   32.5, "left");
    //     assert.equal(constraintRect.width,  10,   "width");
    //     assert.equal(constraintRect.height, 20,   "height");
    // });

    // QUnit.test('calculate centered position, variable dimensions', function(assert){
    //     const rectConstraint = new RectConstraint({
    //             horizontal:[null,null,null], 
    //             vertical:[null,null,null]
    //     })
    //     const constraintRect =  rectConstraint.deriveRect(this.outerRect);
    //     assert.closeTo(constraintRect.top,    18.333, 0.001, "top");
    //     assert.closeTo(constraintRect.left,   31.666, 0.001, "left");
    //     assert.closeTo(constraintRect.width,  11,666, 0.001, "width");
    //     assert.closeTo(constraintRect.height, 8.333,  0.001, "height");
    // });

    // QUnit.test('calculate position by half-point between adjecent nullish values', function(assert){
    //     const rectConstraint = new RectConstraint({
    //             horizontal:[10,null,null], 
    //             vertical:[null,null,5]
    //     })
    //     const constraintRect =  rectConstraint.deriveRect(this.outerRect);
    //     assert.equal(constraintRect.top,    20,    "top");
    //     assert.equal(constraintRect.left,   30,    "left");
    //     assert.equal(constraintRect.width,  12.5,  "width");
    //     assert.equal(constraintRect.height, 10,    "height");// outerBottom is 35, so inner is 35-10= 25; outerTop is 10, inner is 10+10=20, and 25-20 = 5
    // });


    QUnit.test("unfitting constraint",function(assert){
        // here a constraint that, in most rectangles, won't be able to work
        // however, it always produces rectangle, since the rectangle is defined from any two points rather than a "top left" and a "bottom right" point. 
        const constraintThatDoesNotFitRect = RectConstraint.fromJSON({"horizontal":{"start":30,"distance":null,"end":50} , "vertical":{"start":5,"distance":1000,"end":null}});
        const constraintRect2 = constraintThatDoesNotFitRect.deriveRect(this.outerRect);

        assert.equal(constraintRect2.right,    50, "right");//this was created by the "left"  constraint.
        assert.equal(constraintRect2.left,      5, "left"); //this was created by the "right" constraint
        assert.equal(constraintRect2.width,    45, "width");
        assert.equal(constraintRect2.top,      15, "top");
        assert.equal(constraintRect2.bottom, 1015, "bottom");
        assert.equal(constraintRect2.height, 1000, "height");// outerBottom is 35, so inner is 35-10= 25; outerTop is 10, inner is 10+10=20, and 25-20 = 5
    });

    QUnit.test("fromRects",function(assert){
        const outerRect = this.outerRect;
        const innerRect = new Rect({
            x:40,
            y:20,
            width:10,
            height:5
        });
        const constraint = RectConstraint.fromRects({"calculateVertical":"height", "calculateHorizontal":"left", "innerRect":innerRect, "outerRect":outerRect});
        assert.propEqual(constraint.toJSON(),{horizontal:{start:null,distance:10,end:5}, vertical:{start:10,distance:null,end:10}});
    });

    QUnit.test("serialization/deserialization",function(assert){
        const rectConstraint = RectConstraint.fromJSON({
            horizontal:{start:null,distance:10,end:5}, 
            vertical:{start:10,distance:null,end:10}
        });

        const rectConstraintJson = rectConstraint.toJSON();
        assert.propEqual(rectConstraintJson, {horizontal:{start:null,distance:10,end:5}, vertical:{start:10, distance:null, end:10}}, "correctly JSONified");
    });
});