import InteractiveMaritimeMap from "@/components/InteractiveMaritimeMap";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MaritimeMap = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full relative">
      {/* Back button overlay */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/")}
          className="backdrop-blur-sm bg-background/80 hover:bg-background/90"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Full-screen map */}
      <InteractiveMaritimeMap />
    </div>
  );
};

export default MaritimeMap;
