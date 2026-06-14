import { Drawing, DrawingJson } from "../drawing.js"
import { HorizontalLineFigure, HorizontalLineFigureJson } from "./lineFigure.js"
import { RectFigure, RectFigureJson } from "./rectFigure.js"

type FigureTypes = HorizontalLineFigure|RectFigure|Drawing
type FigureJsonTypes = HorizontalLineFigureJson|RectFigureJson|DrawingJson;

export {FigureTypes,FigureJsonTypes}