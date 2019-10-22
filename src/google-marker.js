export default class GoogleMarker {
    constructor({ id, map, mapInstance, config, options }) {
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

    _getGoogleOptions() {
        return {
            ...this.config,
            map: this._mapInstance,
            icon: this._getGoogleIcon(),
        };
    }

    _getGoogleIcon() {
        const iconUrl = this.getIconUrl();
        if (iconUrl) {
            return {
                url: iconUrl,
                scaledSize: new google.maps.Size(this.getIconWidth(), this.getIconHeight())
            }
        }

        return null;
    }

    getPosition() {
        return this._instance.getPosition();
    }

    getInstance() {
        return this._instance;
    }

    setPopupElement(element) {
        this._popupElement = element;
    }

    activate() {
        if (!this._isActive) {
            this._activate();
        }
    }

    deactivate() {
        if (this._isActive) {
            this._deactivate();
        }
    }

    onStateChange(cb) {
        this._onStateChangeCallback = cb;
        return () => {
            this._onStateChangeCallback = null;
        };
    }

    _onClick() {
        this._activate();
    };

    _activate() {
        this._map.onMarkerActivate(this._id);
    }

    handleActivate() {
        if (!this._isActive) {
            this._handleActivate();
        }

        if (this.options.autoFitPopup) {
            this._fitPopup();
        }
    }

    _handleActivate() {
        this._isActive = true;
        this._showPopup();
        this._renderIcon();
        this.invokeOnStateChange();
    }

    _deactivate() {
        this._map.onMarkerDeactivate(this._id);
    }

    handleDeactivate() {
        if (this._isActive) {
            this._handleDeactivate();
        }
    }

    _handleDeactivate() {
        this._isActive = false;
        this._hidePopup();
        this._renderIcon();
        this.invokeOnStateChange();
    }

    _renderIcon() {
        this._instance.setIcon(this._getGoogleIcon());
    }

    _reset() {
        if (this._isActive) {
            this._deactivate();
        }
    }

    destroy() {
        this._reset();
        this._clickListener.remove();
        this._instance.setMap(null);
        this._instance = null;
        this._onStateChangeCallback = null;
    }

    invokeOnStateChange() {
        if (this._onStateChangeCallback) {
            this._onStateChangeCallback(this._isActive);
        }
    }

    getIconWidth() {
        return 10;
    }

    getIconHeight() {
        return 10;
    }

    getIconUrl() {
        return null;
    }

    _showPopup() {
        if (this._popupElement) {
            const PopupClass = this.getPopupClass();
            this.popup = new PopupClass(this.getPosition(), this._popupElement);
            this.popup.setMap(this._mapInstance);
        }
    }

    _fitPopup() {
        if (this.popup) {
            setTimeout(() => {
                const { getPopupContent, fitPopupPaddings } = this.options;

                let targetElement = this._popupElement;
                if (getPopupContent) {
                    targetElement = getPopupContent(this._popupElement);
                }

                if (!targetElement.clientWidth === 0 || targetElement.clientHeight === 0) {
                    console.warn('Width or height of your popup content is 0 which is not correct. ' +
                        'If the root of your popup have zero dimensions on purpose please provide GoogleMapOptions.getPopupContent ' +
                        'which should return an actual content element with non-zero width and height')
                }

                const bounds = new google.maps.LatLngBounds();
                bounds.extend(this.getPosition());

                const halfWidth = parseInt(targetElement.clientWidth / 2);
                const verticalDiff = targetElement.parentElement.getBoundingClientRect().top - targetElement.getBoundingClientRect().top;

                this._mapInstance.panToBounds(bounds, {
                    top: fitPopupPaddings.top + verticalDiff,
                    bottom: fitPopupPaddings.bottom,
                    left: fitPopupPaddings.left + halfWidth,
                    right: fitPopupPaddings.right + halfWidth,
                });
            }, 100);
        }
    }

    _hidePopup() {
        if (this.popup) {
            this.popup.remove();
        }
    }

    getPopupClass() {
        return getPopupClass();
    }
}

function getPopupClass() {
    return class GooglePopup extends google.maps.OverlayView {
        constructor(position, contentElement, options = {}) {
            super();
            this.position = position;
            this._createAnchor();
            this.setContent(contentElement);
        }

        _createAnchor() {
            this.anchor = document.createElement('div');
            this.anchor.style.cursor = 'auto';
            this.anchor.style.height = '0';
            this.anchor.style.position = 'absolute';
        }

        setContent(element) {
            this.anchor.innerHTML = '';
            this.anchor.insertAdjacentElement('beforeend', element);
            // stop events from from bubbling
            google.maps.OverlayView.preventMapHitsAndGesturesFrom(element);
        }

        remove() {
            this._removeFromDOM();
        }

        _removeFromDOM() {
            if (this.anchor.parentElement) {
                this.anchor.parentElement.removeChild(this.anchor);
            }
        }

        onAdd() {
            /** Called when the popup is added to the map. */
            this.getPanes().floatPane.appendChild(this.anchor);
        }

        onRemove() {
            /** Called when the popup is removed from the map. */
            this._removeFromDOM();
        }

        draw() {
            /** Called when the popup needs to draw itself. */
            const divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
            // Hide the popup when it is far out of view.
            const display =
                Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ? 'block' : 'none';

            if (display === 'block') {
                this.anchor.style.left = divPosition.x + 'px';
                this.anchor.style.top = divPosition.y + 'px';
            }
            if (this.anchor.style.display !== display) {
                this.anchor.style.display = display;
            }
        }
    }
}



