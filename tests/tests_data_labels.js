import { LabelList } from "../built/data/labelList.js";
import {SingleSelectLabelList} from "../built/data/singleSelectLabelList.js";

export const test_labelList = QUnit.module('LabelList', function() {
    QUnit.test('create and read label list', function(assert) {
        const labelList = new LabelList({labels:["one","two", "three"]});
        const arrayOfLabels = labelList.labels;
        assert.equal("one",arrayOfLabels[0]);
    });

    QUnit.test('serialization, deserialization', function(assert){
        const labelList = new LabelList({labels:["one","two", "three"]});
        const labelListJSON = labelList.toJSON();
        assert.deepEqual(labelListJSON.labels,["one","two", "three"]);
        const labelList2 = LabelList.fromJSON(labelListJSON);
        const labelListLabels = labelList2.labels;
        assert.deepEqual(labelListLabels,["one","two", "three"]);
    });
});

export const test_singleSelectLabelList = QUnit.module('SingleSelectLabelList', function(){
    QUnit.test('getSelectedLabel', function(assert){
            const singleSelectLabelList = new SingleSelectLabelList({labels:["one","two", "three"],selectedIndex:2});
            const selectedLabel = singleSelectLabelList.selectedLabel;
            assert.equal(selectedLabel, "three");
        });
        QUnit.test('errors', function(assert) {
            assert.throws(function(){new SingleSelectLabelList({labels:["one","two", "three"],selectedIndex:99})},"selection out of range");
            assert.throws(function(){new SingleSelectLabelList({labels:["one","two", "three"],selectedIndex:-1})},"no negative selections");
        });

        QUnit.test('JSON serialization, deserialization', function(assert){
            const singleSelectLabelList = new SingleSelectLabelList({labels:["one","two", "three"],selectedIndex:2});
            const singleSelectLabelListJSON = singleSelectLabelList.toJSON();
            const singleSelectLabelList2 = SingleSelectLabelList.fromJSON(singleSelectLabelListJSON);
            assert.equal(singleSelectLabelList.selectedIndex, singleSelectLabelList2.selectedIndex);
            assert.deepEqual(singleSelectLabelList.labels, singleSelectLabelList2.labels);

        });
        QUnit.test('string serialization, deserialization', function(assert){
            const singleSelectLabelList = new SingleSelectLabelList({labels:["one","two", "three"],selectedIndex:2});
            const listString = singleSelectLabelList.toString();
            const singleSelectLabelList2 = SingleSelectLabelList.fromString(listString);
            assert.equal(singleSelectLabelList.selectedIndex, singleSelectLabelList2.selectedIndex);
            assert.deepEqual(singleSelectLabelList.labels, singleSelectLabelList2.labels);
        });
});

