import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import {
  Clock,
  FileCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
} from "lucide-react";
const BENEFIT_SPEED =
  "https://mgx-backend-cdn.metadl.com/generate/images/975661/2026-03-20/4cecd485-9b1c-43ca-9de2-ebcd63675886.png";
const BENEFIT_QUALITY =
  "https://mgx-backend-cdn.metadl.com/generate/images/975661/2026-03-20/c4c2d870-626d-4bfb-9382-e35eeaf53721.png";
const BENEFIT_SIMPLICITY =
  "https://mgx-backend-cdn.metadl.com/generate/images/975661/2026-03-20/e24e21ff-b975-492a-a9c3-5090f61f55c0.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/assets/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#FAFAF5]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 sm:pt-32 sm:pb-40 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 mb-8 border border-white/20">
            <Sparkles className="h-4 w-4 text-[#C4A265]" />
            <span className="text-sm text-white/90 font-medium">
              Pré-analyse urbanistique assistée par IA
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Obtenez un avis préalable
            <br />
            urbanistique en{" "}
            <span className="text-[#C4A265]">15 minutes</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Générez un dossier professionnel complet pour votre demande d'avis
            préalable en Région wallonne. Simple, rapide et crédible.
          </p>

          <Button
            onClick={() => navigate("/questionnaire")}
            size="lg"
            className="bg-[#2D5016] hover:bg-[#4A7C2E] text-white rounded-xl px-10 py-6 text-lg font-semibold shadow-2xl shadow-green-900/30 transition-all hover:scale-105"
          >
            Créer mon dossier
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <p className="mt-4 text-white/50 text-sm">
            125€ · Paiement sécurisé · Résultat immédiat
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-28 bg-[#FAFAF5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
              Pourquoi choisir UrbanPermit ?
            </h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              Une solution pensée pour simplifier vos démarches urbanistiques en
              Wallonie
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="h-8 w-8" />,
                title: "Rapide",
                desc: "Remplissez le questionnaire en 15 minutes et recevez votre dossier instantanément.",
                img: BENEFIT_SPEED,
              },
              {
                icon: <FileCheck className="h-8 w-8" />,
                title: "Professionnel",
                desc: "Un dossier structuré selon les exigences du CoDT wallon, prêt à soumettre.",
                img: BENEFIT_QUALITY,
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Simple",
                desc: "Aucune connaissance technique requise. Répondez aux questions, on s'occupe du reste.",
                img: BENEFIT_SIMPLICITY,
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl border border-[#E5E2D9] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-48 rounded-xl overflow-hidden mb-6">
                  <img
                    src={benefit.img}
                    alt={benefit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="text-[#2D5016] mb-3">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-[#6B7280] leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
              Comment ça fonctionne ?
            </h2>
            <p className="text-lg text-[#6B7280]">
              Trois étapes simples pour obtenir votre dossier
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Remplissez le questionnaire",
                desc: "Répondez à quelques questions sur votre projet, votre terrain et vos intentions.",
              },
              {
                step: "02",
                title: "Payez en ligne",
                desc: "Paiement sécurisé de 125€ par carte bancaire via Stripe.",
              },
              {
                step: "03",
                title: "Recevez votre dossier",
                desc: "Recevez votre dossier sous 24h.",
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2D5016]/10 mb-6">
                  <span className="text-2xl font-bold text-[#2D5016]">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">
                  {item.title}
                </h3>
                <p className="text-[#6B7280] leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8">
                    <ArrowRight className="h-6 w-6 text-[#C4A265]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 sm:py-28 bg-[#FAFAF5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-12 w-12 text-[#2D5016] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-6">
            Fiable et sécurisé
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
            {[
              "Basé sur le Code du Développement Territorial (CoDT)",
              "Paiement sécurisé via Stripe",
              "Données personnelles protégées",
              "Prompt optimisé pour Gamma.app",
              "Dossier structuré et professionnel",
              "Support par email inclus",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#2D5016] mt-0.5 flex-shrink-0" />
                <span className="text-[#4B5563]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-[#2D5016]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Prêt à lancer votre projet ?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Commencez dès maintenant et obtenez votre dossier d'avis préalable
            urbanistique en quelques minutes.
          </p>
          <Button
            onClick={() => navigate("/questionnaire")}
            size="lg"
            className="bg-white text-[#2D5016] hover:bg-[#F0FDF4] rounded-xl px-10 py-6 text-lg font-semibold transition-all hover:scale-105"
          >
            Créer mon dossier — 125€
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#1A1A1A]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/assets/logo-bl.png" alt="Belgian Lodges" className="h-6 opacity-60" />
              <span className="text-white/60 text-sm">
                © 2026 Belgian Lodges. Tous droits réservés.
              </span>
            </div>
            <p className="text-white/40 text-xs text-center sm:text-right max-w-md">
              Ce service constitue une pré-analyse et ne garantit en aucun cas
              la conformité urbanistique de votre projet.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}