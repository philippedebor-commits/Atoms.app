import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { getAPIBaseURL } from "@/lib/config";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  Home,
  CreditCard,
  Mail,
  ExternalLink,
} from "lucide-react";

interface DossierInfo {
  id: number;
  project_name: string;
  applicant_name: string;
  commune: string;
  postal_code: string;
}

/**
 * Stripe Payment Link URL.
 * Create a Payment Link in your Stripe Dashboard (https://dashboard.stripe.com/payment-links)
 * for 125€ and paste the URL here or set it as VITE_STRIPE_PAYMENT_LINK env var.
 *
 * The link supports query params:
 *   ?client_reference_id=DOSSIER_ID  — to track which dossier was paid
 *   &prefilled_email=USER_EMAIL       — to prefill the customer email
 */
const STRIPE_PAYMENT_LINK =
  import.meta.env.VITE_STRIPE_PAYMENT_LINK ||
  "https://buy.stripe.com/test_dRm7sKa2T0r8diiaQV9oc01";

export default function Confirmation() {
  const { dossierId } = useParams<{ dossierId: string }>();
  const navigate = useNavigate();
  const [dossier, setDossier] = useState<DossierInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDossier = async () => {
      if (!dossierId || dossierId === "undefined") {
        navigate("/");
        return;
      }
      try {
        const res = await fetch(
          `${getAPIBaseURL()}/api/v1/entities/dossiers/${dossierId}`,
          {
            credentials: "include",
            headers: {
              "App-Host": window.location.host,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setDossier(data?.data || data);
        } else {
          toast.error("Impossible de charger le dossier");
        }
      } catch {
        toast.error("Impossible de charger le dossier");
      } finally {
        setLoading(false);
      }
    };
    loadDossier();
  }, [dossierId, navigate]);

  /**
   * Build the Stripe Payment Link with tracking parameters.
   * client_reference_id lets you identify the dossier in Stripe webhooks/dashboard.
   */
  const getPaymentUrl = () => {
    const url = new URL(STRIPE_PAYMENT_LINK);
    if (dossierId) {
      url.searchParams.set("client_reference_id", dossierId);
    }
    return url.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF5]">
        <Header />
        <div className="pt-32 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-[#2D5016] animate-spin" />
          <p className="text-lg text-[#6B7280]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Header />

      <div className="pt-24 pb-12 max-w-2xl mx-auto px-4 sm:px-6">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F0FDF4] mb-6">
            <Mail className="h-10 w-10 text-[#2D5016]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3">
            Vos données ont été envoyées !
          </h1>
          <p className="text-lg text-[#6B7280]">
            Notre équipe a bien reçu les informations de votre projet
          </p>
        </div>

        {/* Dossier Summary */}
        {dossier && (
          <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-sm p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-[#2D5016]" />
              <h2 className="text-lg font-semibold text-[#1A1A1A]">
                Récapitulatif
              </h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-[#E5E2D9]">
                <span className="text-[#6B7280]">Projet</span>
                <span className="font-medium text-[#1A1A1A]">
                  {dossier.project_name}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5E2D9]">
                <span className="text-[#6B7280]">Demandeur</span>
                <span className="font-medium text-[#1A1A1A]">
                  {dossier.applicant_name}
                </span>
              </div>
              {dossier.commune && (
                <div className="flex justify-between py-2 border-b border-[#E5E2D9]">
                  <span className="text-[#6B7280]">Localisation</span>
                  <span className="font-medium text-[#1A1A1A]">
                    {dossier.commune}{" "}
                    {dossier.postal_code ? `(${dossier.postal_code})` : ""}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-[#6B7280]">Dossier n°</span>
                <span className="font-medium text-[#1A1A1A]">
                  {dossierId}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment CTA — Direct Stripe Payment Link */}
        <div className="bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] p-8 mb-8 text-center">
          <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">
            Recevez votre dossier complet
          </h3>
          <p className="text-[#6B7280] mb-6 leading-relaxed">
            Pour recevoir un dossier d'avis préalable urbanistique complet et
            professionnel, procédez au paiement sécurisé de{" "}
            <span className="font-bold text-[#2D5016]">125 €</span>.
          </p>
          <a
            href={getPaymentUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#2D5016] hover:bg-[#4A7C2E] text-white rounded-xl px-10 py-4 text-lg font-semibold shadow-lg transition-all hover:scale-105"
          >
            <CreditCard className="h-5 w-5" />
            Payer 125 € et recevoir mon dossier
            <ExternalLink className="h-4 w-4 ml-1 opacity-70" />
          </a>
          <p className="text-xs text-[#9CA3AF] mt-4">
            Paiement sécurisé par Stripe · Carte bancaire · Vous serez
            redirigé vers la page de paiement Stripe
          </p>
        </div>

        {/* Info about what happens next */}
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 mb-8">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            Comment ça marche ?
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#2D5016] text-white text-sm font-bold flex items-center justify-center">
                1
              </span>
              <p className="text-sm text-[#6B7280]">
                Cliquez sur le bouton de paiement ci-dessus
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#2D5016] text-white text-sm font-bold flex items-center justify-center">
                2
              </span>
              <p className="text-sm text-[#6B7280]">
                Complétez le paiement sécurisé sur Stripe (125 €)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#2D5016] text-white text-sm font-bold flex items-center justify-center">
                3
              </span>
              <p className="text-sm text-[#6B7280]">
                Notre équipe reçoit une notification et prépare votre dossier
                complet
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#2D5016] text-white text-sm font-bold flex items-center justify-center">
                4
              </span>
              <p className="text-sm text-[#6B7280]">
                Vous recevez votre dossier d'avis préalable urbanistique par
                email
              </p>
            </div>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate("/mes-dossiers")}
            className="rounded-xl border-[#E5E2D9] text-[#6B7280] hover:bg-[#F5F5F0] px-8"
          >
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