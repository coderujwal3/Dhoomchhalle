import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { debounce } from "lodash";
import L from "leaflet";
import {
  Navigation,
  LoaderCircle,
  RefreshCw,
  Route as RouteIcon,
  TimerReset,
} from "lucide-react";
import { routeAPI } from "../services/api";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [25.3176, 82.9739];

const MODE_OPTIONS = [
  { value: "balanced", label: "Balanced" },
  { value: "fastest", label: "Fastest" },
  { value: "cheapest", label: "Cheapest" },
  { value: "custom", label: "Custom Weights" },
];

const FALLBACK_TRANSPORTS = [
  { name: "auto", costPerKm: 14, baseFare: 25 },
  { name: "cab", costPerKm: 18, baseFare: 60 },
  { name: "bus", costPerKm: 7, baseFare: 10 },
  { name: "bike", costPerKm: 9, baseFare: 15 },
];

function formatDistance(distanceMeters) {
  const km = Number(distanceMeters || 0) / 1000;
  return `${km.toFixed(2)} km`;
}

function formatDuration(durationSeconds) {
  const totalMinutes = Math.round(Number(durationSeconds || 0) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes} min`;
  return `${hours}h ${minutes}m`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function geometryToPolyline(geometry) {
  if (!Array.isArray(geometry)) return [];
  return geometry
    .filter((point) => Array.isArray(point) && point.length === 2)
    .map(([lng, lat]) => [lat, lng]);
}

async function requestWithRetry(requestFn, retries = 2) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) throw lastError;
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  throw lastError;
}

const ViewportEvents = ({ onBoundsChange }) => {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
    zoomend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
  });

  useEffect(() => {
    const bounds = map.getBounds();
    onBoundsChange({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    });
  }, [map, onBoundsChange]);

  return null;
};

const RoutePlanner = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [routeResult, setRouteResult] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [optimizationMode, setOptimizationMode] = useState("balanced");
  const [weights, setWeights] = useState({
    distanceWeight: 0.34,
    timeWeight: 0.33,
    costWeight: 0.33,
  });
  const [people, setPeople] = useState(1);
  const [transport, setTransport] = useState("auto");
  const [transports, setTransports] = useState(FALLBACK_TRANSPORTS);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [fareLoading, setFareLoading] = useState(false);
  const [fareError, setFareError] = useState("");
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);
  const lastBoundsKeyRef = useRef("");

  const debouncedBoundsHandler = useMemo(
    () =>
      debounce((nextBounds) => {
        setMapBounds(nextBounds);
      }, 420),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedBoundsHandler.cancel();
    };
  }, [debouncedBoundsHandler]);

  useEffect(() => {
    let mounted = true;

    async function bootstrapMeta() {
      try {
        const [transportResponse, popularResponse] = await Promise.all([
          requestWithRetry(() => routeAPI.getTransports(), 1),
          requestWithRetry(() => routeAPI.getPopularRoutes(6), 1),
        ]);

        if (!mounted) return;
        setTransports(
          transportResponse?.data?.data?.length
            ? transportResponse.data.data
            : FALLBACK_TRANSPORTS,
        );
        setPopularRoutes(popularResponse?.data?.data || []);
      } catch {
        if (!mounted) return;
        setTransports(FALLBACK_TRANSPORTS);
      }
    }

    bootstrapMeta();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    const watcherId = navigator.geolocation.watchPosition(
      (position) => {
        setLocationError("");
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        setLocationError(error.message || "Unable to access your location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      },
    );

    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  const loadPlaces = useCallback(async () => {
    if (!mapBounds) return;
    const key = [
      mapBounds.north.toFixed(3),
      mapBounds.south.toFixed(3),
      mapBounds.east.toFixed(3),
      mapBounds.west.toFixed(3),
    ].join("|");

    if (lastBoundsKeyRef.current === key) return;
    lastBoundsKeyRef.current = key;
    setPlacesLoading(true);
    setPlacesError("");

    try {
      const response = await requestWithRetry(
        () =>
          routeAPI.getPlacesByBounds({
            ...mapBounds,
            limit: 1200,
          }),
        2,
      );
      setPlaces(response?.data?.data || []);
    } catch (error) {
      setPlacesError(
        error?.response?.data?.message ||
          "Unable to load places for this area.",
      );
    } finally {
      setPlacesLoading(false);
    }
  }, [mapBounds]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  const calculateFare = useCallback(
    async (route) => {
      if (!route) return;
      setFareLoading(true);
      setFareError("");
      try {
        const response = await requestWithRetry(
          () =>
            routeAPI.calculateFare({
              distanceMeters: route.distanceMeters,
              durationSeconds: route.durationSeconds,
              people,
              transport,
            }),
          1,
        );
        setFareEstimate(response?.data?.data || null);
      } catch (error) {
        setFareError(
          error?.response?.data?.message ||
            "Unable to calculate fare right now.",
        );
      } finally {
        setFareLoading(false);
      }
    },
    [people, transport],
  );

  const selectedRoute = useMemo(() => {
    const routes = routeResult?.routes || [];
    return (
      routes.find((route) => route.routeId === selectedRouteId) ||
      routes[0] ||
      null
    );
  }, [routeResult, selectedRouteId]);

  useEffect(() => {
    if (!selectedRoute) return;
    calculateFare(selectedRoute);
  }, [selectedRoute, calculateFare]);

  const fetchRoute = useCallback(
    async (destination) => {
      if (!userLocation) {
        setRouteError(
          "Allow location access first to compute routes from your position.",
        );
        return;
      }

      setRouteLoading(true);
      setRouteError("");
      setSelectedPlace(destination);
      setFareEstimate(null);

      try {
        const response = await requestWithRetry(
          () =>
            routeAPI.computeRoute({
              start: {
                lat: userLocation.latitude,
                lng: userLocation.longitude,
              },
              end: { lat: destination.latitude, lng: destination.longitude },
              optimization:
                optimizationMode === "custom" ? "balanced" : optimizationMode,
              weights: optimizationMode === "custom" ? weights : undefined,
              people,
              transport,
              profile: "driving",
              alternatives: true,
            }),
          1,
        );

        const data = response?.data?.data;
        setRouteResult(data);
        setSelectedRouteId(
          data?.bestRouteId || data?.routes?.[0]?.routeId || "",
        );
      } catch (error) {
        setRouteError(
          error?.response?.data?.message ||
            "Unable to compute route at the moment.",
        );
      } finally {
        setRouteLoading(false);
      }
    },
    [userLocation, optimizationMode, weights, people, transport],
  );

  return (
    <section className="pt-20 md:pt-24 pb-8 bg-slate-100">
      <div className="mx-auto max-w-400 px-4 md:px-6">
        <div className="mb-4 rounded-2xl bg-white shadow-sm border border-slate-200 px-5 py-4">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Map and Route Planner
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Live location, clustered places, optimized route selection, and
            dynamic fare estimation.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-4 h-fit">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                Route Strategy
              </p>
              <select
                value={optimizationMode}
                onChange={(event) => setOptimizationMode(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {MODE_OPTIONS.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>

            {optimizationMode === "custom" ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">
                  Custom Weights
                </p>
                {["distanceWeight", "timeWeight", "costWeight"].map((key) => (
                  <label key={key} className="block">
                    <span className="text-xs text-slate-600 capitalize">
                      {key.replace("Weight", "")}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={weights[key]}
                      onChange={(event) =>
                        setWeights((prev) => ({
                          ...prev,
                          [key]: Number(event.target.value),
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </label>
                ))}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-slate-600">Transport</span>
                <select
                  value={transport}
                  onChange={(event) => setTransport(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  {transports.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-slate-600">People</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={people}
                  onChange={(event) =>
                    setPeople(Math.max(1, Number(event.target.value || 1)))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </label>
            </div>

            {selectedPlace ? (
              <button
                type="button"
                onClick={() => fetchRoute(selectedPlace)}
                disabled={routeLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 text-white text-sm font-medium px-3 py-2.5 hover:bg-teal-800 disabled:opacity-60"
              >
                {routeLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Recalculate Route
              </button>
            ) : null}

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Status
              </p>
              <p className="text-sm text-slate-700">
                {userLocation
                  ? `Location locked at ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
                  : "Waiting for your current location..."}
              </p>
              {locationError ? (
                <p className="text-xs text-rose-600 mt-1">{locationError}</p>
              ) : null}
              {placesLoading ? (
                <p className="text-xs text-slate-500 mt-1">
                  Refreshing visible map markers...
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  {places.length} places loaded in current map window.
                </p>
              )}
            </div>

            {selectedRoute ? (
              <div className="rounded-xl bg-teal-50 border border-teal-200 p-3 space-y-2">
                <p className="text-sm font-semibold text-teal-900 inline-flex items-center gap-2">
                  <RouteIcon className="h-4 w-4" />
                  Selected Route Summary
                </p>
                <p className="text-sm text-teal-900">
                  Distance: {formatDistance(selectedRoute.distanceMeters)}
                </p>
                <p className="text-sm text-teal-900">
                  Duration: {formatDuration(selectedRoute.durationSeconds)}
                </p>
                <p className="text-sm text-teal-900">
                  Score: {Number(selectedRoute.score || 0).toFixed(2)}
                </p>
              </div>
            ) : null}

            <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1">
              <p className="text-sm font-semibold text-slate-800 inline-flex items-center gap-2">
                <TimerReset className="h-4 w-4" />
                Fare Estimation
              </p>
              {fareLoading ? (
                <p className="text-sm text-slate-600">Calculating fare...</p>
              ) : null}
              {fareError ? (
                <p className="text-sm text-rose-600">{fareError}</p>
              ) : null}
              {fareEstimate ? (
                <>
                  <p className="text-sm text-slate-700">
                    Total fare: {formatCurrency(fareEstimate.totalFare)}
                  </p>
                  <p className="text-sm text-slate-700">
                    Cost per person:{" "}
                    {formatCurrency(fareEstimate.costPerPerson)}
                  </p>
                  <p className="text-sm text-slate-700">
                    Estimated time:{" "}
                    {formatDuration(fareEstimate.estimatedTravelTimeSeconds)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  Choose a destination to view fare breakdown.
                </p>
              )}
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-800 mb-2">
                Popular Routes
              </p>
              <div className="space-y-2 max-h-44 overflow-auto pr-1">
                {popularRoutes.length ? (
                  popularRoutes.map((popular) => (
                    <div
                      key={popular.id}
                      className="rounded-lg border border-slate-100 px-2 py-2 bg-slate-50"
                    >
                      <p className="text-xs text-slate-700">
                        Used {popular.usageCount} times
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDistance(popular.distanceMeters)} •{" "}
                        {formatDuration(popular.durationSeconds)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">
                    No popularity data yet.
                  </p>
                )}
              </div>
            </div>

            {routeError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {routeError}
              </div>
            ) : null}
            {placesError ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {placesError}
              </div>
            ) : null}
          </aside>

          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
            <div className="h-[calc(100vh-10rem)] min-h-120">
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={16}
                className="h-full w-full"
                preferCanvas
              >
                <ViewportEvents onBoundsChange={debouncedBoundsHandler} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {userLocation ? (
                  <CircleMarker
                    center={[userLocation.latitude, userLocation.longitude]}
                    radius={9}
                    pathOptions={{
                      color: "#0f766e",
                      fillColor: "#14b8a6",
                      fillOpacity: 0.9,
                    }}
                  >
                    <Popup>You are here</Popup>
                  </CircleMarker>
                ) : null}

                {selectedPlace ? (
                  <CircleMarker
                    center={[selectedPlace.latitude, selectedPlace.longitude]}
                    radius={8}
                    pathOptions={{
                      color: "#dc2626",
                      fillColor: "#f87171",
                      fillOpacity: 0.85,
                    }}
                  >
                    <Popup>Destination: {selectedPlace.name}</Popup>
                  </CircleMarker>
                ) : null}

                {routeResult?.routes?.map((route) => {
                  const isSelected = route.routeId === selectedRouteId;
                  const positions = route.polyline?.length
                    ? route.polyline
                    : geometryToPolyline(route.geometry);
                  return (
                    <Polyline
                      key={route.routeId}
                      positions={positions}
                      pathOptions={{
                        color: route.isBest
                          ? "#0f766e"
                          : isSelected
                            ? "#f59e0b"
                            : "#64748b",
                        weight: isSelected || route.isBest ? 6 : 4,
                        opacity: route.isBest ? 0.9 : 0.68,
                        dashArray: route.isBest ? undefined : "10 8",
                      }}
                      eventHandlers={{
                        click: () => setSelectedRouteId(route.routeId),
                      }}
                    />
                  );
                })}

                <MarkerClusterGroup
                  chunkedLoading
                  maxClusterRadius={40}
                  spiderfyOnMaxZoom
                >
                  {places.map((place) => (
                    <Marker
                      key={place.id}
                      position={[place.latitude, place.longitude]}
                      raiseOnHover={true}
                      // eventHandlers={{
                      //   click: () => fetchRoute(place),
                      // }}
                    >
                      <Popup>
                        <div className="space-y-2 min-w-50">
                          <p className="font-semibold text-slate-800">
                            {place.name}
                          </p>
                          <p className="text-sm text-slate-600 capitalize">
                            Type: {place.type}
                          </p>
                          <p className="text-sm text-slate-700">
                            Price: {formatCurrency(place.price)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {place.details || "No details available."}
                          </p>
                          <button
                            type="button"
                            onClick={() => fetchRoute(place)}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-900 text-white text-xs px-2 py-1 hover:bg-black"
                          >
                            <Navigation className="h-3 w-3" />
                            Route Here
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoutePlanner;
