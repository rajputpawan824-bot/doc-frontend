import Image from "next/image";
import { CustomNavigation } from "./components/ui/navigation";
import HeroSection from "./components/ui/heroSection";
import AboutSection from "./components/ui/about";
import FeaturesSection from "./components/ui/feature";
import VisionMissionSection from "./components/ui/visionMission";
import Footer from "./components/ui/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full font-sans bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950">
      <CustomNavigation />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <VisionMissionSection />
      <Footer />
    </div>
  );
}
