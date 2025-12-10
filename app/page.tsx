import Map from "./map";
import Sidebar from "./sidebar";

export default function Page() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">
        <Map />
      </main>
    </div>
  );
}
