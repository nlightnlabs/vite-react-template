

export function getSyleProp(className:string, property:string) {
    // Create a temporary element
    const tempElement = document.createElement("div");
    tempElement.className = className;
    document.body.appendChild(tempElement);

    // Get computed styles
    const classStyle:any = getComputedStyle(tempElement);
    const style = classStyle[property]; // Or any other CSS property

    // Remove the temporary element
    document.body.removeChild(tempElement);

    return style;
}


export function getColor(className:string) {
    // Create a temporary element
    const tempElement = document.createElement("div");
    tempElement.className = className;
    document.body.appendChild(tempElement);

    // Get computed styles
    const classStyle = getComputedStyle(tempElement);
    const style = classStyle.color; // Or any other CSS property

    // Remove the temporary element
    document.body.removeChild(tempElement);

    return style;
}


export function getFontSize(className:string) {
    // Create a temporary element
    const tempElement = document.createElement("div");
    tempElement.className = className;
    document.body.appendChild(tempElement);

    // Get computed styles
    const classStyle = getComputedStyle(tempElement);
    const style = classStyle.fontSize; // Or any other CSS property

    // Remove the temporary element
    document.body.removeChild(tempElement);

    return style;
}

