import {Point} from "../data/point.js";
import {LocalMouseEvent, LocalDragEvent} from "../events.js";
import { DrawingView } from "../drawingView.js";
import { Drawing } from "../drawing.js";

const test_mouseEvent = QUnit.module('mouse events', function() {
    QUnit.test('mouse events', function(assert) {
        const testView = new DrawingView(
            new OffscreenCanvas(100,100).getContext("2d"),
            new Drawing(),
            new Point({x:100,y:100})
        );
        const testEvent = new LocalMouseEvent({
            screenPosition: new Point({x:10,y:20}),
            previousPosition: new Point({x:0,y:10}),
            view: testView
        });

        //getScreenPosition

        //getScreenMovement

        //getPreviousScreenPosition

        //DONT test the document conversions here.

    });
});

export {test_mouseEvent}