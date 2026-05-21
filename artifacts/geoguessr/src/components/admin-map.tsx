import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface AdminMapProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}

export default function AdminMap({ lat, lng, onChange }: AdminMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: lat && lng ? [lat, lng] : [20, 0],
        zoom: lat && lng ? 10 : 2,
        worldCopyJump: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        className: 'map-tiles' // Assuming dark mode tweaks in CSS if any
      }).addTo(mapRef.current);

      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        onChange(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (lat !== undefined && lng !== undefined && lat !== null && lng !== null) {
      const pos: L.LatLngTuple = [lat, lng];
      
      if (!markerRef.current) {
        markerRef.current = L.marker(pos).addTo(mapRef.current);
      } else {
        markerRef.current.setLatLng(pos);
      }
      
      // Auto-pan if marker is outside current view (optional, but good UX)
      // mapRef.current.setView(pos, mapRef.current.getZoom());
    } else {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [lat, lng]);

  return <div ref={mapContainerRef} className="w-full h-[400px] z-0 rounded-md border border-border" />;
}
