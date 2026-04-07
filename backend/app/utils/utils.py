from pypdf import PdfReader
import hmac
import hashlib
import base64
from fastapi import Request
import os

def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

    return text

def make_json_safe(obj):
    if isinstance(obj, dict):
        return {k: make_json_safe(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_json_safe(i) for i in obj]
    elif hasattr(obj, "isoformat"): 
        return obj.isoformat()
    else:
        return obj

def verify_shopify_webhook(request: Request, body_bytes: bytes):
    hmac_header = request.headers.get("X-Shopify-Hmac-Sha256")
    secret = os.getenv("SHOPIFY_POS_CLIENT_SECRET")

    digest = hmac.new(
        secret.encode("utf-8"),
        body_bytes,
        hashlib.sha256
    ).digest()

    computed_hmac = base64.b64encode(digest).decode()

    return hmac.compare_digest(computed_hmac, hmac_header)