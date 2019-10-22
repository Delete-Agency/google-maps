export default class GooglePolygon {
    constructor({ mapInstance, config }) {
        this._mapInstance = mapInstance;
        this.config = config;
        this._instance = new google.maps.Polygon(this._getGoogleOptions());
    }

    _getGoogleOptions() {
        return {
            ...this.config,
            map: this._mapInstance,
        };
    }

    getInstance() {
        return this._instance;
    }
}



