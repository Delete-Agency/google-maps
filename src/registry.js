export default class Registry {
    constructor(createFunction) {
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
    setConfigs(configs) {
        this.configsToRender = configs;
    }

    getInstanceById(id) {
        return this.instancesMap.get(id);
    }

    getCurrentInstanceCount() {
        return this.instancesMap.size;
    }

    getCurrentInstances() {
        return [...this.instancesMap.values()];
    }

    update(map) {
        let added = 0;
        let removed = 0;
        if (this.configsToRender !== this.configsCurrent) {
            [added, removed] = this._update(map, this.configsToRender);
            this.configsCurrent = this.configsToRender;
        }
        return [added, removed];
    }

    _getConfigsToAdd(newConfigs) {
        const currentInstancesIds = this._getCurrentInstancesIds();
        const result = [];

        newConfigs.forEach((config) => {
            if (!currentInstancesIds.includes(this._getId(config))) {
                result.push(config);
            }
        });

        return result;
    }

    _getIdsToRemove(newConfigs) {
        const newConfigsIds = this._indexById(newConfigs);
        return this._getCurrentInstancesIds().reduce((result, id) => {
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
    _getCurrentInstancesIds() {
        return [...this.instancesMap.keys()];
    }

    /**
     * @param config
     * @return {string|Object}
     * @private
     */
    _getId(config) {
        if (config.id) {
            return config.id;
        }
        return config;
    }

    _indexById(configs) {
        return configs.reduce((map, config) => {
            map.set(this._getId(config), config);
            return map;
        }, new Map());
    }

    _createInstances(configs, map) {
        if (configs.length === 0) {
            return;
        }
        configs.forEach(config => {
            const id = this._getId(config);
            const newInstance = this._createFunction(id, config, map);
            if (!newInstance) {
                throw new Error('Create function should return a new instance, returned falsy value');
            }
            this.instancesMap.set(id, newInstance);
        });
    }

    _removeInstancesByIds(ids) {
        ids.forEach(id => {
            const instance = this.instancesMap.get(id);
            instance.destroy();
            this.instancesMap.delete(id);
        });
    }

    _update(map, configs) {
        const instancesIdsToRemove = this._getIdsToRemove(configs);
        if (instancesIdsToRemove.length > 0) {
            this._removeInstancesByIds(instancesIdsToRemove);
        }

        const configsToAdd = this._getConfigsToAdd(configs);
        if (configsToAdd.length > 0) {
            this._createInstances(configsToAdd, map);
        }

        return [configsToAdd.length, instancesIdsToRemove.length];
    }
}