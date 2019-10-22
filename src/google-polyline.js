export default class GooglePolyline {
    constructor({ mapInstance, config }) {
        this._mapInstance = mapInstance;
        this.config = config;
        this._instance = new google.maps.Polyline(this._getGoogleOptions());
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



