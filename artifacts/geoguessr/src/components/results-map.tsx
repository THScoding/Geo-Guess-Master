import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RoundResult } from '@workspace/api-client-react';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const guessIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'opacity-50 grayscale' // Make guesses visually distinct
});

const correctIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface ResultsMapProps {
  results: RoundResult[];
}

export default function ResultsMap({ results }: ResultsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        worldCopyJump: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        className: 'map-tiles'
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    const bounds = L.latLngBounds([]);

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    if (results.length > 0) {
      results.forEach((round, idx) => {
        const guessLatLng: L.LatLngTuple = [round.guessLat, round.guessLng];
        const correctLatLng: L.LatLngTuple = [round.correctLat, round.correctLng];

        bounds.extend(guessLatLng);
        bounds.extend(correctLatLng);

        // Add correct marker
        L.marker(correctLatLng, { icon: correctIcon })
          .bindPopup(`<b>Round ${round.round}: ${round.locationName}</b><br/>Score: ${round.score}`)
          .addTo(map);

        // Add guess marker
        L.marker(guessLatLng, { icon: guessIcon }).addTo(map);

        // Add connecting line
        L.polyline([guessLatLng, correctLatLng], {
          color: '#f59e0b', // Amber
          weight: 2,
          opacity: 0.6,
          dashArray: '5, 10',
          lineCap: 'round'
        }).addTo(map);
      });

      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([20, 0], 2);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [results]);

  return <div ref={mapContainerRef} className="w-full h-full z-0 bg-muted/20" />;
}
