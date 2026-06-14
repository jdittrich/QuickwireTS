import { FigureAttributes } from "../figures/figureAttributes.js";

export const test_figureAttributes = QUnit.module('figure Attributes', function(hooks) {
    hooks.beforeEach(function(){
        this.figureAttributes = new FigureAttributes();
    })
    QUnit.test('retrieve Value', function(assert) {
        this.figureAttributes.register({"label":String,"index":Number});
        this.figureAttributes.set("label","testlabel");
        this.figureAttributes.set("index",1);
        
        const labelValue = this.figureAttributes.get("label");
        const indexValue = this.figureAttributes.get("index");

        assert.equal(labelValue,"testlabel");
        assert.equal(indexValue,1);
    });
    QUnit.test("register with wrong type", function(assert){
        assert.throws(function(){this.figureAttributes.register({"label":123})}, "passing a number instead of constructor throws");
    });
    QUnit.test("set with wrong type", function(assert){
        this.figureAttributes.register({"label":String,"index":Number});
        assert.throws(function(){this.figureAttributes.set({"label":0})}, "expecting string and giving number throws");
        assert.throws(function(){this.figureAttributes.set({"index":"a text"})}, "expecting number and giving string throws");
    });
});