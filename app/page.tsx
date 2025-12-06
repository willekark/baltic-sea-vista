import Map from "./map";
import NavBar from "./nav-bar";

export default function Page() {
  return (
    <div className="flex flex-row">
      <NavBar />
      <Map />
    </div>
  );
}
