import {FixedConstraint,ProportionalConstraint,Segment} from '../built/data/constraint.js'

export const test_fixedConstraint = QUnit.module('fixed constraint', function() {
    QUnit.test('derive segment (start,length,end) from constraint', function(assert) {
        //|-10-|----40----|--20--|
        const constraint_startSize = new FixedConstraint([10,  40  ,null]) //the usual for top/left alignment
        const constraint_flexSize  = new FixedConstraint([10,  null,20  ]);
        const constraint_endSize   = new FixedConstraint([null,40,  20  ]);

        const segment_startSize = constraint_startSize.derive(new Segment(30,90));
        assert.equal(segment_startSize.end,80)

        const segment_flexSize = constraint_flexSize.derive(new Segment(30,90));
        assert.equal(segment_flexSize.distance,30);

        const segment_endSize = constraint_endSize.derive(new Segment(30,90));
        assert.equal(segment_endSize.start,30)
    });
});

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
