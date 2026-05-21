import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon paths
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom icons
const guessIcon = new L.Icon({
  iconUrl: markerIcon, // Could use a custom colored pin if available
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const correctIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


interface GameMapProps {
  onGuessSelect: (coords: {lat: number, lng: number}) => void;
  guessCoords: {lat: number, lng: number} | null;
  guessResult?: any;
  isRoundOver: boolean;
}

export default function GameMap({ onGuessSelect, guessCoords, guessResult, isRoundOver }: GameMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const guessMarkerRef = useRef<L.Marker | null>(null);
  const correctMarkerRef = useRef<L.Marker | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        worldCopyJump: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        className: 'map-tiles'
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

      // Handle clicks
      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        if (isRoundOver) return; // Ignore clicks if round is over
        const { lat, lng } = e.latlng;
        onGuessSelect({ lat, lng });
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync guess marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (guessCoords) {
      if (!guessMarkerRef.current) {
        guessMarkerRef.current = L.marker([guessCoords.lat, guessCoords.lng], { icon: guessIcon }).addTo(mapRef.current);
      } else {
        guessMarkerRef.current.setLatLng([guessCoords.lat, guessCoords.lng]);
      }
    } else {
      if (guessMarkerRef.current) {
        guessMarkerRef.current.remove();
        guessMarkerRef.current = null;
      }
    }
  }, [guessCoords]);

  // Handle round result visualization
  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous result lines/markers if not in round over state
    if (!isRoundOver) {
      if (correctMarkerRef.current) {
        correctMarkerRef.current.remove();
        correctMarkerRef.current = null;
      }
      if (lineRef.current) {
        lineRef.current.remove();
        lineRef.current = null;
      }
      
      // Reset view
      if (guessCoords) {
        // preserve zoom if we have a guess, else center world
      } else {
         mapRef.current.setView([20, 0], 2);
      }
      return;
    }

    if (guessResult && guessCoords) {
      const correctLatLng: L.LatLngTuple = [guessResult.correctLat, guessResult.correctLng];
      const guessLatLng: L.LatLngTuple = [guessCoords.lat, guessCoords.lng];

      // Add correct marker
      if (!correctMarkerRef.current) {
        correctMarkerRef.current = L.marker(correctLatLng, { icon: correctIcon })
          .bindPopup(`<b>${guessResult.correctName || 'Target'}</b>`)
          .addTo(mapRef.current);
      } else {
        correctMarkerRef.current.setLatLng(correctLatLng);
      }

      // Add line
      if (!lineRef.current) {
        lineRef.current = L.polyline([guessLatLng, correctLatLng], {
          color: '#f59e0b', // Primary amber
          weight: 3,
          opacity: 0.8,
          dashArray: '10, 10',
          lineCap: 'round'
        }).addTo(mapRef.current);
      }

      // Fit bounds to show both markers
      const bounds = L.latLngBounds([guessLatLng, correctLatLng]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
      
      // Open popup
      correctMarkerRef.current.openPopup();
    }
  }, [isRoundOver, guessResult, guessCoords]);


  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      {isRoundOver && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-transparent z-[500] pointer-events-none" />
      )}
    </div>
  );
}
