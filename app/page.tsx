"use client";

import { useState, useRef, useCallback } from "react";
import Map, { type MapHandle } from "./map";
import Sidebar from "./sidebar";
import VesselPanel from "./vessel-panel";
import { type Vessel, type VesselFilter } from "./lib/vessel";

export default function Page() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [filter, setFilter] = useState<VesselFilter>({ radius: 50 });
  const mapRef = useRef<MapHandle>(null);

  /** Handle filter changes - clear selected vessel and trigger refetch */
  const handleFilterChange = useCallback((newFilter: VesselFilter) => {
    setFilter(newFilter);
    setSelectedVessel(null);
  }, []);

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
        onVesselClick={(v: Vessel) =>
          mapRef.current?.flyTo(v.LONGITUDE, v.LATITUDE)
        }
      />
      {selectedVessel && (
        <VesselPanel
          vessel={selectedVessel}
          onClose={() => setSelectedVessel(null)}
        />
      )}
    </div>
  );
}
