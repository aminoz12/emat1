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
      answer: "Absolument ! Nous utilisons les dernières technologies de cryptage SSL et acceptons tous les moyens de paiement sécurisés.",
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
      description: 'Complétez votre demande en ligne rapidement grâce à un formulaire simple et intuitif.',
      icon: '/time.png',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      number: 2,
      title: 'Paiement sécurisé',
      description: 'Réglez votre commande en toute sécurité sur notre plateforme.',
      icon: '/payment.png',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      number: 3,
      title: 'Livraison en 24/48h',
      description: 'Votre carte grise est produite puis envoyée en recommandé par l\'Imprimerie Nationale dans des délais très courts.',
      icon: '/truck.png',
      color: 'from-violet-500 to-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
    },
    {
      number: 4,
      title: 'Service habilité par l\'État',
      description: 'Nous disposons de l\'habilitation officielle du Ministère de l\'Intérieur pour traiter vos démarches en toute conformité.',
      icon: '/ministre.png',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
  ]

  return null
}

export default HowItWorks