from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import os
import logging
import asyncio
import time

from api.models_cache import MODELS_CACHE, ModelInfo
from api.providers.groq import GroqProvider
from api.providers.cerebras import CerebrasProvider
from api.providers.nvidia import NvidiaProvider
from api.providers.openrouter import OpenRouterProvider
from api.providers.gemini import GeminiProvider
from api.providers.huggingface import HuggingFaceProvider
from api.providers.deepseek import DeepSeekProvider
from api.providers.alibaba import AlibabaProvider
from api.providers.extended import ExtendedCompatibleProvider, PROVIDER_CONFIGS
from api.scraping import scrape_url_to_markdown
from api.cost_tracker import calculate_cost
from api.skills import execute_skills
from api.memory import MemoryEngine
from api.config import CUSTOM_PROVIDERS, GROQ_API_KEY, CEREBRAS_API_KEY, NVIDIA_API_KEY, OPENROUTER_API_KEY, GEMINI_API_KEY, HUGGINGFACE_API_KEY, DEEPSEEK_API_KEY, ALLOWED_EMAIL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("codecraft.api")

app = FastAPI(title="Code Craft Enterprise API", version="1.0.5")

# In-memory model cache with 10-minute TTL
_models_cache: List[ModelInfo] = []
_models_cache_time: float = 0.0
MODELS_CACHE_TTL = 600  # 10 minutes

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

async def verify_user_email(request: Request):
    """Dependency to verify X-User-Email header matches ALLOWED_EMAIL"""
    client_email = request.headers.get("X-User-Email", "").strip().lower()
    allowed = ALLOWED_EMAIL.strip().lower()
    if client_email and client_email != allowed:
        logger.warning(f"Unauthorized email access attempt: {client_email}. Expected: {allowed}")
        raise HTTPException(status_code=403, detail=f"Access Denied: Unauthorized Email ({client_email}). This workspace is strictly restricted to {allowed}.")
    return client_email

class CustomProviderMock:
    def __init__(self, endpoint: str, api_key: str):
        self.endpoint = endpoint
        self.api_key = api_key
        import httpx
        self.client = httpx.AsyncClient(headers={"Authorization": f"Bearer {api_key}"} if api_key else {})

    async def generate(self, model: str, prompt: str, image_base64: Optional[str] = None, generation_type: str = "text") -> dict:
        url = self.endpoint.rstrip('/') + "/chat/completions"
        try:
            response = await self.client.post(url, json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}]
            }, timeout=60.0)
            data = response.json()
            if "error" in data:
                raise Exception(data["error"].get("message", str(data["error"])))
            content = data["choices"][0]["message"]["content"]
            return {"type": "text", "content": content, "usage": data.get("usage", {})}
        except Exception as e:
            logger.error(f"Custom provider error: {str(e)}")
            raise Exception(f"Custom Provider Error ({self.endpoint}): {str(e)}")

def get_providers_map(api_keys: Optional[Dict[str, str]] = None, custom_provs: Optional[List[Dict[str, Any]]] = None):
    keys = api_keys or {}
    provs = {}
    
    # Core Providers
    gk = keys.get("groq") or GROQ_API_KEY
    provs["groq"] = GroqProvider(api_key=gk or "")

    ck = keys.get("cerebras") or CEREBRAS_API_KEY
    provs["cerebras"] = CerebrasProvider(api_key=ck or "")

    nk = keys.get("nvidia") or NVIDIA_API_KEY
    provs["nvidia"] = NvidiaProvider(api_key=nk or "")

    ok = keys.get("openrouter") or OPENROUTER_API_KEY
    provs["openrouter"] = OpenRouterProvider(api_key=ok or "")

    gemk = keys.get("gemini") or GEMINI_API_KEY
    provs["gemini"] = GeminiProvider(api_key=gemk or "")

    hk = keys.get("huggingface") or HUGGINGFACE_API_KEY
    provs["huggingface"] = HuggingFaceProvider(api_key=hk or "")

    dk = keys.get("deepseek") or DEEPSEEK_API_KEY
    provs["deepseek"] = DeepSeekProvider(api_key=dk or "")

    # Alibaba
    alik = keys.get("alibaba") or ""
    provs["alibaba"] = AlibabaProvider(api_key=alik)

    # Extended Providers
    for pid in PROVIDER_CONFIGS.keys():
        pk = keys.get(pid) or ""
        provs[pid] = ExtendedCompatibleProvider(provider_id=pid, api_key=pk)

    # Custom
    cps = custom_provs if custom_provs is not None else json.loads(CUSTOM_PROVIDERS)
    for cp in cps:
        name = cp.get("name", "").lower()
        if name:
            provs[name] = CustomProviderMock(cp.get("endpoint", ""), cp.get("api_key", ""))

    return provs

@app.on_event("startup")
async def load_models():
    """Pre-warm the model cache on startup."""
    await _refresh_models_cache()

async def _refresh_models_cache(api_keys: Optional[Dict[str, str]] = None,
                                 custom_provs: Optional[List[Dict[str, Any]]] = None) -> List[ModelInfo]:
    global _models_cache, _models_cache_time

    provs = get_providers_map(api_keys, custom_provs)

    # Fetch all providers concurrently
    async def fetch_provider(name: str, provider) -> List[ModelInfo]:
        if hasattr(provider, "list_models"):
            try:
                return await provider.list_models()
            except Exception as e:
                logger.warning(f"Model list failed for {name}: {e}")
        return []

    tasks = [(name, provider) for name, provider in provs.items()]
    results_list = await asyncio.gather(*[fetch_provider(n, p) for n, p in tasks], return_exceptions=True)

    seen_ids: set = set()
    result: List[ModelInfo] = []

    for models in results_list:
        if isinstance(models, list):
            for m in models:
                if m.model_id not in seen_ids:
                    result.append(m)
                    seen_ids.add(m.model_id)

    _models_cache = result
    _models_cache_time = time.time()
    logger.info(f"Model cache refreshed concurrently: {len(_models_cache)} total models")
    return result

class ModelsRequest(BaseModel):
    api_keys: Optional[Dict[str, str]] = None
    custom_providers: Optional[List[Dict[str, Any]]] = None
    type: Optional[str] = None

class GenerateRequest(BaseModel):
    provider: str
    model: str
    prompt: str
    image: Optional[str] = None
    generation_type: str = "text"
    api_keys: Optional[Dict[str, str]] = None
    custom_providers: Optional[List[Dict[str, Any]]] = None
    active_skills: Optional[List[str]] = None
    long_term_memories: Optional[List[Dict[str, Any]]] = None
    streaming: Optional[bool] = False

class ScrapeRequest(BaseModel):
    url: str

class SkillsRequest(BaseModel):
    prompt: str
    active_skills: List[str]

class MemoryExtractRequest(BaseModel):
    prompt: str
    history: Optional[List[Dict[str, Any]]] = None

@app.post("/api/models")
async def get_models_post(req: ModelsRequest, email: str = Depends(verify_user_email)):
    global _models_cache, _models_cache_time
    age = time.time() - _models_cache_time
    if age > MODELS_CACHE_TTL or not _models_cache or req.api_keys:
        await _refresh_models_cache(req.api_keys, req.custom_providers)
    cache = _models_cache

    # Add custom providers
    if req.custom_providers:
        seen = {m.model_id for m in cache}
        for cp in req.custom_providers:
            name = cp.get("name", "").lower()
            cid = f"custom-{name}"
            if name and cid not in seen:
                cache = list(cache) + [ModelInfo(
                    provider=name, model_id=cid,
                    display_name=f"{name.upper()} Custom",
                    type="text", logo_url="/logos/custom.svg",
                    context_length=8192, cost_per_1k_tokens=0.0,
                    is_free=False, capabilities=["Custom REST"], tier="Custom"
                )]

    if req.type:
        return [m.dict() for m in cache if m.type == req.type]
    return [m.dict() for m in cache]

@app.get("/api/models")
async def get_models_get(type: Optional[str] = None, email: str = Depends(verify_user_email)):
    global _models_cache, _models_cache_time
    age = time.time() - _models_cache_time
    if age > MODELS_CACHE_TTL or not _models_cache:
        await _refresh_models_cache()
    cache = _models_cache
    if type:
        return [m.dict() for m in cache if m.type == type]
    return [m.dict() for m in cache]

@app.get("/api/models/refresh")
async def force_refresh_models(email: str = Depends(verify_user_email)):
    """Force a live re-fetch from all providers."""
    result = await _refresh_models_cache()
    return {"refreshed": True, "count": len(result)}

@app.post("/api/skills/execute")
async def execute_skills_endpoint(req: SkillsRequest, email: str = Depends(verify_user_email)):
    try:
        results = execute_skills(req.prompt, req.active_skills)
        return {"results": results}
    except Exception as e:
        logger.error(f"Skills execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent Skills Execution Failed: {str(e)}")

@app.post("/api/memory/extract")
async def extract_memory_endpoint(req: MemoryExtractRequest, email: str = Depends(verify_user_email)):
    try:
        facts = MemoryEngine.extract_facts(req.prompt, req.history)
        return {"facts": facts}
    except Exception as e:
        logger.error(f"Memory extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Long-Term Memory Extraction Failed: {str(e)}")

@app.post("/api/generate")
async def generate(req: GenerateRequest, email: str = Depends(verify_user_email)):
    provs = get_providers_map(req.api_keys, req.custom_providers)
    provider = provs.get(req.provider.lower())
    if not provider:
        raise HTTPException(status_code=400, detail=f"Provider '{req.provider}' is not configured or missing API key. Please configure your API key in Settings.")
    
    enriched_prompt = req.prompt
    context_blocks = []

    if req.long_term_memories:
        mem_str = MemoryEngine.format_memory_context(req.long_term_memories)
        if mem_str:
            context_blocks.append(mem_str)

    if req.active_skills:
        skill_results = execute_skills(req.prompt, req.active_skills)
        if skill_results:
            skill_lines = ["⚡ [AGENT SKILLS AUTONOMOUS EXECUTION RESULTS]:"]
            for sid, sres in skill_results.items():
                skill_lines.append(f"### {sid.upper()} Output:\n{sres}\n")
            skill_lines.append("--------------------------------------------------\n")
            context_blocks.append("\n".join(skill_lines))

    if context_blocks:
        enriched_prompt = "\n\n".join(context_blocks) + "\n\n" + f"### USER PROMPT:\n{req.prompt}"

    if req.streaming and req.generation_type == "text":
        async def event_generator():
            try:
                logger.info(f"Streaming content using {req.provider}/{req.model} with enriched context")
                result = await provider.generate(
                    model=req.model,
                    prompt=enriched_prompt,
                    image_base64=req.image,
                    generation_type=req.generation_type
                )
                if "usage" in result:
                    result["cost"] = calculate_cost(f"{req.provider}/{req.model}", result["usage"])
                
                content = result.get("content", "")
                chunk_size = 12
                for i in range(0, len(content), chunk_size):
                    chunk = content[i:i+chunk_size]
                    data = json.dumps({"chunk": chunk, "type": "text"})
                    yield f"data: {data}\n\n"
                    await asyncio.sleep(0.01)
                
                final_data = json.dumps({"done": True, "cost": result.get("cost", 0.0), "usage": result.get("usage", {})})
                yield f"data: {final_data}\n\n"
            except Exception as e:
                logger.error(f"Streaming error on {req.provider}/{req.model}: {str(e)}")
                err_data = json.dumps({"error": f"AI Provider Error ({req.provider.upper()}): {str(e)}"})
                yield f"data: {err_data}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    try:
        logger.info(f"Generating content using {req.provider}/{req.model} with enriched context")
        result = await provider.generate(
            model=req.model,
            prompt=enriched_prompt,
            image_base64=req.image,
            generation_type=req.generation_type
        )
        if "usage" in result:
            result["cost"] = calculate_cost(f"{req.provider}/{req.model}", result["usage"])
        return result
    except Exception as e:
        logger.error(f"Generation error on {req.provider}/{req.model}: {str(e)}")
        raise HTTPException(status_code=502, detail=f"AI Provider Error ({req.provider.upper()}): {str(e)}. Please verify your API key permissions and account balance.")

@app.post("/api/scrape")
async def scrape(req: ScrapeRequest, email: str = Depends(verify_user_email)):
    try:
        markdown = await scrape_url_to_markdown(req.url)
        return {"markdown": markdown}
    except Exception as e:
        logger.error(f"Scraping error for {req.url}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Web Scraping Failed: {str(e)}")
