import logging
from typing import List, Dict, Any, Optional
import re
import time

logger = logging.getLogger("codecraft.memory")

class MemoryEngine:
    """Long-Term Memory Engine (Mem0 / Zep style entity & fact storage)"""
    
    @staticmethod
    def extract_facts(prompt: str, history: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
        """Dynamically extract persistent user preferences, coding styles, and project facts from prompts"""
        logger.info("Extracting long-term memory facts from prompt with smart relevance filtering")
        facts = []
        
        # Rule-based entity & preference extraction simulating NLP/LLM extraction
        clean_prompt = prompt.lower()
        
        # Existing history contents for deduplication
        existing_contents = set()
        if history:
            for h in history:
                existing_contents.add(h.get("content", "").lower())
        
        # Helper to add fact only if highly relevant and not duplicate
        def add_smart_fact(cat: str, content: str, conf: float):
            if conf >= 0.90 and content.lower() not in existing_contents:
                facts.append({
                    "id": f"fact_{cat}_{int(time.time()*1000)}",
                    "category": cat,
                    "content": content,
                    "confidence": conf,
                    "timestamp": int(time.time() * 1000)
                })
                existing_contents.add(content.lower())

        # Language preferences
        if "typescript" in clean_prompt and ("prefer" in clean_prompt or "use" in clean_prompt or "always" in clean_prompt):
            add_smart_fact("language_preference", "User strictly prefers TypeScript over JavaScript for all frontend and full-stack development.", 0.95)
        elif "python" in clean_prompt and "fastapi" in clean_prompt:
            add_smart_fact("backend_architecture", "User utilizes FastAPI with Mangum adapter for serverless Python backend deployments.", 0.95)
            
        # Styling preferences
        if "dark mode" in clean_prompt or "glassmorphism" in clean_prompt or "linear" in clean_prompt or "lobehub" in clean_prompt:
            add_smart_fact("ui_aesthetic", "User prefers ultra-premium UI/UX inspired by Linear and LobeHub featuring dark mode, glassmorphism, and radial gradients.", 0.98)
            
        # Security preferences
        if "encrypt" in clean_prompt or "aes-gcm" in clean_prompt or "passphrase" in clean_prompt:
            add_smart_fact("security_protocol", "User mandates military-grade AES-GCM client-side encryption with secure passphrase for all local chat history storage.", 0.99)
            
        # Generic project learning
        match = re.search(r"(?:my project is|working on|building) ([\w\s]+)", prompt, re.IGNORECASE)
        if match:
            project_name = match.group(1).strip()
            add_smart_fact("active_project", f"User is actively developing a project named '{project_name}'.", 0.92)

        return facts

    @staticmethod
    def format_memory_context(memories: List[Dict[str, Any]]) -> str:
        """Format retrieved memory nodes into a highly optimized system prompt injection string"""
        if not memories:
            return ""
            
        context_lines = [
            "🧠 [PERSISTENT LONG-TERM MEMORY LAYER ACTIVE]:",
            "The following learned facts and user preferences must strictly guide your architectural decisions and code generation:"
        ]
        
        for m in memories:
            cat = m.get("category", "general").upper()
            content = m.get("content", "")
            context_lines.append(f"- [{cat}]: {content}")
            
        context_lines.append("--------------------------------------------------\n")
        return "\n".join(context_lines)
