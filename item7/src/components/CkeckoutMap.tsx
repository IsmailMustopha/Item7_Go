"use client";
import React, { useEffect, useState } from "react";
// Import L but be careful with top-level execution
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

type Props = {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
};

const CkeckoutMap = ({ position, setPosition }: Props) => {
  // Define the icon inside the component or useMemo to ensure L is available
  const markerIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const DraggableMarker: React.FC = () => {
    const map = useMap();

    useEffect(() => {
      if (position) {
        map.setView(position as LatLngExpression, 15, { animate: true });
      }
    }, [position, map]);

    return (
      <Marker
        icon={markerIcon}
        position={position as LatLngExpression}
        draggable={true}
        eventHandlers={{
          dragend: (e: L.LeafletEvent) => {
            const marker = e.target as L.Marker;
            const { lat, lng } = marker.getLatLng();
            setPosition([lat, lng]);
          },
        }}
      />
    );
  };

  return (
    <div className="h-full w-full min-h-[400px]">
      {" "}
      {/* Ensure container has height */}
      <MapContainer
        center={position as LatLngExpression}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }} // Leaflet needs explicit CSS height
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <DraggableMarker />
      </MapContainer>
    </div>
  );
};

export default CkeckoutMap;

// "use client";
// import React, { useEffect, useState } from "react";
// import L, { LatLngExpression } from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { OpenStreetMapProvider } from "leaflet-geosearch";
// import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

// const markerIcon = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
//   iconSize: [40, 40],
//   iconAnchor: [20, 40],
// });

// type props = {
//   position: [number, number];
//   setPosition: (pos: [number, number]) => void;
// };

// const CkeckoutMap = ({ position, setPosition }: props) => {
//   // const [position, setPosition] = useState<[number, number] | null>(null);

//   const DraggableMarker: React.FC = () => {
//     const map = useMap();
//     useEffect(() => {
//       if (position)
//         map.setView(position as LatLngExpression, 15, { animate: true });
//     }, [position, map]);

//     return (
//       <Marker
//         icon={markerIcon}
//         position={position as LatLngExpression}
//         draggable={true}
//         eventHandlers={{
//           dragend: (e: L.LeafletEvent) => {
//             const marker = e.target as L.Marker;
//             const { lat, lng } = marker.getLatLng();
//             setPosition([lat, lng]);
//           },
//         }}
//       />
//     );
//   };
//   return (
//     <MapContainer
//       center={position as LatLngExpression}
//       zoom={13}
//       scrollWheelZoom={false}
//       className="h-full w-full"
//     >
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//       <DraggableMarker />
//     </MapContainer>
//   );
// };

// export default CkeckoutMap;
