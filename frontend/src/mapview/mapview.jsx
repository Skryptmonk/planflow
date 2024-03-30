import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Polyline,
  Marker,
} from "react-google-maps";
import { compose, withProps } from "recompose";
import { inspectionMarker, inspectorMarker } from "../icons/icons";
import { useLayoutEffect, useRef, useState } from "react";
import { getLatLongBound, getWithBoundZoom } from "../helpers/mapHelper";
import { mapStyle } from "../utils/mapStyles";
import { MAPAPI, APIKEY } from "../config";

const MapView = compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${APIKEY}&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `100%` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)((props) => {
  const map = useRef(null);
  const [animateValue, setAnimateValue] = useState(0);
  const [zoomChanged, setZoomChanged] = useState(false);
  const [center, setCenter] = useState({
    lat: 38.75073,
    lng: -9.10441,
    zoomVal: 11,
  });
  const handleApiLoaded = (map, maps) => { };

  let inspectionMarkerPt = new window.google.maps.MarkerImage(
    inspectionMarker,
    null,
    null,
    null,
    new window.google.maps.Size(42, 42)
  );

  let vehicleMarkerPt = new window.google.maps.MarkerImage(
    inspectorMarker,
    null,
    null,
    null,
    new window.google.maps.Size(42, 42)
  );

  // useLayoutEffect(() => {
  //   let lineOffset = 0;
  //   let iconSpeed = 0.2;
  //   setInterval(() => {
  //     lineOffset = (lineOffset + iconSpeed) * 2;
  //     if (lineOffset >= 100) lineOffset = 0;
  //     setAnimateValue(lineOffset);
  //   }, 500);
  // }, []);

  const getPolyline = (latLong, id, color) => {
    return (
      <Polyline
        key={id}
        geodesic={true}
        options={{
          strokeColor: color,
          strokeWeight: 1,
          strokeOpacity: 1,
        }}
        path={latLong}
      />
    );
  };

  const getAnimatedPolyline = (latLong, id, color) => {
    return (
      <Polyline
        key={id}
        geodesic={true}
        options={{
          strokeColor: color,
          strokeWeight: 8,
          strokeOpacity: 0.3,
          icons: [
            {
              iconColor: "black",
              // icon: { path: window.google.maps.SymbolPath.FORWARD_OPEN_ARROW },
              offset: animateValue + "%",
              repeat: "10%",
            },
          ],
        }}
        path={latLong}
      />
    );
  };

  const getMarkerWithoutLabel = (latLong, id, icon, name, color) => {
    return (
      <Marker
        icon={icon}
        key={id}
        title={name}
        animation={window.google.maps.Animation.DROP}
        labelOrigin={{ x: 9, y: 9 }}
        options={{
          size: "10px",
          color: color,
          labelColor: color,
        }}
        position={latLong}
      ></Marker>
    );
  };

  const getMarker = (latLong, id, icon, ind, color, name) => {
    const svg2 = `<svg width="44" height="60" viewBox="0 0 44 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_790_2947)">
      <path d="M43.5 21.75C43.5 24.1257 42.6922 27.0105 41.3536 30.1453C40.0186 33.2718 38.1733 36.6067 36.1378 39.871C32.0675 46.3987 27.2613 52.6049 24.3274 56.2349C24.1249 56.484 23.9124 56.8296 23.7062 57.1748C23.6598 57.2525 23.6133 57.3308 23.5667 57.4094C23.3984 57.6931 23.2281 57.9802 23.0512 58.2527C22.8243 58.6023 22.6062 58.8965 22.3995 59.099C22.1811 59.313 22.0512 59.3499 22 59.3499C21.9488 59.3499 21.8189 59.313 21.6005 59.099C21.3938 58.8965 21.1757 58.6023 20.9488 58.2527C20.7719 57.9802 20.6017 57.6932 20.4334 57.4095C20.3867 57.3309 20.3403 57.2525 20.2938 57.1748C20.0876 56.8296 19.8751 56.484 19.6726 56.2349C16.7387 52.6049 11.9325 46.3987 7.86217 39.871C5.82674 36.6067 3.98143 33.2718 2.6464 30.1453C1.30779 27.0105 0.5 24.1257 0.5 21.75C0.5 10.0237 10.1249 0.5 22 0.5C33.8751 0.5 43.5 10.0237 43.5 21.75Z" fill="${color}" stroke="black"/>
    </g>
    <defs>
      <clipPath id="clip0_790_2947">
        <rect width="44" height="60" fill="white"/>
      </clipPath>
    </defs>
  </svg>`;
    const encodedSvg2 = encodeURIComponent(svg2);
    const customSVGIcon = `data:image/svg+xml;utf8,${encodedSvg2}`;
    return (
      <Marker
        icon={{
          url: customSVGIcon,
          scaledSize: new window.google.maps.Size(40, 40), // Adjust the size as needed
        }}
        key={id}
        title={name}
        animation={window.google.maps.Animation.DROP}
        labelOrigin={{ x: 9, y: 9 }} // Adjust the label position
        label={{
          origin: { x: 9, y: 9 },
          labelOrigin: { x: 9, y: 9 }, // Adjust the label position
          text: ind + "",
          color: "#ffffff",
          fontSize: "14px",
          textAlign: "center",
          position: "absolute"
        }}
        position={latLong}
      ></Marker>
    );
  };


  let selectedData =
    props?.selectedIndex === false
      ? false
      : props?.routeData?.filter((e) => e.vehicle === props?.selectedIndex)[0];
  if (props?.selectedIndex !== false) {
    try {
      let bounds = getLatLongBound(selectedData.latLng);
      let zoomval = getWithBoundZoom(
        bounds.getNorthEast().lng(),
        bounds.getSouthWest().lat(),
        bounds.getSouthWest().lng(),
        bounds.getNorthEast().lat()
      );

      if (
        center.lat !== bounds.getCenter().lat() ||
        center.lng !== bounds.getCenter().lng() ||
        zoomval !== center.zoomVal
      ) {
        setCenter({
          lat: bounds.getCenter().lat(),
          lng: bounds.getCenter().lng(),
          zoomVal: zoomval,
        });
      }
    } catch (err) { }
  }

  if (props.routeData.length > 0) {
    return (
      <GoogleMap
        style={{ width: "100%" }}
        defaultOptions={{
          zoomControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          styles: mapStyle,
        }}
        ref={map}
        zoom={props.zoomLvl ? 10 : center.zoomVal + 1.5}
        center={{ lat: center.lat, lng: center.lng }}
        defaultCenter={center}
        defaultZoom={12}
        onBoundsChanged={() => {
          setZoomChanged(true);
        }}
        yesIWantToUseGoogleMapApiInternals
      >
        {props.routeData &&
          props?.selectedIndex === false &&
          props?.routeData
            ?.filter((e, i) => e && props.hiddenIndex.indexOf(i) === -1)
            .map((e, i) =>
              e.latLng == undefined
                ? null
                : getPolyline(e.latLng, "Path_" + i, e.color)
            )}
        {props?.selectedIndex === false &&
          props?.routeData
            ?.filter(
              (e, i) => e && props.hiddenIndex.indexOf(i) === -1 && e.latLng
            )
            .map((e, i) => getAnimatedPolyline(e.latLng, "Path_" + i, e.color))}
        {props?.selectedIndex !== false &&
          getPolyline(selectedData.latLng, "Path_", selectedData.color)}
        {props?.selectedIndex !== false &&
          getAnimatedPolyline(
            selectedData.latLng,
            "Selected",
            selectedData.color
          )}
        {props?.selectedIndex !== false &&
          selectedData.steps
            .filter((e) => e.type === "start")
            .map((e, i) =>
              getMarkerWithoutLabel(
                { lat: e.location[1], lng: e.location[0] },
                "Vehicle_" + i,
                vehicleMarkerPt,
                JSON.parse(selectedData.description).InspectorName ?? "",
                selectedData.color
              )
            )}
        {props?.selectedIndex !== false &&
          selectedData.steps
            .filter((e) => e.type === "job")
            .map((e, i) =>
              getMarker(
                { lat: e.location[1], lng: e.location[0] },
                "Job_" + i,
                inspectionMarkerPt,
                i + 1,
                selectedData.color,
                JSON.parse(e.description).Address ?? ""
              )
            )}
      </GoogleMap>
    );
  }
});

export default MapView;