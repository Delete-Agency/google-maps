"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var GoogleMarker =
/*#__PURE__*/
function () {
  function GoogleMarker(_ref) {
    var id = _ref.id,
        map = _ref.map,
        mapInstance = _ref.mapInstance,
        config = _ref.config,
        options = _ref.options;

    _classCallCheck(this, GoogleMarker);

    this._id = id;
    this._map = map;
    this._mapInstance = mapInstance;
    this._onStateChangeCallback = null;
    this._isActive = false;
    this._popupElement = null;
    this.config = config;
    this.options = options;

    if (this.config.popupElement) {
      this._popupElement = this.config.popupElement;
    }

    this._onClick = this._onClick.bind(this);
    this._instance = new google.maps.Marker(this._getGoogleOptions());
    this._clickListener = this._instance.addListener('click', this._onClick);
  }

  _createClass(GoogleMarker, [{
    key: "_getGoogleOptions",
    value: function _getGoogleOptions() {
      return _objectSpread({}, this.config, {
        map: this._mapInstance,
        icon: this._getGoogleIcon()
      });
    }
  }, {
    key: "_getGoogleIcon",
    value: function _getGoogleIcon() {
      var iconUrl = this.getIconUrl();

      if (iconUrl) {
        return {
          url: iconUrl,
          scaledSize: new google.maps.Size(this.getIconWidth(), this.getIconHeight())
        };
      }

      return null;
    }
  }, {
    key: "getPosition",
    value: function getPosition() {
      return this._instance.getPosition();
    }
  }, {
    key: "getInstance",
    value: function getInstance() {
      return this._instance;
    }
  }, {
    key: "setPopupElement",
    value: function setPopupElement(element) {
      this._popupElement = element;
    }
  }, {
    key: "activate",
    value: function activate() {
      if (!this._isActive) {
        this._activate();
      }
    }
  }, {
    key: "deactivate",
    value: function deactivate() {
      if (this._isActive) {
        this._deactivate();
      }
    }
  }, {
    key: "onStateChange",
    value: function onStateChange(cb) {
      var _this = this;

      this._onStateChangeCallback = cb;
      return function () {
        _this._onStateChangeCallback = null;
      };
    }
  }, {
    key: "_onClick",
    value: function _onClick() {
      this._activate();
    }
  }, {
    key: "_activate",
    value: function _activate() {
      this._map.onMarkerActivate(this._id);
    }
  }, {
    key: "handleActivate",
    value: function handleActivate() {
      if (!this._isActive) {
        this._handleActivate();
      }

      if (this.options.autoFitPopup) {
        this._fitPopup();
      }
    }
  }, {
    key: "_handleActivate",
    value: function _handleActivate() {
      this._isActive = true;

      this._showPopup();

      this._renderIcon();

      this.invokeOnStateChange();
    }
  }, {
    key: "_deactivate",
    value: function _deactivate() {
      this._map.onMarkerDeactivate(this._id);
    }
  }, {
    key: "handleDeactivate",
    value: function handleDeactivate() {
      if (this._isActive) {
        this._handleDeactivate();
      }
    }
  }, {
    key: "_handleDeactivate",
    value: function _handleDeactivate() {
      this._isActive = false;

      this._hidePopup();

      this._renderIcon();

      this.invokeOnStateChange();
    }
  }, {
    key: "_renderIcon",
    value: function _renderIcon() {
      this._instance.setIcon(this._getGoogleIcon());
    }
  }, {
    key: "_reset",
    value: function _reset() {
      if (this._isActive) {
        this._deactivate();
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this._reset();

      this._clickListener.remove();

      this._instance.setMap(null);

      this._instance = null;
      this._onStateChangeCallback = null;
    }
  }, {
    key: "invokeOnStateChange",
    value: function invokeOnStateChange() {
      if (this._onStateChangeCallback) {
        this._onStateChangeCallback(this._isActive);
      }
    }
  }, {
    key: "getIconWidth",
    value: function getIconWidth() {
      return 10;
    }
  }, {
    key: "getIconHeight",
    value: function getIconHeight() {
      return 10;
    }
  }, {
    key: "getIconUrl",
    value: function getIconUrl() {
      return null;
    }
  }, {
    key: "_showPopup",
    value: function _showPopup() {
      if (this._popupElement) {
        var PopupClass = this.getPopupClass();
        this.popup = new PopupClass(this.getPosition(), this._popupElement);
        this.popup.setMap(this._mapInstance);
      }
    }
  }, {
    key: "_fitPopup",
    value: function _fitPopup() {
      var _this2 = this;

      if (this.popup) {
        setTimeout(function () {
          var _this2$options = _this2.options,
              getPopupContent = _this2$options.getPopupContent,
              fitPopupPaddings = _this2$options.fitPopupPaddings;
          var targetElement = _this2._popupElement;

          if (getPopupContent) {
            targetElement = getPopupContent(_this2._popupElement);
          }

          if (!targetElement.clientWidth === 0 || targetElement.clientHeight === 0) {
            console.warn('Width or height of your popup content is 0 which is not correct. ' + 'If the root of your popup have zero dimensions on purpose please provide GoogleMapOptions.getPopupContent ' + 'which should return an actual content element with non-zero width and height');
          }

          var bounds = new google.maps.LatLngBounds();
          bounds.extend(_this2.getPosition());
          var halfWidth = parseInt(targetElement.clientWidth / 2);
          var verticalDiff = targetElement.parentElement.getBoundingClientRect().top - targetElement.getBoundingClientRect().top;

          _this2._mapInstance.panToBounds(bounds, {
            top: fitPopupPaddings.top + verticalDiff,
            bottom: fitPopupPaddings.bottom,
            left: fitPopupPaddings.left + halfWidth,
            right: fitPopupPaddings.right + halfWidth
          });
        }, 100);
      }
    }
  }, {
    key: "_hidePopup",
    value: function _hidePopup() {
      if (this.popup) {
        this.popup.remove();
      }
    }
  }, {
    key: "getPopupClass",
    value: function getPopupClass() {
      return _getPopupClass();
    }
  }]);

  return GoogleMarker;
}();

exports.default = GoogleMarker;

function _getPopupClass() {
  return (
    /*#__PURE__*/
    function (_google$maps$OverlayV) {
      _inherits(GooglePopup, _google$maps$OverlayV);

      function GooglePopup(position, contentElement) {
        var _this3;

        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, GooglePopup);

        _this3 = _possibleConstructorReturn(this, _getPrototypeOf(GooglePopup).call(this));
        _this3.position = position;

        _this3._createAnchor();

        _this3.setContent(contentElement);

        return _this3;
      }

      _createClass(GooglePopup, [{
        key: "_createAnchor",
        value: function _createAnchor() {
          this.anchor = document.createElement('div');
          this.anchor.style.cursor = 'auto';
          this.anchor.style.height = '0';
          this.anchor.style.position = 'absolute';
        }
      }, {
        key: "setContent",
        value: function setContent(element) {
          this.anchor.innerHTML = '';
          this.anchor.insertAdjacentElement('beforeend', element); // stop events from from bubbling

          google.maps.OverlayView.preventMapHitsAndGesturesFrom(element);
        }
      }, {
        key: "remove",
        value: function remove() {
          this._removeFromDOM();
        }
      }, {
        key: "_removeFromDOM",
        value: function _removeFromDOM() {
          if (this.anchor.parentElement) {
            this.anchor.parentElement.removeChild(this.anchor);
          }
        }
      }, {
        key: "onAdd",
        value: function onAdd() {
          /** Called when the popup is added to the map. */
          this.getPanes().floatPane.appendChild(this.anchor);
        }
      }, {
        key: "onRemove",
        value: function onRemove() {
          /** Called when the popup is removed from the map. */
          this._removeFromDOM();
        }
      }, {
        key: "draw",
        value: function draw() {
          /** Called when the popup needs to draw itself. */
          var divPosition = this.getProjection().fromLatLngToDivPixel(this.position); // Hide the popup when it is far out of view.

          var display = Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ? 'block' : 'none';

          if (display === 'block') {
            this.anchor.style.left = divPosition.x + 'px';
            this.anchor.style.top = divPosition.y + 'px';
          }

          if (this.anchor.style.display !== display) {
            this.anchor.style.display = display;
          }
        }
      }]);

      return GooglePopup;
    }(google.maps.OverlayView)
  );
}