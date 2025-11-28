import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions générales de vente (CGV) - EMatricule',
  description: 'Conditions générales de vente de e-matricule, opéré par Espace Auto 92.',
}

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              CONDITIONS GÉNÉRALES DE VENTE (CGV)
            </h1>
            <p className="text-xl text-gray-600">
              e-matricule – Opéré par Espace Auto 92
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
            
            {/* Article 1 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ARTICLE 1 — OBJET
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Les présentes CGV définissent les droits et obligations entre e-matricule (Espace Auto 92) et le Client.
              </p>
              <p className="text-gray-700 leading-relaxed font-semibold mb-2">
                Les services proposés :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>démarches carte grise en ligne,</li>
                <li>fabrication et vente de plaques homologuées.</li>
              </ul>
            </div>

            {/* Article 2 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ARTICLE 2 — PRESTATIONS
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Changement de titulaire</li>
                <li>Duplicata</li>
                <li>Déclaration de cession / achat</li>
                <li>Changement d'adresse</li>
                <li>Véhicules importés</li>
                <li>Succession</li>
                <li>Formalités spéciales</li>
                <li>Plaques auto / moto</li>
              </ul>
            </div>

            {/* Article 3 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ARTICLE 3 — COMMANDE
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-3 ml-4">
                <li>La commande devient définitive dès paiement.</li>
                <li>Le Client s'engage à fournir des documents exacts et lisibles.</li>
                <li>La signature du mandat autorise le traitement du dossier.</li>
              </ul>
            </div>

            {/* Article 4 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ARTICLE 4 — TARIFS
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Prix TTC.</li>
                <li>Taxes Y1–Y2 fixées par l'État.</li>
                <li>Frais de service = traitement administratif + transmissions SIV/ANTS.</li>
              </ul>
            </div>

            {/* Article 5 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ARTICLE 5 — PAIEMENT
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-3 ml-4">
                <li>Paiement sécurisé.</li>
                <li>Le traitement commence immédiatement.</li>
                <li>Aucun remboursement après envoi des documents et signature du mandat, même si l'administration refuse le dossier.</li>
              </ul>
            </div>

            {/* Article 6 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ARTICLE 6 — DÉLAIS
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Les délais dépendent :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-3">
                <li>de la complétude du dossier,</li>
                <li>de la qualité des documents,</li>
                <li>des délais ANTS/SIV.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Aucune responsabilité en cas de retards administratifs.
              </p>
            </div>

            {/* Article 7 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ARTICLE 7 — RÉTRACTATION
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Conformément à l'art. L221-28 :
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                <p className="text-gray-700 font-semibold">
                  ➡️ aucun droit de rétractation après : paiement, signature du mandat, envoi des documents.
                </p>
              </div>
            </div>

            {/* Article 8 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ARTICLE 8 — DOSSIER IMPOSSIBLE / BLOQUÉ
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Cas : gage, opposition, VEI/VGE, incohérence, document faux/illisible, succession non réglée, anomalie ANTS…
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-3 ml-4">
                <li>e-matricule n'est pas responsable des refus SIV/ANTS.</li>
                <li>Aucun remboursement si le dossier est bloqué, impossible, irrégulier.</li>
                <li>Si les documents sont faux, incomplets ou incohérents, le dossier est suspendu / refusé.</li>
              </ul>
            </div>

            {/* Footer Note */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Dernière mise à jour : {new Date().getFullYear()}
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

