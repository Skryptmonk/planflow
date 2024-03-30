export function getLatLongBound(coordinates) {
    let bounds = new window.google.maps.LatLngBounds();
    for (let i = 0; i < coordinates.length; i++) {
        bounds.extend(coordinates[i]);
    }
    return bounds;
}

function latRad(lat) {
    var sin = Math.sin(lat * Math.PI / 180);
    var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
}

export function getWithBoundZoom(lat_a, lng_a, lat_b, lng_b) {
    let latDif = Math.abs(latRad(lat_a) - latRad(lat_b))
    let lngDif = Math.abs(lng_a - lng_b)

    let latFrac = latDif / Math.PI
    let lngFrac = lngDif / 360

    let lngZoom = Math.log(1 / latFrac) / Math.log(2)
    let latZoom = Math.log(1 / lngFrac) / Math.log(2)

    return Math.min(lngZoom, latZoom)
}