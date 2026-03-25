import {HorizontalLine} from '../src/data/horizontalLine.js'
import { Point  } from '../src/data/point.js';

export const test_horizontalLine = QUnit.module('horizontalLine', function() {
    //creation
    QUnit.test('create a hline', function(assert) {
        const hline = new HorizontalLine({top:10, horizontal1:40, horizontal2:20});
        assert.equal(hline.left, 20);
        assert.equal(hline.right, 40);
        assert.equal(hline.top, 10);
    });
    QUnit.test('create a hline from points', function(assert) {
        const point1 = new Point({x:10,y:20});
        const point2 = new Point({x:30,y:40});
        const hLine = HorizontalLine.createFromPoints(point1,point2);
        assert.equal(hline.left,  10);
        assert.equal(hline.right, 30);
        assert.equal(hline.top,   40);
    });
    QUnit.test('copy a hline', function(assert) {
        const hLine = new HorizontalLine({top:10, horizontal1:40, horizontal2:20});
        const copiedHLine = hLine.copy();
        assert.equal(copiedHLine.left, 20);
        assert.equal(copiedHLine.right, 40);
        assert.equal(copiedHLine.top, 10);
    });
    QUnit.test('move a hline', function(assert) {
        const movement = new Point({x:10,y:20});
        const hLine = new HorizontalLine({top:10, horizontal1:40, horizontal2:20})
        const movedCopy = hLine.movedCopy(movement);
        assert.equal(movedCopy.left,  30);
        assert.equal(movedCopy.right, 50);
        assert.equal(movedCopy.top,   30);
    });
    QUnit.test('hline serialization/deserialization', function(assert) {
        const hLine = new HorizontalLine({top:10, horizontal1:40, horizontal2:20})
        const hLineJSON = hLine.toJSON();
        const revivedHLine = HorizontalLine.fromJSON(hLineJSON);
        
        assert.equal(revivedHLine.left,  20);
        assert.equal(revivedHLine.right, 40);
        assert.equal(revivedHLine.top,   10);
    });
});