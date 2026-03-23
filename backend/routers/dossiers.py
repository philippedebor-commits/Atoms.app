import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.dossiers import DossiersService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/dossiers", tags=["dossiers"])


# ---------- Pydantic Schemas ----------
class DossiersData(BaseModel):
    """Entity data schema (for create/update)"""
    project_name: str
    applicant_name: str = None
    email: str
    commune: str = None
    postal_code: str = None
    cadastral_section: str = None
    parcel: str = None
    land_area: str = None
    land_status: str = None
    environment: str = None
    topography: str = None
    vegetation: str = None
    access: str = None
    destination: str = None
    project_type: str = None
    lodge_model: str = None
    unit_count: str = None
    finish_level: str = None
    architect_description: str = None
    file_key: str = None
    layout_disposition: str = None
    unit_distance: str = None
    vegetation_preservation: str = None
    parking: str = None
    road_access: str = None
    connections: str = None
    project_objective: str = None
    integration_level: str = None
    environmental_commitment: str = None
    maximize_acceptance: bool = None
    generated_prompt: str = None
    payment_status: str = None
    stripe_session_id: str = None
    status: str = None
    created_at: Optional[datetime] = None


class DossiersUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    project_name: Optional[str] = None
    applicant_name: Optional[str] = None
    email: Optional[str] = None
    commune: Optional[str] = None
    postal_code: Optional[str] = None
    cadastral_section: Optional[str] = None
    parcel: Optional[str] = None
    land_area: Optional[str] = None
    land_status: Optional[str] = None
    environment: Optional[str] = None
    topography: Optional[str] = None
    vegetation: Optional[str] = None
    access: Optional[str] = None
    destination: Optional[str] = None
    project_type: Optional[str] = None
    lodge_model: Optional[str] = None
    unit_count: Optional[str] = None
    finish_level: Optional[str] = None
    architect_description: Optional[str] = None
    file_key: Optional[str] = None
    layout_disposition: Optional[str] = None
    unit_distance: Optional[str] = None
    vegetation_preservation: Optional[str] = None
    parking: Optional[str] = None
    road_access: Optional[str] = None
    connections: Optional[str] = None
    project_objective: Optional[str] = None
    integration_level: Optional[str] = None
    environmental_commitment: Optional[str] = None
    maximize_acceptance: Optional[bool] = None
    generated_prompt: Optional[str] = None
    payment_status: Optional[str] = None
    stripe_session_id: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None


class DossiersResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    project_name: str
    applicant_name: Optional[str] = None
    email: str
    commune: Optional[str] = None
    postal_code: Optional[str] = None
    cadastral_section: Optional[str] = None
    parcel: Optional[str] = None
    land_area: Optional[str] = None
    land_status: Optional[str] = None
    environment: Optional[str] = None
    topography: Optional[str] = None
    vegetation: Optional[str] = None
    access: Optional[str] = None
    destination: Optional[str] = None
    project_type: Optional[str] = None
    lodge_model: Optional[str] = None
    unit_count: Optional[str] = None
    finish_level: Optional[str] = None
    architect_description: Optional[str] = None
    file_key: Optional[str] = None
    layout_disposition: Optional[str] = None
    unit_distance: Optional[str] = None
    vegetation_preservation: Optional[str] = None
    parking: Optional[str] = None
    road_access: Optional[str] = None
    connections: Optional[str] = None
    project_objective: Optional[str] = None
    integration_level: Optional[str] = None
    environmental_commitment: Optional[str] = None
    maximize_acceptance: Optional[bool] = None
    generated_prompt: Optional[str] = None
    payment_status: Optional[str] = None
    stripe_session_id: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DossiersListResponse(BaseModel):
    """List response schema"""
    items: List[DossiersResponse]
    total: int
    skip: int
    limit: int


class DossiersBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[DossiersData]


class DossiersBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: DossiersUpdateData


class DossiersBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[DossiersBatchUpdateItem]


class DossiersBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=DossiersListResponse)
async def query_dossierss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query dossierss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying dossierss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = DossiersService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
            user_id=str(current_user.id),
        )
        logger.debug(f"Found {result['total']} dossierss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying dossierss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=DossiersListResponse)
async def query_dossierss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query dossierss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying dossierss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = DossiersService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} dossierss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying dossierss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=DossiersResponse)
async def get_dossiers(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single dossiers by ID (user can only see their own records)"""
    logger.debug(f"Fetching dossiers with id: {id}, fields={fields}")
    
    service = DossiersService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Dossiers with id {id} not found")
            raise HTTPException(status_code=404, detail="Dossiers not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching dossiers {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=DossiersResponse, status_code=201)
async def create_dossiers(
    data: DossiersData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new dossiers"""
    logger.debug(f"Creating new dossiers with data: {data}")
    
    service = DossiersService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create dossiers")
        
        logger.info(f"Dossiers created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating dossiers: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating dossiers: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[DossiersResponse], status_code=201)
async def create_dossierss_batch(
    request: DossiersBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple dossierss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} dossierss")
    
    service = DossiersService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} dossierss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[DossiersResponse])
async def update_dossierss_batch(
    request: DossiersBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple dossierss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} dossierss")
    
    service = DossiersService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} dossierss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=DossiersResponse)
async def update_dossiers(
    id: int,
    data: DossiersUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing dossiers (requires ownership)"""
    logger.debug(f"Updating dossiers {id} with data: {data}")

    service = DossiersService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Dossiers with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Dossiers not found")
        
        logger.info(f"Dossiers {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating dossiers {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating dossiers {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_dossierss_batch(
    request: DossiersBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple dossierss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} dossierss")
    
    service = DossiersService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} dossierss successfully")
        return {"message": f"Successfully deleted {deleted_count} dossierss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_dossiers(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single dossiers by ID (requires ownership)"""
    logger.debug(f"Deleting dossiers with id: {id}")
    
    service = DossiersService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Dossiers with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Dossiers not found")
        
        logger.info(f"Dossiers {id} deleted successfully")
        return {"message": "Dossiers deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting dossiers {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")