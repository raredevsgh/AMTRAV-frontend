import "mapbox-gl/dist/mapbox-gl.css";
import "@/app/console.css";
export const metadata = { title: "Console", robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
