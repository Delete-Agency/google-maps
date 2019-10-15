import GoogleMarker from "./google-marker";

/**
 * https://developers.google.com/maps/documentation/javascript/reference/map#Map
 * @typedef {Object} GoogleMapsMap
 * @property {function} addListener
 * @property {function} fitBounds
 * @property {function} setCenter
 * @property {function} setZoom
 */
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
            autoFitMarkers: true,
            autoFitPopup: true,
            /**
             * @property (?Function)
             */
            getPopupContent: null,
            fitMarkersPaddings: {
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
         * @type {Object[]}
         */
        this.markersConfigsToRender = [];

        /**
         * @type {Object[]}
         */
        this.markersConfigsCurrent = this.markersConfigsToRender;

        /**
         *
         * @type {Object.<string,GoogleMarker>}
         */
        this.markersById = {};

        /**
         *
         * @type {?string}
         */
        this.activeMarkerId = null;
    }

    /**
     * @return {Promise<GoogleMapsMap>}
     * @private
     */
    async _getMap() {
        if (this.initPromise === null) {
            const loadScriptPromise = this.options.initPromise ? this.options.initPromise() : Promise.resolve();
            this.initPromise = loadScriptPromise.then(() => this._createMap());
        }

        return this.initPromise;
    }

    async getMapInstance() {
        return this._getMap();
    }

    /**
     * @return GoogleMapsMap
     * @private
     */
    _createMap() {
        const map = new google.maps.Map(this.element, this.mapOptions);
        map.addListener('click', () => {
            this._deactivateCurrentMarker();
        });
        return map;
    }

    _updateMarkers(map, markers) {
        const newMarkersByIds = this._getMarkersById(markers);
        const newMarkersIds = Object.keys(newMarkersByIds);

        const markersIdsToRemove = this._getMarkersIdsToRemove(newMarkersIds);
        if (markersIdsToRemove.length > 0) {
            this._removeMarkersByIds(markersIdsToRemove);
        }

        const markersToAdd = this._getMarkersToAdd(newMarkersByIds);
        if (markersToAdd.length > 0) {
            this._addMarkers(markersToAdd, map);
        }

        if (markersIdsToRemove.length > 0 || markersToAdd.length > 0) {
            // something has changed
            if (this.getCurrentMarkersCount() === 0) {
                // return to origin focus and center
                this._applyInitialCenter(map);
            } else {
                // if we have some markers
                if (this.options.autoFitMarkers) {
                    this._fitCurrentMarkers(map);
                }
            }
        }

        const activeMarker = this.getMarkerById(this.activeMarkerId);
        if (!activeMarker) {
            this.activeMarkerId = null;
        }
    }

    _getMarkersById(markers) {
        return markers.reduce((result, marker) => {
            result[this._getMarkerId(marker)] = marker;
            return result;
        }, {});
    }

    _addMarkers(markers, map) {
        if (markers.length === 0) {
            return;
        }
        const newMarkers = {};
        markers.forEach(marker => {
            const id = this._getMarkerId(marker);
            newMarkers[id] = this._createMarker(id, marker, map);
        });

        this.markersById = { ...this.markersById, ...newMarkers };
    }

    /**
     * @param {GoogleMapsMap} map
     * @private
     */
    _applyInitialCenter(map) {
        map.setCenter(this.mapOptions.center);
        map.setZoom(this.mapOptions.zoom);
    }

    _fitCurrentMarkers(map) {
        const bounds = new google.maps.LatLngBounds();
        const currentMarkers = Object.values(this.markersById);
        currentMarkers.forEach(marker => {
            bounds.extend(marker.getPosition());
        });
        map.setCenter(bounds.getCenter());
        map.fitBounds(bounds, this.options.fitMarkersPaddings);
    }

    _removeMarkersByIds(ids) {
        ids.forEach(id => {
            const marker = this.markersById[id];
            marker.destroy();
        });
        this.markersById = Object.keys(this.markersById)
            .filter(id => !ids.includes(id))
            .reduce((result, id) => {
                result[id] = this.markersById[id];
                return result;
            }, {})
    }

    _createMarker(
        id,
        marker,
        map
    ) {
        const options = {
            id,
            map: this,
            mapInstance: map,
            markerOptions: marker,
            options: this.options
        };

        if (this.options.createMarker) {
            return this.options.createMarker(options);
        } else {
            return new GoogleMarker(options);
        }
    }

    _getMarkersToAdd(newMarkersByIds) {
        const currentMarkersIds = this._getCurrentMarkersIds();

        return Object.keys(newMarkersByIds).reduce((result, newMarkerId) => {
            if (!currentMarkersIds.includes(newMarkerId)) {
                result.push(newMarkersByIds[newMarkerId]);
            }
            return result;
        }, []);
    }

    _getMarkersIdsToRemove(newMarkersIds) {
        return this._getCurrentMarkersIds().reduce((result, id) => {
            if (!newMarkersIds.includes(id)) {
                result.push(id);
            }
            return result;
        }, []);
    }

    _getCurrentMarkersIds() {
        return Object.keys(this.markersById);
    }

    _getMarkerPosition(marker) {
        return marker.position;
    }

    /**
     * @param marker
     * @return {string}
     * @private
     */
    _getMarkerId(marker) {
        let id = null;
        if (marker.id) {
            id = marker.id;
        } else {
            const position = this._getMarkerPosition(marker);
            if (position.lat && position.lng) {
                id = `${position.lat},${position.lng}`;
            }
        }
        return id;
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

        if (this.options.autoFitPopup) {
            newMarker.fitPopup()
        }
    }

    getMarkerByConfig(marker) {
        return this.markersById[this._getMarkerId(marker)];
    }

    getMarkerById(id) {
        return this.markersById[id];
    }

    getMarkersById() {
        return this.markersById;
    }

    /**
     * @param markers
     * @return {GoogleMap}
     */
    setMarkers(markers) {
        this.markersConfigsToRender = markers;
        return this;
    }

    async render() {
        // just call getMap in order to create google.maps.Map which automatically renders the map
        const map = await this._getMap();
        // render markers
        if (this.markersConfigsToRender !== this.markersConfigsCurrent) {
            this._updateMarkers(map, this.markersConfigsToRender);
            this.markersConfigsCurrent = this.markersConfigsToRender;
        }
    }

    async fitCurrentMarkers() {
        if (this.getCurrentMarkersCount() > 0) {
            const map = await this._getMap();
            this._fitCurrentMarkers(map);
        }
    }

    getCurrentMarkersCount() {
        return Object.keys(this.markersById).length;
    }
}
