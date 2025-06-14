"use client";

import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import { createRoot } from "react-dom/client";
import { IconButton } from "@mui/material";
import { GpsFixed } from "@mui/icons-material";

interface RecenterButtonProps {
  location: [number, number];
}

export function RecenterMapButton({ location }: RecenterButtonProps) {
  const map = useMap();

  useEffect(() => {
    const Control = L.Control.extend({
      onAdd: function () {
        const container = L.DomUtil.create("div");
        container.className = "leaflet-control";
        container.style.backgroundColor = "white";
        container.style.borderRadius = "9999px";

        const root = createRoot(container);
        root.render(
          <IconButton
            onClick={() => map.panTo(location)}
          >
            <GpsFixed />
          </IconButton>
        );

        return container;
      },
    });

    const control = new Control({ position: "bottomright" });
    map.addControl(control);

    return () => {
      map.removeControl(control);
    };
  }, [map, location]);

  return null;
}
