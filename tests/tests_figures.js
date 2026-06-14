import { NameFigureClassMapper } from "../NameFigureClassMapper.js";
import { RectFigure } from "../figures/rectFigure.js";
import { nameFigureClassMap } from "../nameFigureClassMap.js";
import { Rect } from "../data/rect.js";

const figureCopying = QUnit.module("figureCopying", function(){
    const rectFigure = new RectFigure({
        rect:new Rect({x: 12,y: 22,width: 10,height: 10}),
        containedFigures:[]
    })
    const rectFigureCopy = rectFigure.copy();
    
})

// composite figure methods

const rectFigureSerialization = QUnit.module('rectFigureSerialization', function(){
    const nameFigureClassMapper = new NameFigureClassMapper()
    nameFigureClassMapper.registerFromObject(nameFigureClassMap);
    
    QUnit.test("JSON roundtrip", (assert)=>{

        const figureRect = {x: 10,y: 20,width: 40,height: 50}

        const rectFigure = new RectFigure({
            rect:new Rect(figureRect),
            containedFigures:[
                new RectFigure({
                    rect:new Rect({x: 12,y: 22,width: 10,height: 10})
                }),
                new RectFigure({
                    rect: new Rect({x: 24,y: 34,width: 10,height: 10}),
                })
            ]
        });

        const rectFigureJson = rectFigure.toJSON();
        const revivedRectFigure = RectFigure.fromJSON(rectFigureJson, nameFigureClassMapper);
        
        const revivedRect = revivedRectFigure.getRect();
        const containedFigures = revivedRectFigure.getContainedFigures();

        assert.equal(revivedRect.x,figureRect.x);
        assert.equal(revivedRect.y,figureRect.y);
        assert.equal(revivedRect.width,figureRect.width);
        assert.equal(revivedRect.height,figureRect.height);
        assert.equal(containedFigures.length, 2);


        // const FigureClass = nameFigureClassMapper.getClass(rectFigureJSON.type);
        // const rectFigure = FigureClass.fromJSON(rectFigureJSON,nameFigureClassMapper);
        // const generatedJson = rectFigure.toJSON();
        // assert.propEqual(rectFigureJSON,generatedJson);
    });

    
});

export {rectFigureSerialization}