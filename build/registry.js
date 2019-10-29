"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Registry =
/*#__PURE__*/
function () {
  function Registry(createFunction) {
    _classCallCheck(this, Registry);

    this._createFunction = createFunction;
    /**
     * @type {Object[]}
     */

    this.configsToRender = [];
    /**
     * @type {Object[]}
     */

    this.configsCurrent = this.configsToRender;
    /**
     *
     * @type {Map<(object|string), GoogleMarker>}
     */

    this.instancesMap = new Map();
  }
  /**
   * @param configs
   * @return {GoogleMap}
   */


  _createClass(Registry, [{
    key: "setConfigs",
    value: function setConfigs(configs) {
      this.configsToRender = configs;
    }
  }, {
    key: "getInstanceById",
    value: function getInstanceById(id) {
      return this.instancesMap.get(id);
    }
  }, {
    key: "getCurrentInstanceCount",
    value: function getCurrentInstanceCount() {
      return this.instancesMap.size;
    }
  }, {
    key: "getCurrentInstances",
    value: function getCurrentInstances() {
      return _toConsumableArray(this.instancesMap.values());
    }
  }, {
    key: "update",
    value: function update(map) {
      var added = 0;
      var removed = 0;

      if (this.configsToRender !== this.configsCurrent) {
        var _this$_update = this._update(map, this.configsToRender);

        var _this$_update2 = _slicedToArray(_this$_update, 2);

        added = _this$_update2[0];
        removed = _this$_update2[1];
        this.configsCurrent = this.configsToRender;
      }

      return [added, removed];
    }
  }, {
    key: "_getConfigsToAdd",
    value: function _getConfigsToAdd(newConfigs) {
      var _this = this;

      var currentInstancesIds = this._getCurrentInstancesIds();

      var result = [];
      newConfigs.forEach(function (config) {
        if (!currentInstancesIds.includes(_this._getId(config))) {
          result.push(config);
        }
      });
      return result;
    }
  }, {
    key: "_getIdsToRemove",
    value: function _getIdsToRemove(newConfigs) {
      var newConfigsIds = this._indexById(newConfigs);

      return this._getCurrentInstancesIds().reduce(function (result, id) {
        if (!newConfigsIds.includes(id)) {
          result.push(id);
        }

        return result;
      }, []);
    }
    /**
     * @return {(object|string)[]}
     * @private
     */

  }, {
    key: "_getCurrentInstancesIds",
    value: function _getCurrentInstancesIds() {
      return _toConsumableArray(this.instancesMap.keys());
    }
    /**
     * @param config
     * @return {string|Object}
     * @private
     */

  }, {
    key: "_getId",
    value: function _getId(config) {
      if (config.id) {
        return config.id;
      }

      return config;
    }
  }, {
    key: "_indexById",
    value: function _indexById(configs) {
      var _this2 = this;

      return configs.reduce(function (map, config) {
        map.set(_this2._getId(config), config);
        return map;
      }, new Map());
    }
  }, {
    key: "_createInstances",
    value: function _createInstances(configs, map) {
      var _this3 = this;

      if (configs.length === 0) {
        return;
      }

      configs.forEach(function (config) {
        var id = _this3._getId(config);

        var newInstance = _this3._createFunction(id, config, map);

        if (!newInstance) {
          throw new Error('Create function should return a new instance, returned falsy value');
        }

        _this3.instancesMap.set(id, newInstance);
      });
    }
  }, {
    key: "_removeInstancesByIds",
    value: function _removeInstancesByIds(ids) {
      var _this4 = this;

      ids.forEach(function (id) {
        var instance = _this4.instancesMap.get(id);

        instance.destroy();

        _this4.instancesMap.delete(id);
      });
    }
  }, {
    key: "_update",
    value: function _update(map, configs) {
      var instancesIdsToRemove = this._getIdsToRemove(configs);

      if (instancesIdsToRemove.length > 0) {
        this._removeInstancesByIds(instancesIdsToRemove);
      }

      var configsToAdd = this._getConfigsToAdd(configs);

      if (configsToAdd.length > 0) {
        this._createInstances(configsToAdd, map);
      }

      return [configsToAdd.length, instancesIdsToRemove.length];
    }
  }]);

  return Registry;
}();

exports.default = Registry;