"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Map, { type MapHandle } from "../../components/map";
import Sidebar from "@/components/sidebar";
import VesselPanel from "@/components/vessel-panel";
import AlgorithmPanel from "../../components/algorithm-panel";
import { type Vessel, type VesselFilter } from "@/app/lib/vessel";

/** Access password for the tracker */
const ACCESS_PASSWORD = "deeper";
const STORAGE_KEY = "tracker-access";

/**
 * Password gate component for protecting the tracker
 * @param props.onSuccess - Callback when correct password is entered
 */
function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ACCESS_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "granted");
      onSuccess();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-8 rounded-lg border border-foreground/20 bg-foreground/5 max-w-sm w-full"
      >
        <h1 className="text-xl font-semibold text-foreground text-center">
          Access Required
        </h1>
        <p className="text-sm text-foreground/60 text-center">
          Enter the password to continue
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="Password"
          className="px-4 py-2 rounded border border-foreground/20 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
          autoFocus
        />
        {error && (
          <p className="text-red-500 text-sm text-center">Incorrect password</p>
        )}
        <button
          type="submit"
          className="px-4 py-2 rounded bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
        >
          Enter
        </button>
      </form>
    </div>
  );
}

export default function Page() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [filter, setFilter] = useState<VesselFilter>({ radius: 50 });
  const [showAlgorithmPanel, setShowAlgorithmPanel] = useState(false);
  const [, forceUpdate] = useState(0);
  const mapRef = useRef<MapHandle>(null);

  /** Check localStorage for existing access on mount */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setIsAuthorized(stored === "granted");
  }, []);

  /** Handle filter changes - clear selected vessel and trigger refetch */
  const handleFilterChange = useCallback((newFilter: VesselFilter) => {
    setFilter(newFilter);
    setSelectedVessel(null);
  }, []);

  /** Force re-render when algorithm weights change */
  const handleWeightsChange = useCallback(() => {
    forceUpdate((n) => n + 1);
    mapRef.current?.updateMarkerColors();
  }, []);

  /** Show nothing while checking auth status */
  if (isAuthorized === null) {
    return null;
  }

  /** Show password gate if not authorized */
  if (!isAuthorized) {
    return <PasswordGate onSuccess={() => setIsAuthorized(true)} />;
  }

  return (
    <div className="relative h-screen">
      <Map
        ref={mapRef}
        filter={filter}
        onVesselsLoaded={setVessels}
        onVesselSelect={setSelectedVessel}
      />
      <Sidebar
        vessels={vessels}
        filter={filter}
        onFilterChange={handleFilterChange}
        onRefetch={() => mapRef.current?.refetch()}
        onTuneAlgorithm={() => setShowAlgorithmPanel(true)}
        onVesselClick={(v: Vessel) => {
          setSelectedVessel(v);
          mapRef.current?.flyTo(v.LONGITUDE, v.LATITUDE);
        }}
      />
      <div className="absolute top-4 right-4 bottom-4 flex flex-row-reverse gap-4 z-10">
        {selectedVessel && (
          <VesselPanel
            vessel={selectedVessel}
            onClose={() => setSelectedVessel(null)}
          />
        )}
        {showAlgorithmPanel && (
          <AlgorithmPanel
            onWeightsChange={handleWeightsChange}
            onClose={() => setShowAlgorithmPanel(false)}
          />
        )}
      </div>
    </div>
  );
}
