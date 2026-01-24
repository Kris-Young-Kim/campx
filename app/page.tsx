import { GNB } from "@/components/gnb"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { AppPreviewSection } from "@/components/app-preview-section"
import { SocialProofSection } from "@/components/social-proof-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/components/scroll-to-top"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <GNB />
      <HeroSection />
      <FeaturesSection />
      <AppPreviewSection />
      <SocialProofSection />
      <CTASection />
      <Footer />
      <ScrollToTop />
    </main>
  )
}
