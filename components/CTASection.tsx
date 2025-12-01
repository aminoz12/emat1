import Link from 'next/link'

const CTASection = () => {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white w-full max-w-full overflow-x-hidden">
      <div className="container">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Text */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-12 leading-tight px-4">
            Votre carte grise & vos plaques<br className="hidden sm:block" /> d'immatriculation en 2 minutes
          </h2>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Button 1 - Commander carte grise */}
            <Link
              href="/carte-grise"
              className="group relative bg-primary-500 hover:bg-primary-400 text-white px-10 py-4 rounded-3xl font-semibold text-base shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Commander carte grise</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            {/* Button 2 - Commander plaques */}
            <Link
              href="/commander-plaques"
              className="group relative bg-transparent border-2 border-white/90 text-white hover:bg-white hover:text-primary-800 px-10 py-4 rounded-3xl font-semibold text-base shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Commander plaques
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection





