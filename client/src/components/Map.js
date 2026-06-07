import React, { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { GeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import '../styles/Map.css';

const defaultCenter = [40.7484, -73.9857];

const venueIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const SelectedVenueFlyTo = ({ selectedArcade }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedArcade?.latitude && selectedArcade?.longitude) {
      map.flyTo([Number(selectedArcade.latitude), Number(selectedArcade.longitude)], 15, {
        duration: 0.8,
      });
    }
  }, [map, selectedArcade]);

  return null;
};

const Map = ({ arcades = [], selectedArcade, onSelectArcade }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayData, setOverlayData] = useState(null);

  const locatedArcades = useMemo(
    () => arcades.filter((arcade) => arcade.latitude && arcade.longitude),
    [arcades]
  );

  useEffect(() => {
    if (!showOverlay || overlayData) {
      return;
    }

    fetch('/geojson/manhattan-outline.geojson')
      .then((response) => response.json())
      .then(setOverlayData)
      .catch((error) => console.error('Error loading Manhattan GeoJSON overlay:', error));
  }, [overlayData, showOverlay]);

  return (
    <div className="map-shell">
      <div className="map-header">
        <div>
          <p className="map-eyebrow">GIS Venue Layer</p>
          <h3>Arcade Locations</h3>
        </div>
        <label className="overlay-toggle">
          <input
            type="checkbox"
            checked={showOverlay}
            onChange={(event) => setShowOverlay(event.target.checked)}
          />
          Manhattan outline
        </label>
      </div>
      <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showOverlay && overlayData ? (
          <GeoJSON
            data={overlayData}
            style={{
              color: '#14b8a6',
              fillColor: '#14b8a6',
              fillOpacity: 0.08,
              weight: 2,
            }}
          />
        ) : null}
        {locatedArcades.map((arcade) => (
          <Marker
            key={arcade.id}
            position={[Number(arcade.latitude), Number(arcade.longitude)]}
            icon={venueIcon}
            eventHandlers={{
              click: () => onSelectArcade(arcade),
            }}
          >
            <Popup>
              <div className="map-popup">
                <h4>{arcade.name}</h4>
                <p>{arcade.address}</p>
                <p>Rating: {arcade.average_rating || 0} / 5</p>
                <Link to={`/arcades/${arcade.id}`}>View Details</Link>
              </div>
            </Popup>
          </Marker>
        ))}
        <SelectedVenueFlyTo selectedArcade={selectedArcade} />
      </MapContainer>
    </div>
  );
};

export default Map;
