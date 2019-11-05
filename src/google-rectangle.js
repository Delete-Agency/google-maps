import GoogleDrawing from "./google-drawing";

export default class GoogleRectangle extends GoogleDrawing {
    getNativeClass() {
        return google.maps.Rectangle;
    }

    getBounds() {
        return this.getNativeInstance().getBounds();
    }
}



