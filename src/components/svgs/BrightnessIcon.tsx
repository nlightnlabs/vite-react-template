import {useState} from "react";

interface propTypes {
    fillColor:string;
    fillOpacity:string;
    hoveredColor: string;
  }

const BrighnessIcon = ({fillColor, fillOpacity, hoveredColor}:propTypes) => {

    const style = {
        height: "100%",
        width: "100%",
        transition: "All 2s ease-in-out"
      }

    const[hovered, setHovered] = useState(false)
      
  return (
    <svg 
        viewBox="0 0 201 202"
        width="201" 
        height="202" 
        xmlns="http://www.w3.org/2000/svg"  
        overflow="hidden"
        style={style}
        onMouseOver={()=>setHovered(true)}
        onMouseLeave={()=>setHovered(false)}
        >
        <defs>
            <clipPath id="clip0">
            <rect x="3190" y="2163" width="201" height="202"/></clipPath><clipPath id="clip1">
                <rect x="3190" y="2163" width="201" height="202"/>
                    </clipPath></defs><g clipPath="url(#clip0)" transform="translate(-3190 -2163)">
                        <g clipPath="url(#clip1)">
                            <path d="M3285.68 2330.99C3250.61 2330.52 3222.55 2300.59 3223.01 2264.15 3223.46 2228.03 3251.75 2199 3286.5 2199L3286.5 2265Z" 
                                stroke={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"} 
                                strokeWidth="13.75" 
                                strokeLinecap="butt" 
                                strokeLinejoin="miter" 
                                strokeMiterlimit="8" 
                                strokeOpacity="1" 
                                fill={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"} 
                                fillRule="evenodd" 
                                fillOpacity={fillOpacity ? fillOpacity: "1"}
                            />
                            <path d="M3290.69 2199C3326.03 2198.82 3354.83 2228.22 3355 2264.68 3355.17 2300.93 3326.96 2330.54 3291.81 2330.99L3291 2265Z"
                                stroke={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"} 
                                strokeWidth="13.75" 
                                strokeLinecap="butt" 
                                strokeLinejoin="miter" 
                                strokeMiterlimit="8" 
                                strokeOpacity="1" 
                                fill="none" 
                                fillRule="evenodd"
                            />
                            <path d="M3280 2168.83C3280 2167.27 3281.27 2166 3282.83 2166L3294.17 2166C3295.73 2166 3297 2167.27 3297 2168.83L3297 2187.17C3297 2188.73 3295.73 2190 3294.17 2190L3282.83 2190C3281.27 2190 3280 2188.73 3280 2187.17Z" 
                                fill={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"}  
                                fillRule="evenodd" 
                                fillOpacity={fillOpacity ? fillOpacity: "1"}
                            />
                            <path d="M3350.65 2190.4C3351.77 2189.27 3353.6 2189.27 3354.73 2190.4L3362.89 2198.56C3364.02 2199.69 3364.02 2201.52 3362.89 2202.64L3349.89 2215.64C3348.76 2216.77 3346.94 2216.77 3345.81 2215.64L3337.65 2207.48C3336.52 2206.35 3336.52 2204.52 3337.65 2203.4Z" 
                                fill={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"} 
                                fillRule="evenodd" 
                                fillOpacity={fillOpacity ? fillOpacity: "1"}
                            />
                            <path d="M3365.83 2273C3364.27 2273 3363 2271.73 3363 2270.17L3363 2258.83C3363 2257.27 3364.27 2256 3365.83 2256L3385.17 2256C3386.73 2256 3388 2257.27 3388 2258.83L3388 2270.17C3388 2271.73 3386.73 2273 3385.17 2273Z" 
                                fill={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"}  
                                fillRule="evenodd" 
                                fillOpacity={fillOpacity ? fillOpacity: "1"}
                            />
                            <path d="M0 2.88587C-3.84394e-16 1.29205 1.29205 -3.84393e-16 2.88588 -3.84393e-16L14.4291 0C16.0229 -3.84393e-16 17.315 1.29205 17.315 2.88587L17.315 21.2683C17.315 22.8621 16.0229 24.1542 14.4291 24.1542L2.88588 24.1542C1.29205 24.1542 3.84394e-16 22.8621 0 21.2683Z" 
                                fill={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"}  
                                fillRule="evenodd" 
                                fillOpacity={fillOpacity ? fillOpacity: "1"} 
                                transform="matrix(-0.707107 0.707107 0.707107 0.707107 3224.35 2188.36)"
                            />
                            <path d="M0 2.83337C-3.81941e-16 1.26854 1.26854 -3.81941e-16 2.83337 -3.81941e-16L14.1665 0C15.7313 -3.81941e-16 16.9998 1.26854 16.9998 2.83337L16.9998 21.1667C16.9998 22.7315 15.7313 24.0001 14.1665 24.0001L2.83337 24.0001C1.26854 24.0001 0 22.7315 0 21.1667Z" 
                                fill={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"} 
                                fillRule="evenodd" 
                                fillOpacity={fillOpacity ? fillOpacity: "1"} 
                                transform="matrix(-1.83697e-16 -1 -1 1.83697e-16 3214 2273)"
                            />
                            <path d="M3297 2362.17C3297 2363.73 3295.73 2365 3294.17 2365L3282.83 2365C3281.27 2365 3280 2363.73 3280 2362.17L3280 2343.83C3280 2342.27 3281.27 2341 3282.83 2341L3294.17 2341C3295.73 2341 3297 2342.27 3297 2343.83Z" 
                                fill={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"}  
                                fillRule="evenodd" 
                                fillOpacity={fillOpacity ? fillOpacity: "1"}
                            />
                            <path d="M3226.56 2340.48C3225.44 2341.61 3223.61 2341.61 3222.48 2340.48L3214.32 2332.32C3213.19 2331.19 3213.19 2329.36 3214.32 2328.23L3227.32 2315.24C3228.45 2314.11 3230.27 2314.11 3231.4 2315.24L3239.56 2323.4C3240.69 2324.53 3240.69 2326.35 3239.56 2327.48Z" 
                                fill={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"}  
                                fillRule="evenodd" 
                                fillOpacity={fillOpacity ? fillOpacity: "1"}
                            />
                            <path d="M0 2.88587C-3.84394e-16 1.29205 1.29205 -3.84393e-16 2.88588 -3.84393e-16L14.4291 0C16.0229 -3.84393e-16 17.315 1.29205 17.315 2.88587L17.315 21.2683C17.315 22.8621 16.0229 24.1542 14.4291 24.1542L2.88588 24.1542C1.29205 24.1542 3.84394e-16 22.8621 0 21.2683Z" 
                                fill={hoveredColor && hovered ? hoveredColor : fillColor ? fillColor : "rgb(200,200,200)"} 
                                fillRule="evenodd" 
                                fillOpacity={fillOpacity ? fillOpacity: "1"} 
                                transform="matrix(0.707107 -0.707107 -0.707107 -0.707107 3352.86 2342.52)"
                />
            </g>
        </g>
    </svg>
  )
}

export default BrighnessIcon;

