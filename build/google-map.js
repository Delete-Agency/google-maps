"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _registry = _interopRequireDefault(require("./registry"));

var _googleMarker = _interopRequireDefault(require("./google-marker"));

var _googlePolyline = _interopRequireDefault(require("./google-polyline"));

var _googlePolygon = _interopRequireDefault(require("./google-polygon"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var GoogleMap =
/*#__PURE__*/
function () {
  /**
   *
   * @param element
   * @param mapOptions see https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions
   * @param options
   */
  function GoogleMap(element) {
    var mapOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, GoogleMap);

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
        right: 0
      },
      fitPopupPaddings: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    };
    this.options = _objectSpread({}, this.defaultOptions, {}, options);
    this.initPromise = null;
    /**
     * @type {?(string|Object)}
     */

    this.activeMarkerId = null;
    this._markersRegistry = new _registry.default(this._createMarker.bind(this));
    this._polylinesRegistry = new _registry.default(this._createPolyline.bind(this));
    this._polygonsRegistry = new _registry.default(this._createPolygon.bind(this));
  }
  /**
   * @return {Promise<Object>}
   * @private
   */


  _createClass(GoogleMap, [{
    key: "_getMap",
    value: function _getMap() {
      var _this = this;

      if (this.initPromise === null) {
        var initPromise = this.options.initPromise ? this.options.initPromise() : Promise.resolve();
        this.initPromise = initPromise.then(function () {
          return _this._createMap();
        });
      }

      return this.initPromise;
    }
    /**
     * @return {Promise<Object>}
     * @private
     */

  }, {
    key: "getInstance",
    value: function getInstance() {
      return this._getMap();
    }
    /**
     * Create an instance of google.maps.Map (see https://developers.google.com/maps/documentation/javascript/reference/map#Map)
     * @return {Object}
     * @private
     */

  }, {
    key: "_createMap",
    value: function _createMap() {
      var _this2 = this;

      var map = new google.maps.Map(this.element, this.mapOptions);

      if (this.options.deactivateMarkerOnMapClick) {
        map.addListener('click', function () {
          _this2._deactivateCurrentMarker();
        });
      }

      return map;
    }
    /**
     * @param {Object} map
     * @private
     */

  }, {
    key: "_applyInitialCenter",
    value: function _applyInitialCenter(map) {
      map.setCenter(this.mapOptions.center);
      map.setZoom(this.mapOptions.zoom);
    }
  }, {
    key: "_fitAll",
    value: function _fitAll(map) {
      var bounds = new google.maps.LatLngBounds();

      var currentMarkers = this._markersRegistry.getCurrentInstances();

      currentMarkers.forEach(function (marker) {
        bounds.extend(marker.getPosition());
      });

      var currentPolylines = this._polylinesRegistry.getCurrentInstances();

      currentPolylines.forEach(function (polyline) {
        return polyline.getInstance().getPath().forEach(function (latLng) {
          bounds.extend(latLng);
        });
      });

      var currentPolygons = this._polygonsRegistry.getCurrentInstances();

      currentPolygons.forEach(function (polygon) {
        return polygon.getInstance().getPaths().forEach(function (path) {
          return path.forEach(function (latLng) {
            bounds.extend(latLng);
          });
        });
      });

      this._fitBounds(map, bounds);
    }
  }, {
    key: "_fitBounds",
    value: function _fitBounds(map, bounds) {
      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds, this.options.fitPaddings);
    }
  }, {
    key: "_createMarker",
    value: function _createMarker(id, config, map) {
      var options = {
        id: id,
        map: this,
        mapInstance: map,
        config: config,
        options: this.options
      };

      if (this.options.createMarker) {
        return this.options.createMarker(options);
      } else {
        return new _googleMarker.default(options);
      }
    }
  }, {
    key: "_createPolyline",
    value: function _createPolyline(id, config, map) {
      var options = {
        id: id,
        map: this,
        mapInstance: map,
        config: config,
        options: this.options
      };
      return new _googlePolyline.default(options);
    }
  }, {
    key: "_createPolygon",
    value: function _createPolygon(id, config, map) {
      var options = {
        id: id,
        map: this,
        mapInstance: map,
        config: config,
        options: this.options
      };
      return new _googlePolygon.default(options);
    }
  }, {
    key: "_deactivateCurrentMarker",
    value: function _deactivateCurrentMarker() {
      if (this.activeMarkerId) {
        var activeMarker = this.getMarkerById(this.activeMarkerId);
        activeMarker.handleDeactivate();
        this.activeMarkerId = null;
      }
    }
  }, {
    key: "onMarkerDeactivate",
    value: function onMarkerDeactivate(id) {
      if (this.activeMarkerId === id) {
        var marker = this.getMarkerById(id);
        marker.handleDeactivate();
        this.activeMarkerId = null;
      }
    }
  }, {
    key: "onMarkerActivate",
    value: function onMarkerActivate(id) {
      var newMarker = this.getMarkerById(id);

      if (this.activeMarkerId) {
        var activeMarker = this.getMarkerById(this.activeMarkerId);

        if (this.activeMarkerId !== id) {
          activeMarker.handleDeactivate();

          this._activateMarker(newMarker, id);
        } else {
          this.activeMarkerId = null;
          activeMarker.handleDeactivate();
        }
      } else {
        this._activateMarker(newMarker, id);
      }
    }
  }, {
    key: "_activateMarker",
    value: function _activateMarker(newMarker, id) {
      this.activeMarkerId = id;
      newMarker.handleActivate();
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      this._getMap().then(function (map) {
        var markersChanged = _this3._renderMarkers(map);

        var polylinesChanged = _this3._renderPolygons(map);

        var polygonsChanged = _this3._renderPolylines(map);

        if (markersChanged || polylinesChanged || polygonsChanged) {
          // something has changed
          if (_this3._getObjectsCount() === 0) {
            // return to origin focus and center
            _this3._applyInitialCenter(map);
          } else {
            // if we have some objects
            if (_this3.options.autoFitOnRender) {
              _this3._fitAll(map);
            }
          }
        }
      });
    }
  }, {
    key: "_renderMarkers",
    value: function _renderMarkers(map) {
      var _this$_markersRegistr = this._markersRegistry.update(map),
          _this$_markersRegistr2 = _slicedToArray(_this$_markersRegistr, 2),
          added = _this$_markersRegistr2[0],
          removed = _this$_markersRegistr2[1];

      var activeMarker = this.getMarkerById(this.activeMarkerId);

      if (!activeMarker) {
        this.activeMarkerId = null;
      }

      return added + removed > 0;
    }
  }, {
    key: "_renderPolygons",
    value: function _renderPolygons(map) {
      var _this$_polygonsRegist = this._polygonsRegistry.update(map),
          _this$_polygonsRegist2 = _slicedToArray(_this$_polygonsRegist, 2),
          added = _this$_polygonsRegist2[0],
          removed = _this$_polygonsRegist2[1];

      return added + removed > 0;
    }
  }, {
    key: "_renderPolylines",
    value: function _renderPolylines(map) {
      var _this$_polylinesRegis = this._polylinesRegistry.update(map),
          _this$_polylinesRegis2 = _slicedToArray(_this$_polylinesRegis, 2),
          added = _this$_polylinesRegis2[0],
          removed = _this$_polylinesRegis2[1];

      return added + removed > 0;
    }
  }, {
    key: "fitDrawings",
    value: function fitDrawings() {
      var _this4 = this;

      if (this._getObjectsCount() > 0) {
        this._getMap().then(function (map) {
          _this4._fitAll(map);
        });
      }
    }
  }, {
    key: "_getObjectsCount",
    value: function _getObjectsCount() {
      return this.getMarkersCount() + this.getPolygonsCount() + this.getPolylinesCount();
    }
  }, {
    key: "getMarkersCount",
    value: function getMarkersCount() {
      return this._markersRegistry.getCurrentInstanceCount();
    }
  }, {
    key: "getPolylinesCount",
    value: function getPolylinesCount() {
      return this._polylinesRegistry.getCurrentInstanceCount();
    }
  }, {
    key: "getPolygonsCount",
    value: function getPolygonsCount() {
      return this._polygonsRegistry.getCurrentInstanceCount();
    }
  }, {
    key: "getMarkerById",
    value: function getMarkerById(id) {
      return this._markersRegistry.getInstanceById(id);
    }
  }, {
    key: "getPolylineById",
    value: function getPolylineById(id) {
      return this._polylinesRegistry.getInstanceById(id);
    }
  }, {
    key: "getPolygonById",
    value: function getPolygonById(id) {
      return this._polygonsRegistry.getInstanceById(id);
    }
    /**
     * @param configs
     * @return {GoogleMap}
     */

  }, {
    key: "setMarkers",
    value: function setMarkers(configs) {
      this._markersRegistry.setConfigs(configs);

      return this;
    }
    /**
     * @param configs
     * @return {GoogleMap}
     */

  }, {
    key: "setPolylines",
    value: function setPolylines(configs) {
      this._polylinesRegistry.setConfigs(configs);

      return this;
    }
    /**
     * @param configs
     * @return {GoogleMap}
     */

  }, {
    key: "setPolygons",
    value: function setPolygons(configs) {
      this._polygonsRegistry.setConfigs(configs);

      return this;
    }
  }]);

  return GoogleMap;
}();

exports.default = GoogleMap;