import logging
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from services.dossiers import DossiersService
from services.prompt_generator import generate_urbanistic_prompt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/prompt", tags=["prompt"])

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "")


class GeneratePromptRequest(BaseModel):
    dossier_id: int


class GeneratePromptResponse(BaseModel):
    prompt: str
    dossier_id: int


class SendEmailRequest(BaseModel):
    dossier_id: int


class SendEmailResponse(BaseModel):
    success: bool
    message: str


async def _send_prospect_data_email(dossier) -> bool:
    """Send prospect data to admin email via Resend (BEFORE payment)."""
    import httpx

    resend_api_key = os.environ.get("RESEND_API_KEY")
    admin_email = ADMIN_EMAIL
    if not resend_api_key or not admin_email:
        logger.warning("Resend API key or admin email not configured, skipping prospect email")
        return False

    email_html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #2D5016; font-size: 24px; margin-bottom: 8px;">🌿 Belgian Lodges — Nouveau prospect</h1>
            <p style="color: #6B7280; font-size: 14px;">Un nouveau prospect a complété le questionnaire</p>
        </div>

        <div style="background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #9A3412; font-size: 18px; margin-bottom: 16px;">👤 Coordonnées du prospect</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
                <tr>
                    <td style="padding: 8px 12px; font-weight: 600; width: 180px; vertical-align: top;">Nom :</td>
                    <td style="padding: 8px 12px;">{dossier.applicant_name or 'Non renseigné'}</td>
                </tr>
                <tr style="background: #FFF;">
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Email :</td>
                    <td style="padding: 8px 12px;"><a href="mailto:{dossier.email}" style="color: #2D5016;">{dossier.email}</a></td>
                </tr>
                <tr>
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Commune :</td>
                    <td style="padding: 8px 12px;">{dossier.commune or 'Non renseigné'} {dossier.postal_code or ''}</td>
                </tr>
            </table>
        </div>

        <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #374151; font-size: 18px; margin-bottom: 16px;">📋 Détails du projet</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
                <tr>
                    <td style="padding: 8px 12px; font-weight: 600; width: 180px; vertical-align: top;">Nom du projet :</td>
                    <td style="padding: 8px 12px;">{dossier.project_name}</td>
                </tr>
                <tr style="background: #FFF;">
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Destination :</td>
                    <td style="padding: 8px 12px;">{dossier.destination or 'Non renseigné'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Type de projet :</td>
                    <td style="padding: 8px 12px;">{dossier.project_type or 'Non renseigné'}</td>
                </tr>
                <tr style="background: #FFF;">
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Section cadastrale :</td>
                    <td style="padding: 8px 12px;">{dossier.cadastral_section or 'Non renseigné'} — Parcelle : {dossier.parcel or 'Non renseigné'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Superficie :</td>
                    <td style="padding: 8px 12px;">{dossier.land_area or 'Non renseigné'}</td>
                </tr>
                <tr style="background: #FFF;">
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Statut foncier :</td>
                    <td style="padding: 8px 12px;">{dossier.land_status or 'Non renseigné'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Environnement :</td>
                    <td style="padding: 8px 12px;">{dossier.environment or 'Non renseigné'}</td>
                </tr>
                <tr style="background: #FFF;">
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Topographie :</td>
                    <td style="padding: 8px 12px;">{dossier.topography or 'Non renseigné'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Végétation :</td>
                    <td style="padding: 8px 12px;">{dossier.vegetation or 'Non renseigné'}</td>
                </tr>
                <tr style="background: #FFF;">
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Accès :</td>
                    <td style="padding: 8px 12px;">{dossier.access or 'Non renseigné'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Modèle lodge :</td>
                    <td style="padding: 8px 12px;">{dossier.lodge_model or 'Non renseigné'}</td>
                </tr>
                <tr style="background: #FFF;">
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Nombre d'unités :</td>
                    <td style="padding: 8px 12px;">{dossier.unit_count or 'Non renseigné'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Finition :</td>
                    <td style="padding: 8px 12px;">{dossier.finish_level or 'Non renseigné'}</td>
                </tr>
                <tr style="background: #FFF;">
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Disposition :</td>
                    <td style="padding: 8px 12px;">{dossier.layout_disposition or 'Non renseigné'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Objectif :</td>
                    <td style="padding: 8px 12px;">{dossier.project_objective or 'Non renseigné'}</td>
                </tr>
                <tr style="background: #FFF;">
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Intégration :</td>
                    <td style="padding: 8px 12px;">{dossier.integration_level or 'Non renseigné'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 12px; font-weight: 600; vertical-align: top;">Engagement env. :</td>
                    <td style="padding: 8px 12px;">{dossier.environmental_commitment or 'Non renseigné'}</td>
                </tr>
            </table>
        </div>

        <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
            <p style="color: #92400E; font-size: 14px; font-weight: 600; margin: 0;">
                ⏳ En attente de paiement (125 €)
            </p>
        </div>

        <div style="text-align: center; padding: 24px 0; border-top: 1px solid #E5E2D9;">
            <p style="color: #9CA3AF; font-size: 12px;">
                Dossier #{dossier.id}<br/>
                © Belgian Lodges — Tous droits réservés
            </p>
        </div>
    </div>
    """

    try:
        async with httpx.AsyncClient() as http_client:
            response = await http_client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {resend_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": "Belgian Lodges <onboarding@resend.dev>",
                    "to": [admin_email],
                    "subject": f"Nouveau prospect #{dossier.id} — {dossier.applicant_name or dossier.email} — {dossier.commune or 'Wallonie'}",
                    "html": email_html,
                },
                timeout=30,
            )

            if response.status_code in (200, 201):
                logger.info(f"Prospect email sent for dossier #{dossier.id}")
                return True
            else:
                logger.error(f"Resend API error: {response.status_code} - {response.text}")
                return False
    except Exception as e:
        logger.error(f"Prospect email sending error: {e}")
        return False


async def _send_prompt_email(dossier) -> bool:
    """Send the generated prompt + prospect info to the admin email via Resend (AFTER payment)."""
    import httpx

    resend_api_key = os.environ.get("RESEND_API_KEY")
    admin_email = ADMIN_EMAIL
    if not resend_api_key or not admin_email:
        logger.warning("Resend API key or admin email not configured, skipping prompt email")
        return False

    email_html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #2D5016; font-size: 24px; margin-bottom: 8px;">🌿 Belgian Lodges — Paiement confirmé ✅</h1>
            <p style="color: #6B7280; font-size: 14px;">Le prospect a payé — voici le prompt Gamma à utiliser</p>
        </div>

        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
            <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0;">
                ✅ Paiement de 125 € confirmé — Dossier #{dossier.id}
            </p>
        </div>

        <div style="background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #9A3412; font-size: 18px; margin-bottom: 16px;">👤 Prospect</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
                <tr>
                    <td style="padding: 8px 12px; font-weight: 600; width: 180px;">Nom :</td>
                    <td style="padding: 8px 12px;">{dossier.applicant_name or 'Non renseigné'}</td>
                </tr>
                <tr style="background: #FFF;">
                    <td style="padding: 8px 12px; font-weight: 600;">Email :</td>
                    <td style="padding: 8px 12px;"><a href="mailto:{dossier.email}" style="color: #2D5016;">{dossier.email}</a></td>
                </tr>
                <tr>
                    <td style="padding: 8px 12px; font-weight: 600;">Projet :</td>
                    <td style="padding: 8px 12px;">{dossier.project_name}</td>
                </tr>
                <tr style="background: #FFF;">
                    <td style="padding: 8px 12px; font-weight: 600;">Commune :</td>
                    <td style="padding: 8px 12px;">{dossier.commune or 'Non renseigné'} {dossier.postal_code or ''}</td>
                </tr>
            </table>
        </div>

        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h3 style="color: #2D5016; font-size: 16px; margin-bottom: 12px;">📋 Instructions pour Gamma</h3>
            <ol style="color: #4B5563; line-height: 1.8; padding-left: 20px;">
                <li>Ouvrez <a href="https://gamma.app" style="color: #2D5016; font-weight: 600;">Gamma.app</a></li>
                <li>Cliquez sur "Créer avec l'IA"</li>
                <li>Copiez le prompt ci-dessous et collez-le dans Gamma</li>
                <li>Laissez Gamma générer le dossier complet</li>
            </ol>
        </div>

        <div style="background: #FFFFFF; border: 2px solid #E5E2D9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h3 style="color: #2D5016; font-size: 16px; margin-bottom: 12px;">🎯 Prompt Gamma généré</h3>
            <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 13px; color: #374151; line-height: 1.6; background: #F9FAFB; padding: 16px; border-radius: 8px;">{dossier.generated_prompt}</pre>
        </div>

        <div style="text-align: center; padding: 24px 0; border-top: 1px solid #E5E2D9;">
            <p style="color: #9CA3AF; font-size: 12px;">
                Dossier #{dossier.id} — Paiement confirmé<br/>
                © Belgian Lodges — Tous droits réservés
            </p>
        </div>
    </div>
    """

    try:
        async with httpx.AsyncClient() as http_client:
            response = await http_client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {resend_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": "Belgian Lodges <onboarding@resend.dev>",
                    "to": [admin_email],
                    "subject": f"✅ Paiement confirmé — Dossier #{dossier.id} — {dossier.applicant_name or dossier.email}",
                    "html": email_html,
                },
                timeout=30,
            )

            if response.status_code in (200, 201):
                logger.info(f"Prompt email sent for dossier #{dossier.id}")
                return True
            else:
                logger.error(f"Resend API error: {response.status_code} - {response.text}")
                return False
    except Exception as e:
        logger.error(f"Prompt email sending error: {e}")
        return False


@router.post("/send-prospect-email", response_model=SendEmailResponse)
async def send_prospect_email(
    data: SendEmailRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send prospect data to admin via email (called after questionnaire submission, BEFORE payment)"""
    try:
        service = DossiersService(db)
        dossier = await service.get_by_id(data.dossier_id, user_id=str(current_user.id))

        if not dossier:
            raise HTTPException(status_code=404, detail="Dossier non trouvé")

        success = await _send_prospect_data_email(dossier)

        if success:
            return SendEmailResponse(
                success=True,
                message="Email envoyé avec succès à l'administrateur",
            )
        else:
            return SendEmailResponse(
                success=False,
                message="L'email n'a pas pu être envoyé. Vérifiez la configuration.",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prospect email sending error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Échec de l'envoi de l'email: {str(e)}",
        )


@router.post("/generate", response_model=GeneratePromptResponse)
async def generate_prompt(
    data: GeneratePromptRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate the optimized Gamma prompt after payment verification and send to admin only"""
    try:
        service = DossiersService(db)
        dossier = await service.get_by_id(data.dossier_id, user_id=str(current_user.id))

        if not dossier:
            raise HTTPException(status_code=404, detail="Dossier non trouvé")

        if dossier.payment_status != "paid":
            raise HTTPException(
                status_code=403,
                detail="Le paiement doit être effectué avant la génération du prompt",
            )

        # Generate the prompt from dossier data
        dossier_data = {
            "project_name": dossier.project_name,
            "applicant_name": dossier.applicant_name,
            "commune": dossier.commune,
            "postal_code": dossier.postal_code,
            "cadastral_section": dossier.cadastral_section,
            "parcel": dossier.parcel,
            "land_area": dossier.land_area,
            "land_status": dossier.land_status,
            "environment": dossier.environment,
            "topography": dossier.topography,
            "vegetation": dossier.vegetation,
            "access": dossier.access,
            "destination": dossier.destination,
            "project_type": dossier.project_type,
            "lodge_model": dossier.lodge_model,
            "unit_count": dossier.unit_count,
            "finish_level": dossier.finish_level,
            "architect_description": dossier.architect_description,
            "layout_disposition": dossier.layout_disposition,
            "unit_distance": dossier.unit_distance,
            "vegetation_preservation": dossier.vegetation_preservation,
            "parking": dossier.parking,
            "road_access": dossier.road_access,
            "connections": dossier.connections,
            "project_objective": dossier.project_objective,
            "integration_level": dossier.integration_level,
            "environmental_commitment": dossier.environmental_commitment,
            "maximize_acceptance": dossier.maximize_acceptance,
        }

        prompt = generate_urbanistic_prompt(dossier_data)

        # Save generated prompt
        await service.update(
            data.dossier_id,
            {"generated_prompt": prompt, "status": "completed"},
            user_id=str(current_user.id),
        )

        # Reload dossier to get updated data with prompt
        dossier = await service.get_by_id(data.dossier_id, user_id=str(current_user.id))

        # Send prompt email to admin only (prospect never sees this)
        await _send_prompt_email(dossier)

        return GeneratePromptResponse(prompt=prompt, dossier_id=data.dossier_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prompt generation error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Échec de la génération du prompt: {str(e)}",
        )


@router.post("/send-email", response_model=SendEmailResponse)
async def send_prompt_email_endpoint(
    data: SendEmailRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send the generated prompt + prospect info via email to admin (manual re-send)"""
    try:
        service = DossiersService(db)
        dossier = await service.get_by_id(data.dossier_id, user_id=str(current_user.id))

        if not dossier:
            raise HTTPException(status_code=404, detail="Dossier non trouvé")

        if not dossier.generated_prompt:
            raise HTTPException(
                status_code=400,
                detail="Le prompt n'a pas encore été généré",
            )

        success = await _send_prompt_email(dossier)

        if success:
            return SendEmailResponse(
                success=True,
                message="Email envoyé avec succès à l'administrateur",
            )
        else:
            return SendEmailResponse(
                success=False,
                message="L'email n'a pas pu être envoyé. Vérifiez la configuration.",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email sending error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Échec de l'envoi de l'email: {str(e)}",
        )