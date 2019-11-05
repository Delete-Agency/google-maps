export default class GoogleDrawing {
    constructor({ mapInstance, config }) {
        this._mapInstance = mapInstance;
        this.config = config;

        const nativeClass = this.getNativeClass();
        this._instance = new nativeClass(this._getGoogleOptions());
    }

    _getGoogleOptions() {
        return {
            ...this.config,
            map: this._mapInstance,
        };
    }

    getNativeInstance() {
        return this._instance;
    }

    getBounds() {
        throw new Error('getBounds isn\'t implemented')
    }

    getNativeClass() {
        throw new Error('getNativeClass isn\'t implemented')
    }
}



