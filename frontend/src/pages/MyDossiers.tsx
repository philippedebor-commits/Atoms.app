import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { client } from "@/lib/api";
import { toast } from "sonner";
import {
  FolderOpen,
  FileText,
  Loader2,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Dossier {
  id: number;
  project_name: string;
  commune: string;
  postal_code: string;
  destination: string;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function MyDossiers() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const res = await client.auth.me();
        if (res?.data) {
          setUser(res.data);
          await loadDossiers();
        }
      } catch {
        // Not logged in
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadDossiers = async () => {
    try {
      const res = await client.entities.dossiers.query({
        query: {},
        sort: "-created_at",
        limit: 50,
      });
      if (res?.data?.items) {
        setDossiers(res.data.items);
      }
    } catch {
      toast.error("Erreur lors du chargement des dossiers");
    }
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === "paid" && status === "completed") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0FDF4] text-[#2D5016] text-xs font-medium">
          <CheckCircle2 className="h-3 w-3" />
          Traité
        </span>
      );
    }
    if (paymentStatus === "paid") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
          <Clock className="h-3 w-3" />
          En cours de traitement
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
        <AlertCircle className="h-3 w-3" />
        En attente de paiement
      </span>
    );
  };

  const getStatusMessage = (status: string, paymentStatus: string) => {
    if (paymentStatus === "paid" && status === "completed") {
      return "Votre dossier a été traité. Vous recevrez le résultat par email.";
    }
    if (paymentStatus === "paid") {
      return "Votre paiement est confirmé. Votre dossier est en cours de traitement.";
    }
    return "Le paiement n'a pas encore été effectué pour ce dossier.";
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

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAF5]">
        <Header />
        <div className="pt-32 flex flex-col items-center justify-center gap-4 px-4">
          <FolderOpen className="h-16 w-16 text-[#C4A265]" />
          <h2 className="text-2xl font-bold text-[#1A1A1A]">
            Connectez-vous pour voir vos dossiers
          </h2>
          <Button
            onClick={() => client.auth.toLogin()}
            className="bg-[#2D5016] hover:bg-[#4A7C2E] text-white rounded-xl px-8 mt-4"
          >
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Header />

      <div className="pt-24 pb-12 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Mes dossiers</h1>
            <p className="text-[#6B7280] mt-1">
              {dossiers.length} dossier{dossiers.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            onClick={() => navigate("/questionnaire")}
            className="bg-[#2D5016] hover:bg-[#4A7C2E] text-white rounded-xl"
          >
            Nouveau dossier
          </Button>
        </div>

        {dossiers.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 text-[#E5E2D9] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
              Aucun dossier
            </h3>
            <p className="text-[#6B7280] mb-6">
              Créez votre premier dossier d'avis préalable urbanistique
            </p>
            <Button
              onClick={() => navigate("/questionnaire")}
              className="bg-[#2D5016] hover:bg-[#4A7C2E] text-white rounded-xl px-8"
            >
              Créer mon dossier
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {dossiers.map((dossier) => (
              <div
                key={dossier.id}
                className="bg-white rounded-2xl border border-[#E5E2D9] shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#1A1A1A] truncate">
                          {dossier.project_name}
                        </h3>
                        {getStatusBadge(
                          dossier.status,
                          dossier.payment_status
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
                        {dossier.commune && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {dossier.commune}{" "}
                            {dossier.postal_code
                              ? `(${dossier.postal_code})`
                              : ""}
                          </span>
                        )}
                        {dossier.created_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(dossier.created_at).toLocaleDateString(
                              "fr-BE"
                            )}
                          </span>
                        )}
                        {dossier.destination && (
                          <span className="capitalize">
                            {dossier.destination.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#9CA3AF] mt-3">
                        {getStatusMessage(dossier.status, dossier.payment_status)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}