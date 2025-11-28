'use client'

import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const testimonials = [
    {
      name: 'Marie Dubois',
      location: 'Paris',
      rating: 5,
      text: 'Service exceptionnel ! J\'ai reçu ma carte grise en 24h exactement. Le processus est vraiment simple et l\'équipe très réactive.',
      service: 'Changement de titulaire',
      date: 'Il y a 2 jours'
    },
    {
      name: 'Jean Martin',
      location: 'Lyon',
      rating: 5,
      text: 'Parfait pour les plaques de collection. Qualité irréprochable et livraison rapide. Je recommande vivement !',
      service: 'Plaque collection',
      date: 'Il y a 1 semaine'
    },
    {
      name: 'Sophie Leroy',
      location: 'Marseille',
      rating: 5,
      text: 'En tant que professionnelle, j\'utilise EMatricule depuis 2 ans. Service fiable et prix compétitifs.',
      service: 'Services professionnels',
      date: 'Il y a 3 jours'
    },
    {
      name: 'Pierre Moreau',
      location: 'Toulouse',
      rating: 5,
      text: 'Duplicata de carte grise obtenu très rapidement. Interface intuitive et paiement sécurisé. Très satisfait !',
      service: 'Duplicata carte grise',
      date: 'Il y a 5 jours'
    },
    {
      name: 'Claire Bernard',
      location: 'Nice',
      rating: 5,
      text: 'Excellent service client. J\'avais des questions sur l\'immatriculation de mon véhicule importé, ils ont été très à l\'écoute.',
      service: 'Immatriculation véhicule étranger',
      date: 'Il y a 1 semaine'
    },
    {
      name: 'Antoine Petit',
      location: 'Nantes',
      rating: 5,
      text: 'Plaques de moto parfaites ! Finition soignée et respect des normes. Livraison dans les temps.',
      service: 'Plaque moto',
      date: 'Il y a 4 jours'
    }
  ]

  const stats = [
    { number: '1M+', label: 'Utilisateurs' },
    { number: '30K+', label: 'Avis clients' },
    { number: '4.5/5', label: 'Note Ekomi' },
    { number: '4.5/5', label: 'Note Google' },
    { number: '4.3/5', label: 'Note Trustpilot' },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return null
}

export default Testimonials





