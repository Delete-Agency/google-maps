import GoogleDrawing from "./google-drawing";

export default class GooglePolygon extends GoogleDrawing {
    getNativeClass() {
        return google.maps.Polygon;
    }

    getBounds() {
        const bounds = new google.maps.LatLngBounds();
        this.getNativeInstance().getPaths().forEach(
            path => path.forEach(
                latLng => {
                    bounds.extend(latLng);
                }
            )
        );
        return bounds;
    }
}



