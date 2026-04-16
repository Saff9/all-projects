// src/components/Playground.js
export default function Playground({ id, height = 500 }) {
  return (
    <iframe
      src={`https://stackblitz.com/edit/${id}?embed=1&file=index.html`}
      className="w-full rounded-lg border border-craft-border my-8"
      style={{ height }}
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    />
  );
}
