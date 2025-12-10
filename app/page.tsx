"use client";

import { useState, useRef } from "react";
import Map, { type MapHandle } from "./map";
import Sidebar from "./sidebar";
import type { Vessel } from "./types/vessel";

export default function Page() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const mapRef = useRef<MapHandle>(null);

  const handleVesselClick = (vessel: Vessel) => {
    mapRef.current?.flyTo(vessel.LONGITUDE, vessel.LATITUDE);
  };

  return (
    <div className="flex h-screen">
      <Sidebar vessels={vessels} onVesselClick={handleVesselClick} />
      <main className="flex-1">
        <Map ref={mapRef} onVesselsLoaded={setVessels} />
      </main>
    </div>
  );
}
