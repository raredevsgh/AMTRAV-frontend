import type { Metadata } from "next";
import ConfiguratorClient from "./ConfiguratorClient";

export const metadata: Metadata = {
  title: "AMTRAV UNIQUE Studio | Bespoke 3D Luggage Configurator",
  description:
    "Design and personalize your bespoke AMTRAV suitcase. Choose shell finish, custom leather tag monogramming, accent handles, and colored Multiwheel sets in real time.",
  alternates: { canonical: "/customise" },
};

export default function CustomisePage() {
  return <ConfiguratorClient />;
}