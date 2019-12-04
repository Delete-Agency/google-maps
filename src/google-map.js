import Registry from "./registry";
import GoogleMarker from "./google-marker";
import GooglePolyline from "./google-polyline";
import GooglePolygon from "./google-polygon";
import GoogleCircle from "./google-circle";
import GoogleRectangle from "./google-rectangle";

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
        this._polylinesRegistry = new Registry(this._createDrawing.bind(this, GooglePolyline));
        this._polygonsRegistry = new Registry(this._createDrawing.bind(this, GooglePolygon));
        this._circlesRegistry = new Registry(this._createDrawing.bind(this, GoogleCircle));
        this._rectanglesRegistry = new Registry(this._createDrawing.bind(this, GoogleRectangle));

        this._drawingsRegistries = [
            this._markersRegistry,
            this._polylinesRegistry,
            this._polygonsRegistry,
            this._circlesRegistry,
            this._rectanglesRegistry
        ];
    }

    /**
     * @return {Promise<Object>}
     * @private
     */
    _getMap() {
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
        this._drawingsRegistries.forEach((registry) => {
            registry.getCurrentInstances().forEach(drawing => bounds.union(drawing.getBounds()));
        });
        this._fitBounds(map, bounds);
    }

    _fitBounds(map, bounds) {
        map.setCenter(bounds.getCenter());

        const count = this._getObjectsCount();
        if (count > 1) {
            map.fitBounds(bounds, this.options.fitPaddings);
        } else if (this.mapOptions.zoom) {
            map.setZoom(this.mapOptions.zoom);
        }
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

    _createDrawing(
        className,
        id,
        config,
        map
    ) {
        const options = {
            id,
            map: this,
            mapInstance: map,
            config
        };

        return new className(options);
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

    render() {
        this._getMap().then((map) => {
            const registryChanged = [
                this._renderMarkers(map),
                this._renderPolygons(map),
                this._renderPolylines(map),
                this._renderCircles(map),
                this._renderRectangles(map)
            ];

            if (registryChanged.some(value => value)) {
                // something has changed
                if (this._getObjectsCount() === 0) {
                    // return to origin zoom and center
                    this._applyInitialCenter(map);
                } else {
                    // if we have some objects
                    if (this.options.autoFitOnRender) {
                        this._fitAll(map);
                    }
                }
            }
        });
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

    _renderCircles(map) {
        const [added, removed] = this._circlesRegistry.update(map);
        return (added + removed) > 0;
    }

    _renderRectangles(map) {
        const [added, removed] = this._rectanglesRegistry.update(map);
        return (added + removed) > 0;
    }


    fitDrawings() {
        if (this._getObjectsCount() > 0) {
            this._getMap().then(map => {
                this._fitAll(map);
            });
        }
    }

    _getObjectsCount() {
        return this._drawingsRegistries.reduce((res, registry) => res + registry.getCurrentInstanceCount(), 0);
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

    /**
     * @param configs
     * @return {GoogleMap}
     */
    setCircles(configs) {
        this._circlesRegistry.setConfigs(configs);
        return this;
    }

    /**
     * @param configs
     * @return {GoogleMap}
     */
    setRectangles(configs) {
        this._rectanglesRegistry.setConfigs(configs);
        return this;
    }
}
