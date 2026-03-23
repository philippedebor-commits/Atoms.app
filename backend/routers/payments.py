import logging
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import stripe

from core.database import get_db
from core.config import settings
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from services.dossiers import DossiersService

router = APIRouter(prefix="/api/v1/payment", tags=["payment"])


def _ensure_stripe_key():
    """Ensure Stripe API key is set before each call.
    
    Raises:
        HTTPException: If no Stripe API key is available.
    """
    # Always re-read from environment in case it was injected after startup
    key = os.environ.get("STRIPE_SECRET_KEY", "")
    if not key:
        try:
            key = settings.stripe_secret_key
        except AttributeError:
            key = ""
    if key:
        stripe.api_key = key
    if not stripe.api_key:
        raise HTTPException(
            status_code=503,
            detail="La clé Stripe n'est pas configurée. Veuillez connecter votre compte Stripe via les paramètres de la plateforme.",
        )

logger = logging.getLogger(__name__)


class CheckoutSessionRequest(BaseModel):
    dossier_id: int
    success_url: str
    cancel_url: str


class CheckoutSessionResponse(BaseModel):
    session_id: str
    url: str


class PaymentVerificationRequest(BaseModel):
    session_id: str


class PaymentStatusResponse(BaseModel):
    status: str
    dossier_id: int = None
    payment_status: str


@router.post("/create_payment_session", response_model=CheckoutSessionResponse)
async def create_payment_session(
    data: CheckoutSessionRequest,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe checkout session for dossier payment (125€)"""
    try:
        _ensure_stripe_key()
        frontend_host = request.headers.get("App-Host")
        if frontend_host and not frontend_host.startswith(("http://", "https://")):
            frontend_host = f"https://{frontend_host}"

        # Verify dossier belongs to user
        service = DossiersService(db)
        dossier = await service.get_by_id(data.dossier_id, user_id=str(current_user.id))
        if not dossier:
            raise HTTPException(status_code=404, detail="Dossier non trouvé")

        # Create Stripe checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "eur",
                        "product_data": {
                            "name": "Dossier d'avis préalable urbanistique",
                            "description": f"Génération du prompt optimisé pour le projet : {dossier.project_name}",
                        },
                        "unit_amount": 12500,  # 125€ in cents
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=f"{frontend_host}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_host}/questionnaire",
            metadata={
                "dossier_id": str(data.dossier_id),
                "user_id": str(current_user.id),
            },
        )

        # Update dossier with stripe session id
        await service.update(
            data.dossier_id,
            {
                "stripe_session_id": session.id,
                "payment_status": "pending",
            },
            user_id=str(current_user.id),
        )

        return CheckoutSessionResponse(session_id=session.id, url=session.url)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment session creation error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Échec de la création de la session de paiement: {str(e)}",
        )


@router.post("/verify_payment", response_model=PaymentStatusResponse)
async def verify_payment(
    data: PaymentVerificationRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify payment status and update dossier"""
    try:
        _ensure_stripe_key()
        session = stripe.checkout.Session.retrieve(data.session_id)
        dossier_id = session.metadata.get("dossier_id")

        status_mapping = {
            "complete": "paid",
            "open": "pending",
            "expired": "cancelled",
        }
        status = status_mapping.get(session.status, "pending")

        # Update dossier payment status
        if dossier_id:
            service = DossiersService(db)
            await service.update(
                int(dossier_id),
                {"payment_status": status},
                user_id=str(current_user.id),
            )

        return PaymentStatusResponse(
            status=status,
            dossier_id=int(dossier_id) if dossier_id else None,
            payment_status=session.payment_status,
        )
    except Exception as e:
        logger.error(f"Payment verification error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Échec de la vérification du paiement: {str(e)}",
        )