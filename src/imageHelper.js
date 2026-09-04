/**
 * Universal Image focal point & cropping style calculator
 * Ensures horizontal (X-axis), vertical (Y-axis), and zoom controls work seamlessly
 * across all aspect ratios (portrait, square, landscape) for Toppers and Activities.
 */
export function getCroppedImageStyle(item, defaultFy = 50) {
  if (!item) return {};
  const fx = item.focalX !== undefined ? Number(item.focalX) : 50;
  const fy = item.focalY !== undefined ? Number(item.focalY) : defaultFy;
  const zoom = Number(item.zoom) || 1.0;

  // Horizontal pan: shift relative to center (50%)
  // If fx < 50, subject is on left -> pan image right to center it
  // If fx > 50, subject is on right -> pan image left to center it
  const diffX = 50 - fx; // range: -50 to +50
  const diffY = defaultFy - fy; // difference from default reference height

  // Auto-cushion expansion factor so panning off-center never exposes empty container edges
  const cushion = 1 + (Math.abs(diffX) / 100) * 0.5 + (Math.abs(diffY) / 100) * 0.25;
  const finalScale = zoom * cushion;

  // Translation percentage inside scaled container
  const transX = (diffX * 0.45) / finalScale;
  const transY = (diffY * 0.3) / finalScale;

  return {
    objectFit: 'cover',
    objectPosition: `${fx}% ${fy}%`,
    transform: `scale(${finalScale.toFixed(3)}) translate(${transX.toFixed(2)}%, ${transY.toFixed(2)}%)`,
    transformOrigin: `${fx}% ${fy}%`,
    transition: 'transform 0.05s ease-out'
  };
}

/**
 * Specialized style for academic toppers (defaults vertical focal point to 20% hairline/face)
 */
export function getTopperImageStyle(topper) {
  return getCroppedImageStyle(topper, 20);
}
