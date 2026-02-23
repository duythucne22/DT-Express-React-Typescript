import { useRef, useCallback, useMemo, useEffect } from 'react';
import MapGL, { Marker, Popup, Source, Layer, NavigationControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { DeliveryAgent, TrackingRouteLeg } from '../../types';
import { AGENT_STATUS_CONFIG } from '../../lib/constants';
import AgentMarker from './AgentMarker';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// Pacific center — between China and US
const DEFAULT_VIEW = {
  longitude: 121.4737,
  latitude: 31.2304,
  zoom: 4,
};

const localRouteLayerStyle: maplibregl.LayerSpecification = {
  id: 'route-local',
  type: 'line',
  paint: {
    'line-color': '#f97316',
    'line-width': 4,
    'line-opacity': 0.85,
  },
  filter: ['in', ['get', 'legType'], ['literal', ['LocalPickup', 'LocalDropoff']]],
  source: 'route-legs',
};

const shipRouteLayerStyle: maplibregl.LayerSpecification = {
  id: 'route-ship',
  type: 'line',
  paint: {
    'line-color': '#0ea5e9',
    'line-width': 4,
    'line-opacity': 0.9,
    'line-dasharray': [2, 2],
  },
  filter: ['==', ['get', 'legType'], 'InternationalShip'],
  source: 'route-legs',
};

const planeRouteLayerStyle: maplibregl.LayerSpecification = {
  id: 'route-plane',
  type: 'line',
  paint: {
    'line-color': '#7c3aed',
    'line-width': 4,
    'line-opacity': 0.9,
    'line-dasharray': [1, 2],
  },
  filter: ['==', ['get', 'legType'], 'InternationalPlane'],
  source: 'route-legs',
};

interface InteractiveMapProps {
  agents: DeliveryAgent[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
  routeGeojson?: GeoJSON.Feature<GeoJSON.LineString> | null;
  routeLegs?: TrackingRouteLeg[];
}

export default function InteractiveMap({ agents, selectedAgentId, onSelectAgent, routeGeojson, routeLegs = [] }: InteractiveMapProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hasRoute = routeLegs.length > 0 || Boolean(routeGeojson);
  const popupAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId) ?? null,
    [agents, selectedAgentId]
  );

  // Follow selected agent when no route overlay is active.
  useEffect(() => {
    if (!popupAgent || !mapRef.current || hasRoute) return;
    mapRef.current.flyTo({
      center: [popupAgent.currentLocation.lng, popupAgent.currentLocation.lat],
      zoom: Math.max(mapRef.current.getZoom(), 12),
      duration: 800,
    });
  }, [popupAgent, hasRoute]);

  const handleMapLoad = useCallback((evt: { target: maplibregl.Map }) => {
    mapRef.current = evt.target;
  }, []);

  const routeData = useMemo(() => {
    if (routeLegs.length > 0) {
      return {
        type: 'FeatureCollection' as const,
        features: routeLegs.map((leg) => ({
          ...leg.geometry,
          properties: {
            ...(leg.geometry.properties ?? {}),
            legId: leg.id,
            legType: leg.legType,
            label: leg.label,
            icon: leg.icon,
            distanceKm: leg.distanceKm,
          },
        })),
      };
    }

    if (!routeGeojson) return null;
    return {
      type: 'FeatureCollection' as const,
      features: [routeGeojson],
    };
  }, [routeGeojson, routeLegs]);

  const routeBounds = useMemo(() => {
    const coordinates: [number, number][] = [];

    if (routeLegs.length > 0) {
      for (const leg of routeLegs) {
        for (const point of leg.geometry.geometry.coordinates) {
          coordinates.push([point[0], point[1]]);
        }
      }
    } else if (routeGeojson) {
      for (const point of routeGeojson.geometry.coordinates) {
        coordinates.push([point[0], point[1]]);
      }
    }

    if (!coordinates.length) return null;

    const bounds = new maplibregl.LngLatBounds(coordinates[0], coordinates[0]);
    for (const point of coordinates) {
      bounds.extend(point);
    }
    return bounds;
  }, [routeGeojson, routeLegs]);

  // When a route is loaded, show the whole path.
  useEffect(() => {
    if (!routeBounds || !mapRef.current) return;
    mapRef.current.fitBounds(routeBounds, {
      padding: { top: 72, right: 72, bottom: 72, left: 72 },
      duration: 900,
      maxZoom: 8,
    });
  }, [routeBounds]);

  const legMarkers = useMemo(() => {
    if (!routeLegs.length) return [];
    return routeLegs.map((leg) => {
      const points = leg.geometry.geometry.coordinates;
      const mid = points[Math.floor(points.length / 2)] ?? points[0];
      const icon = leg.icon === 'ship' ? '🚢' : leg.icon === 'plane' ? '✈️' : leg.icon === 'bike' ? '🏍️' : leg.icon === 'van' ? '🚐' : '🚚';
      return {
        id: leg.id,
        icon,
        label: leg.label,
        lng: mid[0],
        lat: mid[1],
      };
    });
  }, [routeLegs]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <MapGL
        mapLib={maplibregl}
        initialViewState={DEFAULT_VIEW}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        onLoad={handleMapLoad}
      >
        <NavigationControl position="top-right" />

        {/* Agent markers */}
        {agents.map((agent) => (
          <Marker
            key={agent.id}
            longitude={agent.currentLocation.lng}
            latitude={agent.currentLocation.lat}
            anchor="center"
          >
            <AgentMarker
              status={agent.status}
              vehicleType={agent.vehicleType}
              isSelected={agent.id === selectedAgentId}
              onClick={() => onSelectAgent(agent.id)}
            />
          </Marker>
        ))}

        {/* Popup for selected agent */}
        {popupAgent && (
          <Popup
            longitude={popupAgent.currentLocation.lng}
            latitude={popupAgent.currentLocation.lat}
            anchor="bottom"
            offset={20}
            closeOnClick={false}
            onClose={() => onSelectAgent(popupAgent.id)}
            className="tracking-popup"
          >
            <div className="p-2 min-w-[180px]">
              <p className="font-semibold text-slate-900 text-sm">{popupAgent.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${AGENT_STATUS_CONFIG[popupAgent.status].dotColor}`} />
                {AGENT_STATUS_CONFIG[popupAgent.status].label} · {popupAgent.region}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {popupAgent.assignedOrders.length} active orders · ★ {popupAgent.rating}
              </p>
            </div>
          </Popup>
        )}

        {/* Route polyline */}
        {routeData && (
          <Source id={routeLegs.length > 0 ? 'route-legs' : 'route'} type="geojson" data={routeData}>
            {routeLegs.length > 0 ? (
              <>
                <Layer {...localRouteLayerStyle} />
                <Layer {...shipRouteLayerStyle} />
                <Layer {...planeRouteLayerStyle} />
              </>
            ) : (
              <Layer
                id="route-line"
                type="line"
                paint={{ 'line-color': '#f97316', 'line-width': 4, 'line-opacity': 0.8 }}
                source="route"
              />
            )}
          </Source>
        )}

        {legMarkers.map((marker) => (
          <Marker key={marker.id} longitude={marker.lng} latitude={marker.lat} anchor="center">
            <div className="px-2 py-0.5 rounded-full bg-white border border-slate-200 shadow text-xs flex items-center gap-1">
              <span>{marker.icon}</span>
              <span className="text-slate-600">{marker.label}</span>
            </div>
          </Marker>
        ))}
      </MapGL>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-3 text-xs">
        <p className="font-semibold text-slate-800 mb-2">Agent Status</p>
        <div className="space-y-1.5">
          {(['Available', 'OnDelivery', 'Break', 'Offline'] as const).map((status) => {
            const cfg = AGENT_STATUS_CONFIG[status];
            return (
              <div key={status} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotColor}`} />
                <span className="text-slate-600">{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
