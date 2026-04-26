import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ematricule.fr'

  // Static routes
  const staticRoutes = [
    '',
    '/carte-grise',
    '/plaque-immatriculation',
    '/commander-un-coc',
    '/nouvelle-demarche',
    '/about',
    '/contact',
    '/notre-mission',
    '/pro',
    '/cgv',
    '/privacy',
    '/mentions-legales',
    '/cookies',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // COC brand pages - 27 car brands
  const cocBrands = [
    'volkswagen',
    'peugeot',
    'audi',
    'citroen',
    'opel',
    'skoda',
    'mercedes-benz',
    'seat',
    'renault',
    'bmw',
    'ford',
    'toyota',
    'fiat',
    'nissan',
    'hyundai',
    'kia',
    'mazda',
    'volvo',
    'mini',
    'jaguar',
    'land-rover',
    'porsche',
    'tesla',
    'dacia',
    'suzuki',
    'mitsubishi',
    'alfa-romeo',
  ].map((brand) => ({
    url: `${baseUrl}/commander-un-coc/${brand}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...cocBrands]
}
