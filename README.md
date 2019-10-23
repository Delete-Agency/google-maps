# Google Maps

A wrapper around [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/reference) which supports custom popups out of the box and simplify common tasks.
[Live Demo](https://delete-agency.github.io/google-maps/)

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
        fitPaddings: {
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
    }
]);
map.setPolygons([
    {
        paths: [{lat: 51.458, lng:-0.08677}, {lat: 51.45703, lng:-0.1087},  {lat:51.45282, lng:-0.0922}, {lat: 51.45324, lng:-0.0918},  {lat:51.45343, lng:-0.0903 }, {lat: 51.456, lng:-0.08767}, {lat: 51.458, lng:-0.08677}],
        strokeColor: '#0033ff',
        strokeOpacity: 0.3,
        strokeWeight: 4,
        fillColor: '#0033ff',
        fillOpacity: 0.1,
    }
]);
map.render();
```

## Options

The full list of native google.maps.MapOptions can be found [here](https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions)
and can be passed as the second argument: new GoogleMap(element, mapOptions, **options**)
<br>
Below you can find options for GoogleMap itself (these are passed to the GoogleMap constructor as the third argument - new GoogleMap(element, mapOptions, **options**))

### createMarker

Type: `Function`<br>
Default: `null`

If provided this function should return an instance of GoogleMarker class.
<br>
It is called with the following arguments: ({id, map, mapInstance, config, options}) => { ... }
See [GoogleMarker API](#googlemarker-api) 

### initPromise

Type: `Function`<br>
Default: `null`

### autoFitOnRender

Type: `boolean`<br>
Default: `true`

### autoFitPopup

Type: `boolean`<br>
Default: `true`

### deactivateMarkerOnMapClick

Type: `boolean`<br>
Default: `true`

### getPopupContent

Type: `Function`<br>
Default: `null`

See [examples](https://delete-agency.github.io/google-maps/) 

### fitPaddings

Type: `Object`<br>
Default: `{top: 0, bottom: 0, left: 0, right: 0}`

### fitPopupPaddings

Type: `Object`<br>
Default: `{top: 0, bottom: 0, left: 0, right: 0}`

## GoogleMap API

### new GoogleMap(element ,mapOptions = {}, options = {})

Returns new GoogleMap instance

#### element

*Required*<br>
Type: `HTMLElement`

An element which holds the map

#### mapOptions (see [here](https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions))

*Optional*<br>
Type: `google.maps.MapOptions`

#### options

*Optional*<br>
Type: `Object`

### map.render()

Renders the map itself and other objects (markers, polylines, polygons)

**Note**: Just creating an instance doesn't render anything, 
you have to implicitly call its render method to render initial map 
or reflect a changes after map.setMarkers/setPolylines/setPolygons is called

### map.setMarkers(markers)

Save markers to render them once render() method is called

#### markers

*Required*<br>
Type: `google.maps.MarkerOptions[]`

An array of objects which are inherited from [google.maps.MarkerOptions](https://developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions)
<br> If you want a particular marker to show a popup you can extend its options object with `popupElement` property.
<br> It should contain an HTMLElement which will be used as the content of the popup
<br> Also you can identify every marker by passing additional property `id`.
`id` is used in order to avoid redundant destroying and creating markers instance
when setMarkers(...) + render() are called multiple times but some of the provided markers are already rendered. 
<br> `id` is optional because by default it uses the whole marker config object as a key.
But if you already have identifiers in you markers or going to call map.getMarkersById() later and interact with markers directly
it makes sense to use your own id value.

### map.setPolylines(polylines)

Save polylines configs to render them once render() method is called

#### polylines

*Required*<br>
Type: `google.maps.PolylineOptions[]`

An array of objects which are inherited from [google.maps.PolylineOptions](https://developers.google.com/maps/documentation/javascript/reference/polygon#PolylineOptions)
<br>
Uses the same idea with `id` as [markers](#markers)

### map.setPolygons(polygons)

Save polygons configs to render them once render() method is called

#### polygons

*Required*<br>
Type: `google.maps.PolygonOptions[]`

An array of objects which are inherited from [google.maps.PolygonOptions](https://developers.google.com/maps/documentation/javascript/reference/polygon#PolygonOptions)
<br>
Uses the same idea with `id` as [markers](#markers)

### map.getInstance()

Returns `Promise<google.maps.Map>`

### map.fitDrawings()

Fits previously rendered objects (markers, polylines, polygons) within the map

### map.getMarkersCount()

Returns `integer`

Return the quantity of the rendered markers

### map.getPolylinesCount()

Returns `integer`

Return the quantity of the rendered polylines

### map.getPolygonsCount()

Returns `integer`

Return the quantity of the rendered polygons

### map.getMarkerById(id)

Returns `GoogleMarker`

Return an instance of the rendered GoogleMarker by the provided id

#### id

*Required*<br>
Type: `(string|Object)`

The id of the marker. Read about it (here)[#markers] 

### map.getPolylineById(id)

Returns `GooglePolyline`

Return an instance of the rendered GooglePolyline by the provided id

#### id

*Required*<br>
Type: `(string|Object)`

The id of the polyline. Read about it (here)[#markers] 

### map.getPolygonById(id)

Returns `GooglePolygon`

Return an instance of the rendered GooglePolygon by the provided id

#### id

*Required*<br>
Type: `(string|Object)`

The id of the polygon. Read about it (here)[#markers] 

## GoogleMarker API

### new GoogleMarker({id, map, mapInstance, config, options})

You don't need to create GoogleMarker instances manually until you want to use custom markers classes with (createMarker)[#createmarker]

### googleMarker.getInstance()

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
but not show any popup above it

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