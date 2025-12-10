"use client";

import { useState, useRef } from "react";
import Map, { type MapHandle } from "./map";
import Sidebar from "./sidebar";
import VesselPanel from "./vessel-panel";
import { type Vessel } from "./lib/vessel";

export default function Page() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const mapRef = useRef<MapHandle>(null);

  return (
    <div className="relative h-screen">
      <Map
        ref={mapRef}
        onVesselsLoaded={setVessels}
        onVesselSelect={setSelectedVessel}
      />
      <Sidebar
        vessels={vessels}
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
