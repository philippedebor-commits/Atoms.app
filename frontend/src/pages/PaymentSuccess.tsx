import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import {
  CheckCircle2,
  FolderOpen,
  Home,
  FileText,
} from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Header />

      <div className="pt-24 pb-12 max-w-2xl mx-auto px-4 sm:px-6">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F0FDF4] mb-6">
            <CheckCircle2 className="h-10 w-10 text-[#2D5016]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3">
            Paiement confirmé !
          </h1>
          <p className="text-lg text-[#6B7280]">
            Merci pour votre confiance
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-sm p-8 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-7 w-7 text-[#2D5016]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              Votre dossier sera préparé
            </h2>
            <p className="text-[#6B7280] leading-relaxed mb-6">
              Notre équipe prépare votre dossier d'avis préalable
              urbanistique complet. Vous le recevrez par email dans les
              plus brefs délais.
            </p>
            <div className="bg-[#FAFAF5] rounded-xl p-4 text-sm text-[#6B7280]">
              <p className="font-medium text-[#1A1A1A] mb-2">
                Prochaines étapes :
              </p>
              <ul className="space-y-2 text-left max-w-sm mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-[#2D5016] font-bold">1.</span>
                  Nous analysons vos réponses au questionnaire
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2D5016] font-bold">2.</span>
                  Nous générons votre dossier complet
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2D5016] font-bold">3.</span>
                  Nous vous envoyons le dossier finalisé par email
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/mes-dossiers")}
            className="bg-[#2D5016] hover:bg-[#4A7C2E] text-white rounded-xl px-8"
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            Mes dossiers
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="rounded-xl border-[#E5E2D9] text-[#6B7280] hover:bg-[#F5F5F0] px-8"
          >
            <Home className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-[#9CA3AF] mt-8">
          Ce service constitue une pré-analyse et ne garantit pas la conformité
          urbanistique de votre projet.
        </p>
      </div>
    </div>
  );
}