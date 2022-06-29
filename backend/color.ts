const COLORS = [
  "#2965CC",
  "#29A634",
  "#D99E0B",
  "#D13913",
  "#8F398F",
  "#00B3A4",
  "#DB2C6F",
  "#9BBF30",
  "#96622D",
  "#7157D9",
];

const FALLBACK_COLOR = "grey";

let currentColor = 0;
const idToColor = new Map<string, string>();

export function getColorForId(id: string): string {
  const result = idToColor.get(id);
  if (result != null) {
    return result;
  }
  const color = COLORS[currentColor] || FALLBACK_COLOR;
  currentColor++;
  idToColor.set(id, color);
  return color;
}
