import GoogleDrawing from "./google-drawing";

export default class GoogleCircle extends GoogleDrawing {
    getNativeClass() {
        return google.maps.Circle;
    }

    getBounds() {
        return this.getNativeInstance().getBounds();
    }
}



