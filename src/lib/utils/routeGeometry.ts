/**
 * Utility functions for generating realistic route geometries with curved polylines
 */

interface RoutePoint {
  lat: number;
  lng: number;
}

/**
 * Generate a realistic curved route between two points
 * @param origin Starting point
 * @param destination Ending point
 * @param variationFactor How much the route deviates (0.0 = direct, 1.0 = highly detoured)
 * @param steps Number of intermediate waypoints (more = smoother curve)
 * @returns GeoJSON LineString feature
 */
export function generateRealisticRoute(
  origin: RoutePoint,
  destination: RoutePoint,
  variationFactor: number,
  steps: number = 18
): GeoJSON.Feature<GeoJSON.LineString> {
  const coordinates: [number, number][] = [];
  
  // Calculate the distance-based scale for deviations
  const latDiff = destination.lat - origin.lat;
  const lngDiff = destination.lng - origin.lng;
  const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  
  // Base deviation scale (proportional to distance)
  const deviationScale = distance * variationFactor * 0.3;
  
  // Generate waypoints with sinusoidal variation
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // Progress along route (0 to 1)
    
    // Linear interpolation for base path
    const baseLng = origin.lng + lngDiff * t;
    const baseLat = origin.lat + latDiff * t;
    
    // Calculate perpendicular offset for deviation
    // Use perpendicular direction to the main vector
    const perpLng = -latDiff; // Perpendicular in lng direction
    const perpLat = lngDiff;   // Perpendicular in lat direction
    const perpLength = Math.sqrt(perpLng * perpLng + perpLat * perpLat);
    
    // Normalize perpendicular vector
    const normPerpLng = perpLength > 0 ? perpLng / perpLength : 0;
    const normPerpLat = perpLength > 0 ? perpLat / perpLength : 0;
    
    // Apply sinusoidal deviation (creates smooth curves)
    // Use sin wave that peaks in the middle of the route
    const deviationAmount = Math.sin(t * Math.PI) * deviationScale;
    
    // Add secondary wave for more natural variation
    const secondaryWave = Math.sin(t * Math.PI * 3) * deviationScale * 0.2;
    
    const totalDeviation = deviationAmount + secondaryWave;
    
    // Apply deviation perpendicular to main direction
    const finalLng = baseLng + normPerpLng * totalDeviation;
    const finalLat = baseLat + normPerpLat * totalDeviation;
    
    coordinates.push([finalLng, finalLat]);
  }
  
  // Smooth the path with a simple moving average (3-point window)
  const smoothed = smoothPath(coordinates, 3);
  
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: smoothed,
    },
  };
}

/**
 * Generate a route with asymmetric detours (for cheaper/longer routes)
 * @param origin Starting point
 * @param destination Ending point
 * @param detourFactor How much to detour (0.0 = direct, 1.0 = heavy detour)
 * @param steps Number of waypoints
 * @returns GeoJSON LineString feature
 */
export function generateDetouredRoute(
  origin: RoutePoint,
  destination: RoutePoint,
  detourFactor: number,
  steps: number = 20
): GeoJSON.Feature<GeoJSON.LineString> {
  const coordinates: [number, number][] = [];
  
  const latDiff = destination.lat - origin.lat;
  const lngDiff = destination.lng - origin.lng;
  const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  
  const deviationScale = distance * detourFactor * 0.4;
  
  // Generate waypoints with asymmetric deviations (simulates taking different routes)
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    
    const baseLng = origin.lng + lngDiff * t;
    const baseLat = origin.lat + latDiff * t;
    
    // Perpendicular direction
    const perpLng = -latDiff;
    const perpLat = lngDiff;
    const perpLength = Math.sqrt(perpLng * perpLng + perpLat * perpLat);
    const normPerpLng = perpLength > 0 ? perpLng / perpLength : 0;
    const normPerpLat = perpLength > 0 ? perpLat / perpLength : 0;
    
    // Asymmetric deviation (alternates sides to create realistic detours)
    let deviation = 0;
    
    // First half: deviate to one side
    if (t < 0.5) {
      deviation = Math.sin(t * Math.PI * 2) * deviationScale * 1.2;
    } else {
      // Second half: deviate to opposite side
      deviation = Math.sin((t - 0.5) * Math.PI * 2) * deviationScale * -0.8;
    }
    
    // Add some randomness for realism (but deterministic based on position)
    const jitter = Math.sin(t * 37.5) * deviationScale * 0.15;
    const totalDeviation = deviation + jitter;
    
    const finalLng = baseLng + normPerpLng * totalDeviation;
    const finalLat = baseLat + normPerpLat * totalDeviation;
    
    coordinates.push([finalLng, finalLat]);
  }
  
  const smoothed = smoothPath(coordinates, 3);
  
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: smoothed,
    },
  };
}

/**
 * Smooth a path using moving average
 * @param coordinates Array of [lng, lat] points
 * @param windowSize Window size for moving average (must be odd)
 * @returns Smoothed coordinates
 */
function smoothPath(
  coordinates: [number, number][],
  windowSize: number
): [number, number][] {
  if (coordinates.length < windowSize) {
    return coordinates;
  }
  
  const smoothed: [number, number][] = [];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = 0; i < coordinates.length; i++) {
    // Keep first and last points unchanged
    if (i < halfWindow || i >= coordinates.length - halfWindow) {
      smoothed.push(coordinates[i]);
      continue;
    }
    
    // Calculate average of surrounding points
    let sumLng = 0;
    let sumLat = 0;
    let count = 0;
    
    for (let j = -halfWindow; j <= halfWindow; j++) {
      const idx = i + j;
      if (idx >= 0 && idx < coordinates.length) {
        sumLng += coordinates[idx][0];
        sumLat += coordinates[idx][1];
        count++;
      }
    }
    
    smoothed.push([sumLng / count, sumLat / count]);
  }
  
  return smoothed;
}
