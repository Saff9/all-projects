"""
Image parser for Apex Smart
Extracts text from images using OCR
"""
from typing import Dict, Any, Optional
from pathlib import Path


class ImageParser:
    """Parser for images with OCR support"""
    
    def __init__(self):
        self.name = "Image OCR Parser"
        self.supported_extensions = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"]
    
    def parse(self, file_path: str) -> Dict[str, Any]:
        """
        Parse image and extract text using OCR
        
        Args:
            file_path: Path to image file
            
        Returns:
            Dictionary with extracted text and metadata
        """
        result = {
            "text": "",
            "metadata": {},
            "error": None
        }
        
        try:
            from PIL import Image
            
            # Open image and get metadata
            with Image.open(file_path) as img:
                result["metadata"] = {
                    "format": img.format,
                    "mode": img.mode,
                    "size": img.size,
                    "width": img.width,
                    "height": img.height
                }
                
                # Try OCR if available
                ocr_text = self._perform_ocr(file_path)
                if ocr_text:
                    result["text"] = ocr_text
                    result["word_count"] = len(ocr_text.split())
                else:
                    result["text"] = f"[Image: {img.format} {img.size[0]}x{img.size[1]}]"
                    
        except ImportError:
            result["error"] = "Pillow not installed. Install with: pip install Pillow"
        except Exception as e:
            result["error"] = f"Failed to parse image: {str(e)}"
        
        return result
    
    def _perform_ocr(self, file_path: str) -> Optional[str]:
        """
        Perform OCR on image
        
        Args:
            file_path: Path to image file
            
        Returns:
            Extracted text or None if OCR not available
        """
        try:
            import pytesseract
            from PIL import Image
            
            # Perform OCR
            image = Image.open(file_path)
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            text = pytesseract.image_to_string(image)
            
            return text.strip() if text.strip() else None
            
        except ImportError:
            # pytesseract not installed
            return None
        except Exception as e:
            print(f"OCR failed: {e}")
            return None
    
    def get_preview(self, file_path: str, max_chars: int = 1000) -> str:
        """
        Get a preview of the image content (OCR text)
        
        Args:
            file_path: Path to image file
            max_chars: Maximum characters to return
            
        Returns:
            Preview text or image description
        """
        result = self.parse(file_path)
        
        if result["error"]:
            return f"Error: {result['error']}"
        
        text = result["text"]
        if len(text) > max_chars:
            text = text[:max_chars] + "..."
        
        return text
    
    def extract_text_regions(self, file_path: str) -> list:
        """
        Extract text regions with bounding boxes
        
        Args:
            file_path: Path to image file
            
        Returns:
            List of text regions with coordinates
        """
        regions = []
        
        try:
            import pytesseract
            from PIL import Image
            
            image = Image.open(file_path)
            
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Get data including bounding boxes
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            
            n_boxes = len(data['text'])
            for i in range(n_boxes):
                if int(data['conf'][i]) > 60:  # Confidence threshold
                    text = data['text'][i].strip()
                    if text:
                        regions.append({
                            'text': text,
                            'x': data['left'][i],
                            'y': data['top'][i],
                            'width': data['width'][i],
                            'height': data['height'][i],
                            'confidence': data['conf'][i]
                        })
                        
        except ImportError:
            pass
        except Exception as e:
            print(f"Text region extraction failed: {e}")
        
        return regions
    
    def is_ocr_available(self) -> bool:
        """Check if OCR is available"""
        try:
            import pytesseract
            return True
        except ImportError:
            return False
