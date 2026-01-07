'use client'

import { useState } from 'react'
import { Star, Globe } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const COCProducts = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  // 27 car brands COC products
  const allProducts = [
    {
      id: 1,
      brand: 'Volkswagen',
      brandName: 'VW Volkswagen',
      title: 'Document COC pour VW Volkswagen',
      price: '264,00',
      rating: 5,
      reviews: 481,
      outOfStock: false,
      logoImage: '/vw.png',
      logoColor: 'bg-blue-500'
    },
    {
      id: 2,
      brand: 'Peugeot',
      brandName: 'Peugeot',
      title: 'Document COC pour Peugeot',
      price: '336,00',
      rating: 4.5,
      reviews: 190,
      outOfStock: false,
      logoImage: '/peugeot.png',
      logoColor: 'bg-gray-800'
    },
    {
      id: 3,
      brand: 'Audi',
      brandName: 'Audi',
      title: 'Document COC pour Audi',
      price: '264,00',
      rating: 4.5,
      reviews: 276,
      outOfStock: false,
      logoImage: '/audi.png',
      logoColor: 'bg-red-500'
    },
    {
      id: 4,
      brand: 'Citroën',
      brandName: 'Citroën',
      title: 'Papiers COC pour Citroën',
      price: '360,00',
      rating: 4,
      reviews: 113,
      outOfStock: false,
      logoImage: '/citroen.png',
      logoColor: 'bg-blue-600'
    },
    {
      id: 5,
      brand: 'Opel',
      brandName: 'OPEL',
      title: 'Document COC pour OPEL',
      price: '311,00',
      rating: 4.5,
      reviews: 84,
      outOfStock: false,
      logoImage: '/opel.png',
      logoColor: 'bg-yellow-500'
    },
    {
      id: 6,
      brand: 'Skoda',
      brandName: 'Skoda',
      title: 'Document COC pour Skoda',
      price: '240,00',
      rating: 4,
      reviews: 54,
      outOfStock: false,
      logoImage: '/skoda.png',
      logoColor: 'bg-green-600'
    },
    {
      id: 7,
      brand: 'Mercedes-Benz',
      brandName: 'Mercedes-Benz',
      title: 'Papiers COC pour Mercedes-Benz',
      price: '360,00',
      rating: 3.5,
      reviews: 13,
      outOfStock: false,
      logoImage: '/mercedes.png',
      logoColor: 'bg-gray-700'
    },
    {
      id: 8,
      brand: 'SEAT',
      brandName: 'SEAT',
      title: 'Papiers COC pour SEAT',
      price: '264,00',
      rating: 3.5,
      reviews: 9,
      outOfStock: false,
      logoImage: '/seat.png',
      logoColor: 'bg-orange-500'
    },
    {
      id: 9,
      brand: 'Renault',
      brandName: 'Renault',
      title: 'Document COC pour Renault',
      price: '411,00',
      rating: 4.8,
      reviews: 342,
      outOfStock: false,
      logoImage: '/renault.png',
      logoColor: 'bg-yellow-400'
    },
    {
      id: 10,
      brand: 'BMW',
      brandName: 'BMW',
      title: 'Document COC pour BMW',
      price: '238,00',
      rating: 4.7,
      reviews: 267,
      outOfStock: false,
      logoImage: '/bmw.png',
      logoColor: 'bg-blue-600'
    },
    {
      id: 11,
      brand: 'Ford',
      brandName: 'Ford',
      title: 'Papiers COC pour Ford',
      price: '360,00',
      rating: 4.3,
      reviews: 156,
      outOfStock: false,
      logoImage: '/ford.png',
      logoColor: 'bg-blue-700'
    },
    {
      id: 12,
      brand: 'Toyota',
      brandName: 'Toyota',
      title: 'Document COC pour Toyota',
      price: '264,00',
      rating: 4.6,
      reviews: 198,
      outOfStock: false,
      logoImage: '/toyota.png',
      logoColor: 'bg-red-600'
    },
    {
      id: 13,
      brand: 'Fiat',
      brandName: 'Fiat',
      title: 'Papiers COC pour Fiat',
      price: '480,00',
      rating: 4.2,
      reviews: 87,
      outOfStock: false,
      logoImage: '/fiat.png',
      logoColor: 'bg-red-500'
    },
    {
      id: 14,
      brand: 'Nissan',
      brandName: 'Nissan',
      title: 'Document COC pour Nissan',
      price: '418,00',
      rating: 4.4,
      reviews: 124,
      outOfStock: false,
      logoImage: '/nissan.png',
      logoColor: 'bg-red-700'
    },
    {
      id: 15,
      brand: 'Hyundai',
      brandName: 'Hyundai',
      title: 'Document COC pour Hyundai',
      price: '300,00',
      rating: 4.1,
      reviews: 76,
      outOfStock: false,
      logoImage: '/hyundai.png',
      logoColor: 'bg-blue-800'
    },
    {
      id: 16,
      brand: 'Kia',
      brandName: 'Kia',
      title: 'Papiers COC pour Kia',
      price: '364,00',
      rating: 4.3,
      reviews: 92,
      outOfStock: false,
      logoImage: '/kia.png',
      logoColor: 'bg-red-600'
    },
    {
      id: 17,
      brand: 'Mazda',
      brandName: 'Mazda',
      title: 'Document COC pour Mazda',
      price: '300,00',
      rating: 4.5,
      reviews: 68,
      outOfStock: false,
      logoImage: '/mazda.png',
      logoColor: 'bg-blue-500'
    },
    {
      id: 18,
      brand: 'Volvo',
      brandName: 'Volvo',
      title: 'Papiers COC pour Volvo',
      price: '720,00',
      rating: 4.7,
      reviews: 145,
      outOfStock: false,
      logoImage: '/volvo.png',
      logoColor: 'bg-blue-700'
    },
    {
      id: 19,
      brand: 'Mini',
      brandName: 'Mini',
      title: 'Document COC pour Mini',
      price: '240,00',
      rating: 4.6,
      reviews: 112,
      outOfStock: false,
      logoImage: '/mini.png',
      logoColor: 'bg-gray-800'
    },
    {
      id: 20,
      brand: 'Jaguar',
      brandName: 'Jaguar',
      title: 'Papiers COC pour Jaguar',
      price: '324,00',
      rating: 4.8,
      reviews: 43,
      outOfStock: false,
      logoImage: '/jaguar.png',
      logoColor: 'bg-gray-900'
    },
    {
      id: 21,
      brand: 'Land Rover',
      brandName: 'Land Rover',
      title: 'Document COC pour Land Rover',
      price: '324,00',
      rating: 4.7,
      reviews: 67,
      outOfStock: false,
      logoImage: '/landrover.png',
      logoColor: 'bg-green-700'
    },
    {
      id: 22,
      brand: 'Porsche',
      brandName: 'Porsche',
      title: 'Papiers COC pour Porsche',
      price: '600,00',
      rating: 4.9,
      reviews: 89,
      outOfStock: false,
      logoImage: '/Porsche.png',
      logoColor: 'bg-red-600'
    },
    {
      id: 23,
      brand: 'Tesla',
      brandName: 'Tesla',
      title: 'Document COC pour Tesla',
      price: '479,00',
      rating: 4.8,
      reviews: 156,
      outOfStock: false,
      logoImage: '/tesla.png',
      logoColor: 'bg-red-500'
    },
    {
      id: 24,
      brand: 'Dacia',
      brandName: 'Dacia',
      title: 'Papiers COC pour Dacia',
      price: '324,00',
      rating: 4.2,
      reviews: 234,
      outOfStock: false,
      logoImage: '/dacia.png',
      logoColor: 'bg-blue-600'
    },
    {
      id: 25,
      brand: 'Suzuki',
      brandName: 'Suzuki',
      title: 'Document COC pour Suzuki',
      price: '324,00',
      rating: 4.3,
      reviews: 78,
      outOfStock: false,
      logoImage: '/suzuki.png',
      logoColor: 'bg-blue-800'
    },
    {
      id: 26,
      brand: 'Mitsubishi',
      brandName: 'Mitsubishi',
      title: 'Papiers COC pour Mitsubishi',
      price: '330,00',
      rating: 4.1,
      reviews: 56,
      outOfStock: false,
      logoImage: '/Mitsubishi.png',
      logoColor: 'bg-red-700'
    },
    {
      id: 27,
      brand: 'Alfa Romeo',
      brandName: 'Alfa Romeo',
      title: 'Document COC pour Alfa Romeo',
      price: '480,00',
      rating: 4.4,
      reviews: 34,
      outOfStock: false,
      logoImage: '/alfa.png',
      logoColor: 'bg-red-600'
    }
  ]

  // Calculate pagination
  const totalPages = 3 // Fixed: page 1 (12), page 2 (12), page 3 (3)
  const getCurrentPageProducts = () => {
    if (currentPage === 1) {
      return allProducts.slice(0, 12)
    } else if (currentPage === 2) {
      return allProducts.slice(12, 24)
    } else {
      return allProducts.slice(24, 27)
    }
  }

  const currentProducts = getCurrentPageProducts()

  // Render star rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative w-4 h-4">
            <Star className="w-4 h-4 fill-gray-200 text-gray-200 absolute" />
            <div className="absolute overflow-hidden w-2 h-4">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 fill-gray-200 text-gray-200" />
        ))}
      </div>
    )
  }

  // Render brand logo
  const renderBrandLogo = (product: typeof allProducts[0]) => {
    const { brand, logoImage, logoColor } = product
    // Brands that should be bigger
    const biggerBrands = ['BMW', 'Ford', 'SEAT', 'Peugeot', 'Skoda']
    const isBigger = biggerBrands.includes(brand)
    const logoSize = isBigger ? 'w-48 h-48' : 'w-40 h-40'
    const imageSize = isBigger ? 192 : 160
    const containerHeight = isBigger ? 'h-56' : 'h-48'
    
    return (
      <div className={`relative w-full ${containerHeight} flex items-center justify-center mb-6`}>
        {logoImage ? (
          <div className={`relative ${logoSize} flex items-center justify-center`}>
            <Image
              src={logoImage}
              alt={`${brand} logo`}
              width={imageSize}
              height={imageSize}
              className="object-contain max-w-full max-h-full"
            />
          </div>
        ) : (
          <div className={`${logoColor} ${logoSize} rounded-lg flex items-center justify-center`}>
            <span className="text-white font-bold text-2xl">{brand.substring(0, 2).toUpperCase()}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-white py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Globe className="w-6 h-6 md:w-7 md:h-7" />
              Commander Votre COC
            </h1>
            <p className="text-base text-gray-600 max-w-3xl mx-auto">
              Certificat de Conformité pour votre véhicule
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {currentProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/commander-un-coc/${product.brand.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-white p-6 flex flex-col cursor-pointer transition-opacity hover:opacity-90"
                >
                  {/* Brand Logo */}
                  {renderBrandLogo(product)}

                  {/* Product Title */}
                  <h3 className="text-sm font-normal text-gray-900 mb-3 leading-relaxed">
                    {product.title}
                    <span className="text-xs text-gray-500"> (Certificat de Conformité)</span>
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4">
                    {renderStars(product.rating)}
                    <span className="text-xs text-gray-600">{product.reviews} avis</span>
                  </div>
                  
                  {/* Price */}
                  <div className="mt-auto">
                    <div className="text-base font-bold text-gray-900">
                      €{product.price} EUR
            </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Précédent
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default COCProducts
