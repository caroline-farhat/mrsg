import Footer from "@/components/layout/Footer";
import { navHtml } from "@/components/layout/nav-markup";
import SiteBehavior from "@/components/layout/SiteBehavior";
import BrandStorySection from "@/components/sections/BrandStorySection";
import Hero3D from "@/components/sections/Hero3D";
import LocationsSection from "@/components/sections/LocationsSection";
import NetworkSection from "@/components/sections/NetworkSection";
import PartnershipsSection from "@/components/sections/PartnershipsSection";
import ReferencesSection from "@/components/sections/ReferencesSection";
import ServiceSection from "@/components/sections/ServiceSection";

export default function Page() {
  return (
    <>
      {/* header: in normal flow and sticky; display:contents lets it stick across the whole page */}
      <div className="nav-host" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: navHtml }} />
      <main id="top">
        {/* 1: full-bleed interactive 3D machine */}
        <Hero3D />
        {/* Brand story */}
        <BrandStorySection />
        {/* The Service (React: interactive tabs + next/image visuals) */}
        <ServiceSection />
        {/* Locations (React: cinematic scenes + interactive cards) */}
        <LocationsSection />
        {/* Connected Network (React: deterministic UTC simulation, interactive analytics) */}
        <NetworkSection />
        {/* References: three local MP4 videos in an accessible modal (immediately before Partnerships) */}
        <ReferencesSection />
        {/* International Partnerships (React) */}
        <PartnershipsSection />
      </main>
      <Footer />
      <SiteBehavior />
    </>
  );
}
