import GoogleDrawing from "./google-drawing";

export default class GooglePolyline extends GoogleDrawing {
    getNativeClass() {
        return google.maps.Polyline;
    }

    getBounds() {
        return this.getNativeInstance().getPath().getArray().reduce(
            (bounds, latLng) => {
                debugger;
                bounds.extend(latLng);
                return bounds;
            },
            new google.maps.LatLngBounds()
        );
    }
}



