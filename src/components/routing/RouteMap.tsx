import { useEffect, useRef, useMemo } from 'react';
import Map, { Source, Layer, type MapRef } from 'react-map-gl/maplibre';
import type { LayerSpecification } from 'maplibre-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { RoutingStrategyResult } from '../../types';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const DEFAULT_VIEW = {
  longitude: 116.4074,
  latitude: 39.9042,
  zoom: 4,
};

// Strategy-specific colors matching the design
const STRATEGY_COLORS = {
  Fastest: '#f97316', // orange-500 - direct, fast routes
  Cheapest: '#22c55e', // green-500 - detoured, economical routes
  Balanced: '#2563eb', // blue-600 - moderate routes
};

const STRATEGY_OPACITY = {
  Fastest: 0.9,   // Most prominent (fastest is usually preferred)
  Cheapest: 0.85, // Slightly less prominent
  Balanced: 0.9,  // Equally prominent
};

const STRATEGY_WIDTH = {
  Fastest: 4.5,   // Slightly thicker to emphasize
  Cheapest: 4,    // Standard width
  Balanced: 4,    // Standard width
};

interface RouteMapProps {
  routes: RoutingStrategyResult[];
}

export default function RouteMap({ routes }: RouteMapProps) {
  const mapRef = useRef<MapRef>(null);

  // Calculate bounds to fit all routes
  const routeBounds = useMemo(() => {
    if (!routes.length) return null;

    const coordinates: [number, number][] = [];
    routes.forEach((route) => {
      route.geometry.geometry.coordinates.forEach((coord) => {
        coordinates.push(coord as [number, number]);
      });
    });

    if (!coordinates.length) return null;

    const bounds = new maplibregl.LngLatBounds(coordinates[0], coordinates[0]);
    for (const coord of coordinates) {
      bounds.extend(coord);
    }

    return bounds;
  }, [routes]);

  // Fit bounds when routes change
  useEffect(() => {
    if (!routeBounds || !mapRef.current) return;

    mapRef.current.fitBounds(routeBounds, {
      padding: { top: 60, right: 60, bottom: 60, left: 60 },
      duration: 1000,
      maxZoom: 10,
    });
  }, [routeBounds]);

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <Map
        ref={mapRef}
        initialViewState={DEFAULT_VIEW}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        cooperativeGestures={false}
      >
        {/* Render each strategy route with its specific color */}
        {routes.map((route) => {
          const strategy = route.strategyUsed;
          const color = STRATEGY_COLORS[strategy];
          const opacity = STRATEGY_OPACITY[strategy];
          const width = STRATEGY_WIDTH[strategy];
          const sourceId = `source-${strategy.toLowerCase()}`;
          const layerId = `route-${strategy.toLowerCase()}`;

          const lineLayer: LayerSpecification = {
            id: layerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': color,
              'line-width': width,
              'line-opacity': opacity,
            },
          };

          return (
            <Source
              key={strategy}
              id={sourceId}
              type="geojson"
              data={route.geometry}
            >
              <Layer {...lineLayer} />
            </Source>
          );
        })}
      </Map>

      {/* Legend overlay */}
      {routes.length > 0 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md border border-slate-200 p-3 space-y-2">
          <h4 className="text-xs font-semibold text-slate-700 mb-2">Route Strategies</h4>
          {routes.map((route) => {
            const color = STRATEGY_COLORS[route.strategyUsed];
            const width = STRATEGY_WIDTH[route.strategyUsed];
            return (
              <div key={route.strategyUsed} className="flex items-center gap-2">
                <div
                  className="rounded-full"
                  style={{ 
                    backgroundColor: color,
                    width: '24px',
                    height: `${width}px`,
                  }}
                />
                <span className="text-xs text-slate-600 font-medium">{route.strategyUsed}</span>
              </div>
            );
          })}
          <div className="pt-2 mt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500 italic">
              {routes.length} route{routes.length > 1 ? 's' : ''} calculated
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {routes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80">
          <div className="text-center">
            <svg
              className="w-12 h-12 text-slate-300 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <p className="text-sm text-slate-500">Calculate routes to view map</p>
          </div>
        </div>
      )}
    </div>
  );
}
