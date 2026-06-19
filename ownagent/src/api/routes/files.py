"""
File API Routes
"""
import os
import uuid
import shutil
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File as FastAPIFile
from sqlalchemy.orm import Session

from src.api.dependencies import get_db
from src.api.config import settings
from src.models.database import File as FileModel, Conversation
from src.models.schemas import (
    FileUploadResponse, FileListResponse,
    FileResponse, BaseResponse
)

router = APIRouter(prefix="/api/v1/files", tags=["files"])


def get_file_extension(filename: str) -> str:
    """Get file extension"""
    return os.path.splitext(filename)[1].lower()


def is_allowed_file(content_type: str) -> bool:
    """Check if file type is allowed"""
    return content_type in settings.ALLOWED_FILE_TYPES


@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    conversation_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Upload a file for analysis"""
    # Validate file type
    if not is_allowed_file(file.content_type or ""):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{file.content_type}' not allowed"
        )
    
    # Read file content
    content = await file.read()
    
    # Validate file size
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE} bytes"
        )
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    extension = get_file_extension(file.filename or "")
    filename = f"{file_id}{extension}"
    storage_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Save file
    try:
        with open(storage_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Create database record
    file_record = FileModel(
        id=file_id,
        filename=filename,
        original_name=file.filename or "unnamed",
        mime_type=file.content_type or "application/octet-stream",
        size=len(content),
        status="processing",
        storage_path=storage_path
    )
    
    # Associate with conversation if provided
    if conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()
        if conversation:
            file_record.conversations.append(conversation)
    
    db.add(file_record)
    db.commit()
    db.refresh(file_record)
    
    # TODO: Trigger async file processing (text extraction, etc.)
    # For now, mark as ready
    file_record.status = "ready"
    db.commit()
    
    return FileUploadResponse(
        data={
            "id": file_record.id,
            "filename": file_record.filename,
            "original_name": file_record.original_name,
            "mime_type": file_record.mime_type,
            "size": file_record.size,
            "status": file_record.status,
            "created_at": file_record.created_at.isoformat() if file_record.created_at else None
        }
    )


@router.get("", response_model=FileListResponse)
async def list_files(
    conversation_id: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """List uploaded files"""
    query = db.query(FileModel)
    
    if conversation_id:
        query = query.join(FileModel.conversations).filter(
            Conversation.id == conversation_id
        )
    
    if status:
        query = query.filter(FileModel.status == status)
    
    total = query.count()
    files = query.order_by(FileModel.created_at.desc()).offset(
        (page - 1) * limit
    ).limit(limit).all()
    
    return FileListResponse(
        data={
            "files": [f.to_dict() for f in files],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": (total + limit - 1) // limit
            }
        }
    )


@router.get("/{file_id}")
async def get_file(
    file_id: str,
    db: Session = Depends(get_db)
):
    """Get file metadata"""
    file_record = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()
    
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File not found: {file_id}"
        )
    
    data = file_record.to_dict(include_text=True)
    data["conversations"] = [c.id for c in file_record.conversations]
    
    return BaseResponse(data=data)


@router.get("/{file_id}/download")
async def download_file(
    file_id: str,
    db: Session = Depends(get_db)
):
    """Download the original file"""
    from fastapi.responses import FileResponse
    import os
    
    file_record = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()
    
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File not found: {file_id}"
        )
    
    # Validate and sanitize the storage path to prevent path traversal
    storage_path = os.path.abspath(file_record.storage_path)
    upload_dir = os.path.abspath(settings.UPLOAD_DIR)
    
    # Ensure the file is within the allowed upload directory
    if not storage_path.startswith(upload_dir):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to this file is denied"
        )
    
    if not os.path.exists(storage_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    return FileResponse(
        path=storage_path,
        filename=file_record.original_name,
        media_type=file_record.mime_type
    )


@router.delete("/{file_id}", response_model=BaseResponse)
async def delete_file(
    file_id: str,
    db: Session = Depends(get_db)
):
    """Delete a file"""
    file_record = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()
    
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File not found: {file_id}"
        )
    
    # Delete from disk
    try:
        if os.path.exists(file_record.storage_path):
            os.remove(file_record.storage_path)
    except Exception as e:
        # Log error but continue with DB deletion
        print(f"Failed to delete file from disk: {e}")
    
    # Delete from database
    db.delete(file_record)
    db.commit()
    
    return BaseResponse(message="File deleted successfully")
