import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { client } from "@/lib/api";
import { getAPIBaseURL } from "@/lib/config";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  FolderOpen,
  Home,
  Phone,
} from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    const processPayment = async () => {
      const sessionId = searchParams.get("session_id");
      if (!sessionId) {
        toast.error("Session de paiement invalide");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "App-Host": window.location.host,
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // Verify payment
        const verifyResponse = await fetch(
          `${getAPIBaseURL()}/api/v1/payment/verify_payment`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ session_id: sessionId }),
          }
        );

        if (!verifyResponse.ok) {
          const errData = await verifyResponse.json().catch(() => ({}));
          throw new Error(
            errData?.detail || `Erreur serveur (${verifyResponse.status})`
          );
        }

        const verifyData = await verifyResponse.json();

        if (verifyData?.status !== "paid") {
          toast.error("Le paiement n'a pas été confirmé");
          setLoading(false);
          return;
        }

        const dId = verifyData.dossier_id;

        // Generate prompt (this also auto-sends email to admin)
        const promptResponse = await fetch(
          `${getAPIBaseURL()}/api/v1/prompt/generate`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ dossier_id: dId }),
          }
        );

        if (!promptResponse.ok) {
          const errData = await promptResponse.json().catch(() => ({}));
          throw new Error(
            errData?.detail || `Erreur serveur (${promptResponse.status})`
          );
        }

        const promptData = await promptResponse.json();

        if (promptData?.prompt) {
          setSuccess(true);

          // Fetch dossier to get project name
          try {
            const dossierResponse = await fetch(
              `${getAPIBaseURL()}/api/v1/entities/dossiers/${dId}`,
              { method: "GET", headers }
            );
            if (dossierResponse.ok) {
              const dossierData = await dossierResponse.json();
              if (dossierData?.project_name) {
                setProjectName(dossierData.project_name);
              }
            }
          } catch {
            // Non-critical, continue
          }

          toast.success("Votre demande a été enregistrée avec succès !");
        }
      } catch (err: any) {
        const detail =
          err?.data?.detail ||
          err?.response?.data?.detail ||
          err?.message ||
          "Erreur";
        toast.error(detail);
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF5]">
        <Header />
        <div className="pt-32 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-[#2D5016] animate-spin" />
          <p className="text-lg text-[#6B7280]">
            Vérification du paiement et traitement de votre demande...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Header />

      <div className="pt-24 pb-12 max-w-2xl mx-auto px-4 sm:px-6">
        {success ? (
          <>
            {/* Success Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F0FDF4] mb-6">
                <CheckCircle2 className="h-10 w-10 text-[#2D5016]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3">
                Merci pour votre confiance !
              </h1>
              <p className="text-lg text-[#6B7280]">
                Votre paiement a été confirmé avec succès
              </p>
            </div>

            {/* Confirmation Card */}
            <div className="bg-white rounded-2xl border border-[#E5E2D9] shadow-sm p-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-7 w-7 text-[#2D5016]" />
                </div>
                <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
                  Votre dossier est en cours de traitement
                </h2>
                {projectName && (
                  <p className="text-[#2D5016] font-medium mb-4">
                    Projet : {projectName}
                  </p>
                )}
                <p className="text-[#6B7280] leading-relaxed mb-4">
                  Notre équipe a bien reçu votre demande et vos informations.
                  Nous allons préparer votre dossier d'avis préalable
                  urbanistique et vous recontacterons dans les plus brefs délais.
                </p>
                <div className="bg-[#FAFAF5] rounded-xl p-4 text-sm text-[#6B7280]">
                  <p className="font-medium text-[#1A1A1A] mb-1">
                    Que se passe-t-il ensuite ?
                  </p>
                  <ul className="space-y-2 text-left max-w-sm mx-auto">
                    <li className="flex items-start gap-2">
                      <span className="text-[#2D5016] font-bold">1.</span>
                      Nous analysons vos réponses au questionnaire
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2D5016] font-bold">2.</span>
                      Nous générons votre dossier complet via Gamma
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
          </>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">
              Une erreur est survenue
            </h1>
            <p className="text-[#6B7280] mb-6">
              Le paiement n'a pas pu être vérifié. Veuillez réessayer ou nous
              contacter.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-[#2D5016] hover:bg-[#4A7C2E] text-white rounded-xl px-8"
            >
              Retour à l'accueil
            </Button>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-center text-xs text-[#9CA3AF] mt-8">
          Ce service constitue une pré-analyse et ne garantit pas la conformité
          urbanistique de votre projet.
        </p>
      </div>
    </div>
  );
}