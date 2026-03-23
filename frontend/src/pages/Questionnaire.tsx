import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import { client } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  User,
  MapPin,
  Trees,
  Building2,
  Hammer,
  LayoutGrid,
  Wrench,
  Target,
  Sparkles,
  Loader2,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Identité", icon: User },
  { id: 2, label: "Localisation", icon: MapPin },
  { id: 3, label: "Terrain", icon: Trees },
  { id: 4, label: "Destination", icon: Building2 },
  { id: 5, label: "Type projet", icon: Hammer },
  { id: 6, label: "Implantation", icon: LayoutGrid },
  { id: 7, label: "Infrastructures", icon: Wrench },
  { id: 8, label: "Intention", icon: Target },
  { id: 9, label: "Optimisation", icon: Sparkles },
];

interface FormData {
  project_name: string;
  applicant_name: string;
  email: string;
  commune: string;
  postal_code: string;
  cadastral_section: string;
  parcel: string;
  land_area: string;
  land_status: string;
  environment: string;
  topography: string;
  vegetation: string;
  access: string;
  destination: string;
  project_type: string;
  lodge_model: string;
  unit_count: string;
  finish_level: string;
  architect_description: string;
  layout_disposition: string;
  unit_distance: string;
  vegetation_preservation: string;
  parking: string;
  road_access: string;
  connections: string;
  project_objective: string;
  integration_level: string;
  environmental_commitment: string;
  maximize_acceptance: boolean;
}

const initialFormData: FormData = {
  project_name: "",
  applicant_name: "",
  email: "",
  commune: "",
  postal_code: "",
  cadastral_section: "",
  parcel: "",
  land_area: "",
  land_status: "",
  environment: "",
  topography: "",
  vegetation: "",
  access: "",
  destination: "",
  project_type: "",
  lodge_model: "",
  unit_count: "",
  finish_level: "",
  architect_description: "",
  layout_disposition: "",
  unit_distance: "",
  vegetation_preservation: "",
  parking: "",
  road_access: "",
  connections: "",
  project_objective: "",
  integration_level: "",
  environmental_commitment: "",
  maximize_acceptance: false,
};

export default function Questionnaire() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await client.auth.me();
        if (res?.data) {
          setUser(res.data);
        }
      } catch {
        // Not logged in
      }
    };
    checkAuth();
  }, []);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 9) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.info("Veuillez vous connecter pour continuer");
      await client.auth.toLogin();
      return;
    }

    setLoading(true);
    try {
      // Upload file if exists
      let fileKey = "";
      if (fileToUpload) {
        try {
          const uploadRes = await client.storage.upload({
            bucket_name: "architect-files",
            file: fileToUpload,
          });
          if (uploadRes?.data?.object_key) {
            fileKey = uploadRes.data.object_key;
          }
        } catch {
          // File upload optional, continue without it
        }
      }

      // Create dossier
      const dossierRes = await client.entities.dossiers.create({
        data: {
          ...formData,
          file_key: fileKey,
          payment_status: "pending",
          status: "draft",
          created_at: new Date().toISOString(),
        },
      });

      const dossierId = dossierRes?.data?.id;
      if (!dossierId) {
        toast.error("Erreur lors de la création du dossier");
        return;
      }

      // Create payment session
      const paymentRes = await client.apiCall.invoke({
        url: "/api/v1/payment/create_payment_session",
        method: "POST",
        data: {
          dossier_id: dossierId,
          success_url: `${window.location.origin}/payment-success`,
          cancel_url: `${window.location.origin}/questionnaire`,
        },
      });

      if (paymentRes?.data?.url) {
        client.utils.openUrl(paymentRes.data.url);
      } else {
        toast.error("Erreur lors de la création du paiement");
      }
    } catch (err: any) {
      const detail =
        err?.data?.detail ||
        err?.response?.data?.detail ||
        err?.message ||
        "Une erreur est survenue";
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / 9) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Nom du projet *
              </Label>
              <Input
                value={formData.project_name}
                onChange={(e) => updateField("project_name", e.target.value)}
                placeholder="Ex: Lodge Nature Ardennes"
                className="rounded-xl border-[#E5E2D9] focus:ring-[#2D5016] focus:border-[#2D5016] h-12"
              />
            </div>
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Nom du demandeur *
              </Label>
              <Input
                value={formData.applicant_name}
                onChange={(e) => updateField("applicant_name", e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="rounded-xl border-[#E5E2D9] focus:ring-[#2D5016] focus:border-[#2D5016] h-12"
              />
            </div>
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Email *
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="jean@exemple.be"
                className="rounded-xl border-[#E5E2D9] focus:ring-[#2D5016] focus:border-[#2D5016] h-12"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-[#1A1A1A] font-medium mb-2 block">
                  Commune
                </Label>
                <Input
                  value={formData.commune}
                  onChange={(e) => updateField("commune", e.target.value)}
                  placeholder="Ex: Durbuy"
                  className="rounded-xl border-[#E5E2D9] h-12"
                />
              </div>
              <div>
                <Label className="text-[#1A1A1A] font-medium mb-2 block">
                  Code postal
                </Label>
                <Input
                  value={formData.postal_code}
                  onChange={(e) => updateField("postal_code", e.target.value)}
                  placeholder="Ex: 6940"
                  className="rounded-xl border-[#E5E2D9] h-12"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-[#1A1A1A] font-medium mb-2 block">
                  Section cadastrale
                </Label>
                <Input
                  value={formData.cadastral_section}
                  onChange={(e) =>
                    updateField("cadastral_section", e.target.value)
                  }
                  placeholder="Ex: A"
                  className="rounded-xl border-[#E5E2D9] h-12"
                />
              </div>
              <div>
                <Label className="text-[#1A1A1A] font-medium mb-2 block">
                  Parcelle
                </Label>
                <Input
                  value={formData.parcel}
                  onChange={(e) => updateField("parcel", e.target.value)}
                  placeholder="Ex: 123/B"
                  className="rounded-xl border-[#E5E2D9] h-12"
                />
              </div>
            </div>
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Superficie du terrain
              </Label>
              <Input
                value={formData.land_area}
                onChange={(e) => updateField("land_area", e.target.value)}
                placeholder="Ex: 5 000 m²"
                className="rounded-xl border-[#E5E2D9] h-12"
              />
            </div>
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Statut foncier
              </Label>
              <Select
                value={formData.land_status}
                onValueChange={(v) => updateField("land_status", v)}
              >
                <SelectTrigger className="rounded-xl border-[#E5E2D9] h-12">
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proprietaire">Propriétaire</SelectItem>
                  <SelectItem value="locataire">Locataire</SelectItem>
                  <SelectItem value="promesse_vente">
                    Promesse de vente
                  </SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Environnement
              </Label>
              <Select
                value={formData.environment}
                onValueChange={(v) => updateField("environment", v)}
              >
                <SelectTrigger className="rounded-xl border-[#E5E2D9] h-12">
                  <SelectValue placeholder="Type d'environnement..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rural">Rural</SelectItem>
                  <SelectItem value="forestier">Forestier</SelectItem>
                  <SelectItem value="periurbain">Périurbain</SelectItem>
                  <SelectItem value="urbain">Urbain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Topographie
              </Label>
              <Select
                value={formData.topography}
                onValueChange={(v) => updateField("topography", v)}
              >
                <SelectTrigger className="rounded-xl border-[#E5E2D9] h-12">
                  <SelectValue placeholder="Type de topographie..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plat">Plat</SelectItem>
                  <SelectItem value="legere_pente">Légère pente</SelectItem>
                  <SelectItem value="forte_pente">Forte pente</SelectItem>
                  <SelectItem value="valonne">Vallonné</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Végétation existante
              </Label>
              <Textarea
                value={formData.vegetation}
                onChange={(e) => updateField("vegetation", e.target.value)}
                placeholder="Décrivez la végétation présente sur le terrain..."
                className="rounded-xl border-[#E5E2D9] min-h-[100px]"
              />
            </div>
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Accès au terrain
              </Label>
              <Textarea
                value={formData.access}
                onChange={(e) => updateField("access", e.target.value)}
                placeholder="Décrivez les voies d'accès au terrain..."
                className="rounded-xl border-[#E5E2D9] min-h-[100px]"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Label className="text-[#1A1A1A] font-medium mb-4 block text-lg">
              Quelle est la destination de votre projet ?
            </Label>
            <div className="grid gap-4">
              {[
                {
                  value: "exploitation_touristique",
                  label: "Exploitation touristique",
                  desc: "Lodges, gîtes, hébergements insolites",
                },
                {
                  value: "maison_habitation",
                  label: "Maison d'habitation",
                  desc: "Résidence principale ou secondaire",
                },
                {
                  value: "immeuble_multi_appartements",
                  label: "Immeuble multi-appartements",
                  desc: "Logements collectifs",
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField("destination", opt.value)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                    formData.destination === opt.value
                      ? "border-[#2D5016] bg-[#2D5016]/5"
                      : "border-[#E5E2D9] hover:border-[#C4A265]"
                  }`}
                >
                  <div className="font-semibold text-[#1A1A1A]">
                    {opt.label}
                  </div>
                  <div className="text-sm text-[#6B7280] mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Label className="text-[#1A1A1A] font-medium mb-4 block text-lg">
              Type de projet
            </Label>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                {
                  value: "catalogue",
                  label: "Catalogue Belgian Lodges",
                  desc: "Choisissez parmi nos modèles",
                },
                {
                  value: "architecte",
                  label: "Projet d'architecte",
                  desc: "Conception sur mesure",
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField("project_type", opt.value)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                    formData.project_type === opt.value
                      ? "border-[#2D5016] bg-[#2D5016]/5"
                      : "border-[#E5E2D9] hover:border-[#C4A265]"
                  }`}
                >
                  <div className="font-semibold text-[#1A1A1A]">
                    {opt.label}
                  </div>
                  <div className="text-sm text-[#6B7280] mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>

            {formData.project_type === "catalogue" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <Label className="text-[#1A1A1A] font-medium mb-2 block">
                    Modèle de lodge
                  </Label>
                  <Select
                    value={formData.lodge_model}
                    onValueChange={(v) => updateField("lodge_model", v)}
                  >
                    <SelectTrigger className="rounded-xl border-[#E5E2D9] h-12">
                      <SelectValue placeholder="Choisissez un modèle..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">
                        Compact (25-35 m²)
                      </SelectItem>
                      <SelectItem value="confort">
                        Confort (40-55 m²)
                      </SelectItem>
                      <SelectItem value="premium">
                        Premium (60-80 m²)
                      </SelectItem>
                      <SelectItem value="familial">
                        Familial (85-120 m²)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#1A1A1A] font-medium mb-2 block">
                    Nombre d'unités
                  </Label>
                  <Input
                    value={formData.unit_count}
                    onChange={(e) => updateField("unit_count", e.target.value)}
                    placeholder="Ex: 6"
                    type="number"
                    className="rounded-xl border-[#E5E2D9] h-12"
                  />
                </div>
                <div>
                  <Label className="text-[#1A1A1A] font-medium mb-2 block">
                    Niveau de finition
                  </Label>
                  <Select
                    value={formData.finish_level}
                    onValueChange={(v) => updateField("finish_level", v)}
                  >
                    <SelectTrigger className="rounded-xl border-[#E5E2D9] h-12">
                      <SelectValue placeholder="Niveau de finition..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="superieur">Supérieur</SelectItem>
                      <SelectItem value="luxe">Luxe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {formData.project_type === "architecte" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <Label className="text-[#1A1A1A] font-medium mb-2 block">
                    Description du projet
                  </Label>
                  <Textarea
                    value={formData.architect_description}
                    onChange={(e) =>
                      updateField("architect_description", e.target.value)
                    }
                    placeholder="Décrivez votre projet architectural..."
                    className="rounded-xl border-[#E5E2D9] min-h-[120px]"
                  />
                </div>
                <div>
                  <Label className="text-[#1A1A1A] font-medium mb-2 block">
                    Fichier (optionnel)
                  </Label>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setFileToUpload(e.target.files?.[0] || null)
                    }
                    className="rounded-xl border-[#E5E2D9] h-12 file:mr-4 file:rounded-lg file:border-0 file:bg-[#2D5016]/10 file:text-[#2D5016] file:font-medium"
                    accept=".pdf,.jpg,.jpeg,.png,.dwg"
                  />
                  <p className="text-xs text-[#6B7280] mt-1">
                    PDF, images ou fichiers DWG acceptés
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Disposition des constructions
              </Label>
              <Select
                value={formData.layout_disposition}
                onValueChange={(v) => updateField("layout_disposition", v)}
              >
                <SelectTrigger className="rounded-xl border-[#E5E2D9] h-12">
                  <SelectValue placeholder="Type de disposition..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4_facades">
                    Construction 4 façades
                  </SelectItem>
                  <SelectItem value="semi_mitoyenne">
                    Semi-mitoyenne
                  </SelectItem>
                  <SelectItem value="mitoyenne">
                    Mitoyenne
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Distance entre les unités
              </Label>
              <Input
                value={formData.unit_distance}
                onChange={(e) => updateField("unit_distance", e.target.value)}
                placeholder="Ex: 15 mètres minimum"
                className="rounded-xl border-[#E5E2D9] h-12"
              />
            </div>
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Préservation de la végétation
              </Label>
              <Textarea
                value={formData.vegetation_preservation}
                onChange={(e) =>
                  updateField("vegetation_preservation", e.target.value)
                }
                placeholder="Décrivez les mesures de préservation prévues..."
                className="rounded-xl border-[#E5E2D9] min-h-[100px]"
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Stationnement
              </Label>
              <Textarea
                value={formData.parking}
                onChange={(e) => updateField("parking", e.target.value)}
                placeholder="Nombre de places, type de revêtement..."
                className="rounded-xl border-[#E5E2D9] min-h-[80px]"
              />
            </div>
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Voirie et accès
              </Label>
              <Textarea
                value={formData.road_access}
                onChange={(e) => updateField("road_access", e.target.value)}
                placeholder="Voies d'accès existantes, aménagements prévus..."
                className="rounded-xl border-[#E5E2D9] min-h-[80px]"
              />
            </div>
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Raccordements aux réseaux
              </Label>
              <Textarea
                value={formData.connections}
                onChange={(e) => updateField("connections", e.target.value)}
                placeholder="Eau, électricité, assainissement..."
                className="rounded-xl border-[#E5E2D9] min-h-[80px]"
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Objectif du projet
              </Label>
              <Textarea
                value={formData.project_objective}
                onChange={(e) =>
                  updateField("project_objective", e.target.value)
                }
                placeholder="Quel est l'objectif principal de votre projet ?"
                className="rounded-xl border-[#E5E2D9] min-h-[100px]"
              />
            </div>
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Niveau d'intégration paysagère
              </Label>
              <Select
                value={formData.integration_level}
                onValueChange={(v) => updateField("integration_level", v)}
              >
                <SelectTrigger className="rounded-xl border-[#E5E2D9] h-12">
                  <SelectValue placeholder="Niveau d'intégration..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maximal">
                    Maximal — Invisibilité recherchée
                  </SelectItem>
                  <SelectItem value="eleve">
                    Élevé — Harmonie avec le paysage
                  </SelectItem>
                  <SelectItem value="modere">
                    Modéré — Présence discrète
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#1A1A1A] font-medium mb-2 block">
                Engagement environnemental
              </Label>
              <Textarea
                value={formData.environmental_commitment}
                onChange={(e) =>
                  updateField("environmental_commitment", e.target.value)
                }
                placeholder="Matériaux écologiques, énergie renouvelable, gestion des eaux..."
                className="rounded-xl border-[#E5E2D9] min-h-[100px]"
              />
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-8">
            <div className="bg-[#F0FDF4] rounded-2xl p-6 border border-[#BBF7D0]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                    Maximiser les chances d'acceptation
                  </h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    Active l'optimisation avancée du prompt pour mettre en avant
                    la conformité CoDT, l'intégration paysagère et les mesures
                    compensatoires.
                  </p>
                </div>
                <Switch
                  checked={formData.maximize_acceptance}
                  onCheckedChange={(v) =>
                    updateField("maximize_acceptance", v)
                  }
                  className="data-[state=checked]:bg-[#2D5016]"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E5E2D9]">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                Récapitulatif
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-[#E5E2D9]">
                  <span className="text-[#6B7280]">Projet</span>
                  <span className="font-medium text-[#1A1A1A]">
                    {formData.project_name || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5E2D9]">
                  <span className="text-[#6B7280]">Localisation</span>
                  <span className="font-medium text-[#1A1A1A]">
                    {formData.commune
                      ? `${formData.commune} (${formData.postal_code})`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5E2D9]">
                  <span className="text-[#6B7280]">Destination</span>
                  <span className="font-medium text-[#1A1A1A]">
                    {formData.destination
                      ?.replace(/_/g, " ")
                      .replace(/^\w/, (c) => c.toUpperCase()) || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5E2D9]">
                  <span className="text-[#6B7280]">Type</span>
                  <span className="font-medium text-[#1A1A1A]">
                    {formData.project_type === "catalogue"
                      ? "Catalogue Belgian Lodges"
                      : formData.project_type === "architecte"
                        ? "Projet d'architecte"
                        : "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#6B7280]">Montant</span>
                  <span className="font-bold text-[#2D5016] text-lg">125 €</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const StepIcon = STEPS[currentStep - 1]?.icon;

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Header />

      <div className="pt-24 pb-12 max-w-2xl mx-auto px-4 sm:px-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">
              Étape {currentStep} sur 9
            </span>
            <span className="text-sm font-medium text-[#2D5016]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-[#E5E2D9] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2D5016] to-[#4A7C2E] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Header */}
        <div className="flex items-center gap-3 mb-8">
          {StepIcon && (
            <div className="w-12 h-12 rounded-xl bg-[#2D5016]/10 flex items-center justify-center">
              <StepIcon className="h-6 w-6 text-[#2D5016]" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">
              {STEPS[currentStep - 1]?.label}
            </h2>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 sm:p-8 shadow-sm mb-8 animate-in fade-in slide-in-from-right-4 duration-300">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="rounded-xl border-[#E5E2D9] text-[#6B7280] hover:bg-[#F5F5F0] px-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>

          {currentStep < 9 ? (
            <Button
              onClick={nextStep}
              className="bg-[#2D5016] hover:bg-[#4A7C2E] text-white rounded-xl px-6"
            >
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#2D5016] hover:bg-[#4A7C2E] text-white rounded-xl px-8 py-3 text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  Payer 125€ et générer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}