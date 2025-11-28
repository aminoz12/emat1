import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'
import ProcessSection from '@/components/ProcessSection'
import CTASection from '@/components/CTASection'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <ProcessSection />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </div>
  )
}


