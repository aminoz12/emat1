'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Star, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'

const HowItWorks = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const questions = [
    {
      question: "Comment obtenir ma carte grise rapidement ?",
      answer: "Notre plateforme vous permet d'obtenir votre carte grise en 24-48h. Il suffit de remplir notre formulaire en ligne, effectuer le paiement sécurisé, et nous nous occupons de toutes les démarches administratives pour vous.",
      icon: "⚡",
      image: "/faq1.png"
    },
    {
      question: "Quels documents sont nécessaires ?",
      answer: "Vous n'avez besoin que de votre permis de conduire, de la carte grise actuelle (si changement de propriétaire), et de votre justificatif de domicile. Nous nous occupons du reste !",
      icon: "📄",
      image: "/faq2.png"
    },
    {
      question: "Le paiement est-il sécurisé ?",
      answer: "Absolument ! Nous utilisons les dernières technologies de cryptage SSL et acceptons tous les moyens de paiement sécurisés. Vous pouvez également payer en 3 fois sans frais.",
      icon: "🔒",
      image: "/faq3.png"
    },
    {
      question: "Que se passe-t-il après la commande ?",
      answer: "Une fois votre commande validée, nos experts traitent votre dossier en 24h maximum. Vous recevez votre nouvelle carte grise par courrier recommandé directement chez vous.",
      icon: "🚚",
      image: "/faq4.png"
    }
  ]

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentQuestionIndex((prev) => (prev + 1) % questions.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isAutoPlaying, questions.length])

  const steps = [
    {
      number: 1,
      title: 'Commandez en 2 minutes',
      description: 'Remplissez le formulaire en quelques clics et commandez votre carte grise en 2 minutes seulement',
      icon: '/time.png',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      number: 2,
      title: 'Paiement en 3X CB',
      description: 'Payez en ligne de manière sécurisée avec possibilité de paiement en 3 fois sans frais',
      icon: '/payment.png',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      number: 3,
      title: 'Livraison en 24/48h',
      description: 'Votre carte grise vous est livrée rapidement par l\'Imprimerie Nationale en recommandé',
      icon: '/truck.png',
      color: 'from-violet-500 to-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
    },
    {
      number: 4,
      title: 'Habilitation du Ministère',
      description: 'Service officiel habilité par le Ministère de l\'Intérieur pour une sécurité garantie',
      icon: '/ministre.png',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
  ]

  return null
}

export default HowItWorks