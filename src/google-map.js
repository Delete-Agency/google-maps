import Registry from "./registry";
import GoogleMarker from "./google-marker";
import GooglePolyline from "./google-polyline";
import GooglePolygon from "./google-polygon";

export default class GoogleMap {
    /**
     *
     * @param element
     * @param mapOptions see https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions
     * @param options
     */
    constructor(element, mapOptions = {}, options = {}) {
        this.element = element;
        this.mapOptions = mapOptions;
        this.defaultOptions = {
            /**
             * @property (?Function)
             */
            createMarker: null,
            /**
             * @property (?Function)
             */
            initPromise: null,
            autoFitOnRender: true,
            autoFitPopup: true,
            deactivateMarkerOnMapClick: true,
            /**
             * @property (?Function)
             */
            getPopupContent: null,
            fitPaddings: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
            },
            fitPopupPaddings: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
            }
        };

        this.options = {
            ...this.defaultOptions,
            ...options
        };

        this.initPromise = null;

        /**
         * @type {?(string|Object)}
         */
        this.activeMarkerId = null;

        this._markersRegistry = new Registry(this._createMarker.bind(this));
        this._polylinesRegistry = new Registry(this._createPolyline.bind(this));
        this._polygonsRegistry = new Registry(this._createPolygon.bind(this));
    }

    /**
     * @return {Promise<Object>}
     * @private
     */
    async _getMap() {
        if (this.initPromise === null) {
            const initPromise = this.options.initPromise ? this.options.initPromise() : Promise.resolve();
            this.initPromise = initPromise.then(() => this._createMap());
        }

        return this.initPromise;
    }

    /**
     * @return {Promise<Object>}
     * @private
     */
    getInstance() {
        return this._getMap();
    }

    /**
     * Create an instance of google.maps.Map (see https://developers.google.com/maps/documentation/javascript/reference/map#Map)
     * @return {Object}
     * @private
     */
    _createMap() {
        const map = new google.maps.Map(this.element, this.mapOptions);
        if (this.options.deactivateMarkerOnMapClick) {
            map.addListener('click', () => {
                this._deactivateCurrentMarker();
            });
        }
        return map;
    }

    /**
     * @param {Object} map
     * @private
     */
    _applyInitialCenter(map) {
        map.setCenter(this.mapOptions.center);
        map.setZoom(this.mapOptions.zoom);
    }

    _fitAll(map) {
        const bounds = new google.maps.LatLngBounds();

        const currentMarkers = this._markersRegistry.getCurrentInstances();
        currentMarkers.forEach(marker => {
            bounds.extend(marker.getPosition());
        });

        const currentPolylines = this._polylinesRegistry.getCurrentInstances();
        currentPolylines.forEach(
            polyline => polyline.getInstance().getPath().forEach(
                latLng => {
                    bounds.extend(latLng);
                }
            )
        );

        const currentPolygons = this._polygonsRegistry.getCurrentInstances();
        currentPolygons.forEach(
            polygon => polygon.getInstance().getPaths().forEach(
                path => path.forEach(
                    latLng => {
                        bounds.extend(latLng);
                    }
                )
            )
        );

        this._fitBounds(map, bounds);
    }

    _fitBounds(map, bounds) {
        map.setCenter(bounds.getCenter());
        map.fitBounds(bounds, this.options.fitPaddings);
    }

    _createMarker(
        id,
        config,
        map
    ) {
        const options = {
            id,
            map: this,
            mapInstance: map,
            config,
            options: this.options
        };

        if (this.options.createMarker) {
            return this.options.createMarker(options);
        } else {
            return new GoogleMarker(options);
        }
    }

    _createPolyline(
        id,
        config,
        map
    ) {
        const options = {
            id,
            map: this,
            mapInstance: map,
            config,
            options: this.options
        };

        return new GooglePolyline(options);
    }

    _createPolygon(
        id,
        config,
        map
    ) {
        const options = {
            id,
            map: this,
            mapInstance: map,
            config,
            options: this.options
        };

        return new GooglePolygon(options);
    }


    _deactivateCurrentMarker() {
        if (this.activeMarkerId) {
            const activeMarker = this.getMarkerById(this.activeMarkerId);
            activeMarker.handleDeactivate();
            this.activeMarkerId = null;
        }
    }

    onMarkerDeactivate(id) {
        if (this.activeMarkerId === id) {
            const marker = this.getMarkerById(id);
            marker.handleDeactivate();
            this.activeMarkerId = null;
        }
    };

    onMarkerActivate(id) {
        const newMarker = this.getMarkerById(id);
        if (this.activeMarkerId) {
            const activeMarker = this.getMarkerById(this.activeMarkerId);
            if (this.activeMarkerId !== id) {
                activeMarker.handleDeactivate();
                this._activateMarker(newMarker, id)
            } else {
                this.activeMarkerId = null;
                activeMarker.handleDeactivate();
            }
        } else {
            this._activateMarker(newMarker, id)
        }
    };

    _activateMarker(newMarker, id) {
        this.activeMarkerId = id;
        newMarker.handleActivate();
    }

    async render() {
        // just call getMap in order to create google.maps.Map which automatically renders the map
        const map = await this._getMap();
        const markersChanged = this._renderMarkers(map);
        const polylinesChanged = this._renderPolygons(map);
        const polygonsChanged = this._renderPolylines(map);

        if (markersChanged || polylinesChanged || polygonsChanged) {
            // something has changed
            if (this._getObjectsCount() === 0) {
                // return to origin focus and center
                this._applyInitialCenter(map);
            } else {
                // if we have some objects
                if (this.options.autoFitOnRender) {
                    this._fitAll(map);
                }
            }
        }
    }

    _renderMarkers(map) {
        const [added, removed] = this._markersRegistry.update(map);

        const activeMarker = this.getMarkerById(this.activeMarkerId);
        if (!activeMarker) {
            this.activeMarkerId = null;
        }

        return (added + removed) > 0;
    }

    _renderPolygons(map) {
        const [added, removed] = this._polygonsRegistry.update(map);
        return (added + removed) > 0;
    }

    _renderPolylines(map) {
        const [added, removed] = this._polylinesRegistry.update(map);
        return (added + removed) > 0;
    }

    async fitDrawings() {
        if (this._getObjectsCount() > 0) {
            const map = await this._getMap();
            this._fitAll(map);
        }
    }

    _getObjectsCount() {
        return this.getMarkersCount() + this.getPolygonsCount() + this.getPolylinesCount();
    }

    getMarkersCount() {
        return this._markersRegistry.getCurrentInstanceCount();
    }

    getPolylinesCount() {
        return this._polylinesRegistry.getCurrentInstanceCount();
    }

    getPolygonsCount() {
        return this._polygonsRegistry.getCurrentInstanceCount();
    }

    getMarkerById(id) {
        return this._markersRegistry.getInstanceById(id);
    }

    getPolylineById(id) {
        return this._polylinesRegistry.getInstanceById(id);
    }

    getPolygonById(id) {
        return this._polygonsRegistry.getInstanceById(id);
    }

    /**
     * @param configs
     * @return {GoogleMap}
     */
    setMarkers(configs) {
        this._markersRegistry.setConfigs(configs);
        return this;
    }

    /**
     * @param configs
     * @return {GoogleMap}
     */
    setPolylines(configs) {
        this._polylinesRegistry.setConfigs(configs);
        return this;
    }

    /**
     * @param configs
     * @return {GoogleMap}
     */
    setPolygons(configs) {
        this._polygonsRegistry.setConfigs(configs);
        return this;
    }
}
