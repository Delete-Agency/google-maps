# Google Maps

[Live Demo](https://delete-agency.github.io/google-maps/)

A wrapper around [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/reference) which supports custom popups out of the box and simplify common tasks.

## Installation

Use the package manager [npm](https://docs.npmjs.com/about-npm/) for installation.

```
$ npm install @deleteagency/google-maps
```

## Usage

```js
import { GoogleMaps } from  '@deleteagency/google-maps';

const map = new GoogleMap(
    document.getElementById('map1'),
    // google.maps.MapOptions (https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions)
    {
        zoom: 11,
        maxZoom: 19,
        minZoom: 1,
    },
    // custom options (see bellow)
    {
        fitMarkersPaddings: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
        }
    }
);

// an array of google.maps.MarkerOptions https://developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions
// in case they contain additional option popupElement, this element will be used as a popup
map.setMarkers([
    {
        position: {
            lat: 51.507100,
            lng: -0.122758,
        },
        popupElement: document.getElementById('popup1')
    },
    {
        position: {
            lat: 51.507400,
            lng: -0.127758,
        },
        popupElement: document.getElementById('popup2')
    },
    {
        position: {
            lat: 51.507150,
            lng: -0.126758,
        },
        popupElement: document.getElementById('popup3')
    }
]);
map.render();
```

## Options

The full list of google.maps.MapOptions can be found [here](https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions)
<br>
Below you can find options for GoogleMap itself (new GoogleMap(element, mapOptions, **options**))

### createMarker

Type: `Function`<br>
Default: `null`

### initPromise

Type: `Function`<br>
Default: `null`

### autoFitMarkers

Type: `boolean`<br>
Default: `true`

### autoFitPopup

Type: `boolean`<br>
Default: `true`

### getPopupContent

Type: `Function` <br>
Default: `null`

### fitMarkersPaddings

Type: `Object`<br>
Default: `{top: 0, bottom: 0, left: 0, right: 0}`

### fitPopupPaddings

Type: `Object`<br>
Default: `{top: 0, bottom: 0, left: 0, right: 0}`

## API

### new GoogleMap(element ,mapOptions = {}, options = {})

Returns new GoogleMap instance

#### element

*Required*<br>
Type: `HTMLElement`

An element which holds the map

#### mapOptions (see [here](https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions))

*Optional*<br>
Type: `google.maps.MarkerOptions`

#### options

*Optional*<br>
Type: `Object`

### map.render()

Renders the map

**Note**: Just creating an instance doesn't render anything, 
you have to implicitly call its render method to render initial map 
or reflect a changes after map.setMarkers() was called

### map.setMarkers(markers)

Save markers to render them once render() method is called

#### markers

*Required*<br>
Type: `google.maps.MarkerOptions[]`

An array of object that inherited from [google.maps.MarkerOptions](https://developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions)
<br> If you want a particular marker to show a popup you can extend its options object with `popupElement` property.
<br> It should contain an HTMLElement which will be used as the content of the popup
<br> Also you can identify every marker by passing additional property `id`.
`id` is used in order to avoid redundant destroying and creating markers instance
when setMarkers(...) + render() are called multiple times but some of the provided markers are already rendered. 
<br> `id` is optional because by default it will be generated under the hood based on markerOptions.position property.
But if you already have identifiers in you markers or going to call map.getMarkersById() later and interact with markers directly
it makes sense to use your own id value.

### map.getMapInstance()

Returns `Promise<google.maps.Map>`

### map.fitCurrentMarkers()

Fits previously rendered markers within the map

### map.getCurrentMarkersCount()

Returns `integer`

Return the quantity of the rendered markers

### map.getMarkersById()

Returns `Object.<string, GoogleMarker>}`

Return the object with rendered instances of GoogleMarker. Read about id attribute (here)[#markers] 

### googleMarker.getMarkerInstance()

Returns `google.maps.Marker`

### googleMarker.setPopupElement(element)

#### element

An element which should be used as the content of the popup

*Required*<br>
Type: `HTMLElement`

### googleMarker.activate()

Activates the marker.
<br> Note that activate is not just about showing the popup, 
for example you can change the icon of the marker when its state is changed
but not showing and popups above the active one

### googleMarker.deactivate()

Deactivates current marker 

### googleMarker.onStateChange(callback)

Returns `Function` which removes the subscription once it's invoked

Save the subscriber callback to invoke it every time a state of the marker is changes (activated/deactivated)

#### callback

*Required*<br>
Type: `Function`

Passed callback which should be invoked later

## License
[MIT](https://choosealicense.com/licenses/mit/)