"use client";

import { useState, useRef } from "react";
import Map, { type MapHandle } from "./map";
import Sidebar from "./sidebar";
import { type Vessel } from "./lib/vessel";

export default function Page() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const mapRef = useRef<MapHandle>(null);

  return (
    <div className="flex h-screen">
      <Sidebar
        vessels={vessels}
        onVesselClick={(v: Vessel) =>
          mapRef.current?.flyTo(v.LONGITUDE, v.LATITUDE)
        }
      />
      <main className="flex-1">
        <Map ref={mapRef} onVesselsLoaded={setVessels} />
      </main>
    </div>
  );
}
