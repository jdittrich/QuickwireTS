import {ProportionalConstraint,Segment} from '../built/data/constraint.js'



export const test_proportionalConstraint = QUnit.module('proportional constraint', function() {
    QUnit.test('derive segment (start,length,end) from constraint', function(assert) {
        const outerSegment = new Segment(100,500);
        const innerSegment = new Segment(200,400);
        const constraint = ProportionalConstraint.fromSegments(outerSegment,innerSegment)

        const segmentScaled = constraint.derive(new Segment(100,800));
        assert.equal(segmentScaled.start,275)   
        assert.equal(segmentScaled.end,625)
    });

    QUnit.test('serialize/deserialize', function(assert) {
        const outerSegment = new Segment(100,500);
        const innerSegment = new Segment(200,400);
        const constraint = ProportionalConstraint.fromSegments(outerSegment,innerSegment)

        const constraintJSON = constraint.toJSON()
        const revivedConstraint = ProportionalConstraint.fromJSON(constraintJSON);
        const {startProportion, endProportion} = revivedConstraint.constraints;
        assert.equal(startProportion,0.25)
        assert.equal(endProportion,0.75)
    });
});
