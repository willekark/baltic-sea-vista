"use client";

import { useState, useRef } from "react";
import Map, { type MapHandle } from "./map";
import Sidebar from "./sidebar";
import { type Vessel } from "./lib/vessel";

export default function Page() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const mapRef = useRef<MapHandle>(null);

  return (
    <div className="relative h-screen">
      <Map ref={mapRef} onVesselsLoaded={setVessels} />
      <Sidebar
        vessels={vessels}
        onVesselClick={(v: Vessel) =>
          mapRef.current?.flyTo(v.LONGITUDE, v.LATITUDE)
        }
      />
    </div>
  );
}
