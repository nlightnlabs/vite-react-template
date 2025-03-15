import { useEffect, useState } from "react";

interface propTypes {
  iconName?: string;
  fillColor: string;
  fillOpacity?: number;
  height?: string;
  width?: string;
  hoveredColor?: string;
}

// Dynamically import all SVG components from the `svgs` folder
const svgs = import.meta.glob("./svgs/*.tsx");

const Svg = ({ iconName, fillColor, fillOpacity, height, width, hoveredColor }: propTypes) => {
  const [icons, setIcons] = useState<{ name: string; component: any }[]>([]);

  useEffect(() => {
    const loadIcons = async () => {
      const loadedIcons = await Promise.all(
        Object.entries(svgs).map(async ([path, importer]) => {
          const module:any = await importer(); // Dynamically import the component
          const name:any = path.replace("./svgs/", "").replace(".tsx", ""); // Extract name
          return { name, component: module.default }; // Store the default export
        })
      );
      setIcons(loadedIcons);
    };

    loadIcons();
  }, []);

  // Find the component based on the iconName
  const IconItem = icons.find((i) => i.name === iconName);
  const IconComponent = IconItem ? IconItem.component : null;

  return IconComponent ? (
    <div style={{ height, width }}>
      <IconComponent fillColor={fillColor} fillOpacity={fillOpacity} hoveredColor={hoveredColor} />
    </div>
  ) : null;
};

export default Svg;
