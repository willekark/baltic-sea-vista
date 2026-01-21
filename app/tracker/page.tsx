"use client";

import { useState, useRef, useCallback } from "react";
import Map, { type MapHandle } from "../../components/map";
import Sidebar from "@/components/sidebar";
import VesselPanel from "@/components/vessel-panel";
import AlgorithmPanel from "../../components/algorithm-panel";
import { type Vessel, type VesselFilter } from "@/app/lib/vessel";

export default function Page() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [filter, setFilter] = useState<VesselFilter>({ radius: 50 });
  const [showAlgorithmPanel, setShowAlgorithmPanel] = useState(false);
  const [, forceUpdate] = useState(0);
  const mapRef = useRef<MapHandle>(null);

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
