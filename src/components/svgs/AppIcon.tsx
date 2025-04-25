interface propTypes {
  fillColor:string;
  fillOpacity:string;
}

const AppIcon = ({fillColor, fillOpacity}:propTypes) => {

  const style={
    width: "100%",
    height: "100%",
  }
  return (
    <svg
      viewBox="0 0 150 150"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <defs>
        <mask id="a-cutout-mask">
          <rect width="150" height="150" rx="20" ry="20" fill={fillColor? fillColor: 'lightgray'} />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="80"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fill="black"
            fillOpacity={fillOpacity ? fillOpacity: "1"}
          >
            A
          </text>
        </mask>
      </defs>
      <rect
        width="150"
        height="150"
        rx="20"
        ry="20"
        fill={fillColor? fillColor: 'lightgray'}
        mask="url(#a-cutout-mask)"
      />
    </svg>
  );
};

export default AppIcon;

