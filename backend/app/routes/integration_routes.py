from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse
import firebase_admin
from firebase_admin import credentials, firestore
import requests
import os
import secrets
from app.models.schemas import POSConnectRequest
from app.services.pinecone_service import PineconeService
from app.utils.utils import verify_shopify_webhook

router = APIRouter()
pinecone = PineconeService()

if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'cognition-d6663.firebasestorage.app'  
    })

db = firestore.client()


# LIGHTSPEED ENDPOINTS
@router.post('/lightspeed/connect')
def connect_lightspeed(req: POSConnectRequest):
    client_id = os.getenv("LIGHTSPEED_CLIENT_ID")
    redirect_uri = os.getenv("LIGHTSPEED_REDIRECT_URI")
    workspace_id = req.workspace_id
    settings = req.settings

    state = f"{workspace_id}:{secrets.token_urlsafe(16)}"

    scopes = ["offline_access"]

    if "Sync Products" in settings:
        scopes.append("products:read")

    if "Sync Inventory" in settings:
        scopes.append("inventory:read")

    scopes.append("webhooks")
    scope_string = " ".join(scopes)

    auth_url = (
        "https://secure.vendhq.com/connect"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        "&response_type=code"
        f"&state={state}"
        f"&scope={scope_string}"
    )

    return {"auth_url": auth_url}


@router.get("/lightspeed/callback")
def lightspeed_callback(code: str | None = None, domain_prefix: str | None = None, state: str | None = None, error: str | None = None):

    if error:
        return {"error": error}
    
    if not code:
        raise HTTPException(status_code=400, detail="Missing OAuth code")
    
    if not state:
        raise HTTPException(status_code=400, detail="Missing state")

    # connect and authorize lightspeed
    workspace_id = state.split(":")[0]
    token_url = f"https://{domain_prefix}.retail.lightspeed.app/api/1.0/token"

    response = requests.post(
        token_url,
        headers={
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data={
            "code": code,
            "client_id": os.getenv("LIGHTSPEED_CLIENT_ID"),
            "client_secret": os.getenv("LIGHTSPEED_CLIENT_SECRET"),
            "grant_type": "authorization_code",
            "redirect_uri": os.getenv("LIGHTSPEED_REDIRECT_URI"),
        }
    )

    print("STATUS:", response.status_code)
    print("BODY:", response.text)

    if response.status_code != 200:
        raise HTTPException(status_code=400, detail=response.text)

    token_data = response.json()

    print("TOKEN DATA:", token_data)

    # save token data in firebase
    workspace_ref = db.collection("workspaces").document(workspace_id)
    workspace_ref.collection("integrations").document("lightspeed").set({
        "access_token": token_data["access_token"],
        "refresh_token": token_data["refresh_token"],
        "domain_prefix": token_data["domain_prefix"],
        "expires": token_data["expires"],
        "scope": token_data["scope"],
        "connected_at": firestore.SERVER_TIMESTAMP
    })

    token = token_data["access_token"]
    domain = token_data["domain_prefix"]

    # update posProvider in firebase
    workspace_ref.set({
        "posProvider": "Lightspeed"
    }, merge=True)

    # delete pre-existing products
    products_ref = workspace_ref.collection("products")

    docs = products_ref.stream()
    for doc in docs:
        doc.reference.delete()

    pinecone.delete_workspace_products(workspace_id)
    
    # create webhook
    webhook_url = os.getenv("LIGHTSPEED_WEBHOOK_URL")
    webhook_response = requests.post(
        f"https://{domain}.retail.lightspeed.app/api/2026-01/webhooks",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={
            "active": True,
            "type": "product.update",
            "url": webhook_url
        }
    )

    if webhook_response.status_code not in [201, 409]:
        print("Webhook creation failed:", webhook_response.text)

    # sync products
    products_url = f"https://{domain}.retail.lightspeed.app/api/2.0/products"
    while products_url:
        product_response = requests.get(
            products_url,
            headers={"Authorization": f"Bearer {token}"}
        )

        if product_response.status_code != 200:
            break

        data = product_response.json()
        products = data.get("data", [])

        for product in products:
            product_id = product["id"]
            
            # save in firestore
            workspace_ref.collection("products").document(product_id).set({
                "name": product.get("name"),
                "sku": product.get("sku"),
                "brand": product.get("brand_name"),
                "retail_price": product.get("price_excluding_tax"),
                "source": "lightspeed",
                "external_id": product_id,
                "description": product.get("description"),
                "product_category": product.get("product_category"),
                "last_synced": firestore.SERVER_TIMESTAMP
            }, merge=True)

            # save in pinecone
            pinecone.upsert_product(workspace_id, product)

        products_url = data.get("links", {}).get("next")


    return HTMLResponse("""
        <html>
        <body>
            <script>
            if (window.opener) {
                window.opener.postMessage({ type: "lightspeed_connected" }, "*");
            }
            window.close();
            </script>
            <p>Lightspeed connected successfully. You can close this window.</p>
        </body>
        </html>
    """)

@router.get("/lightspeed/products")
def get_products(workspace_id: str):

    doc = db.collection("workspaces").document(workspace_id).collection("integrations").document("lightspeed").get()
    data = doc.to_dict()

    token = data["access_token"]
    domain = data["domain_prefix"]

    url = f"https://{domain}.retail.lightspeed.app/api/2.0/products"
    response = requests.get(url, headers={"Authorization": f"Bearer {token}"})

    return response.json()

@router.post("/lightspeed/webhook")
async def lightspeed_webhook(request: Request):
    payload = await request.json()

    print("LIGHTSPEED WEBHOOK:", payload)

    return {"status": "received"}



# SHOPIFY POS ENDPOINTS
@router.post("/shopify/connect")
def connect_shopify(req: POSConnectRequest):
    client_id = os.getenv("SHOPIFY_POS_CLIENT_ID")
    redirect_uri = os.getenv("SHOPIFY_POS_REDIRECT_URI")

    workspace_id = req.workspace_id
    shop = req.shop

    state = f"{workspace_id}:{secrets.token_urlsafe(16)}"

    scopes = "read_products,read_inventory"

    auth_url = (
        f"https://{shop}/admin/oauth/authorize"
        f"?client_id={client_id}"
        f"&scope={scopes}"
        f"&redirect_uri={redirect_uri}"
        f"&state={state}"
        f"&response_type=code"
    )

    return {"auth_url": auth_url}

@router.get("/shopify/callback")
def shopify_callback(code: str = None, shop: str = None, state: str = None):

    if not code or not shop or not state:
        raise HTTPException(status_code=400, detail="Missing params")

    workspace_id = state.split(":")[0]

    token_url = f"https://{shop}/admin/oauth/access_token"

    response = requests.post(
        token_url,
        headers={
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data={
            "client_id": os.getenv("SHOPIFY_POS_CLIENT_ID"),
            "client_secret": os.getenv("SHOPIFY_POS_CLIENT_SECRET"),
            "code": code,
        }
    )

    data = response.json()
    access_token = data.get("access_token")

    if not access_token:
        raise HTTPException(status_code=400, detail="Token exchange failed")

    workspace_ref = db.collection("workspaces").document(workspace_id)

    workspace_ref.collection("integrations").document("shopify").set({
        "access_token": access_token,
        "shop": shop,
        "connected_at": firestore.SERVER_TIMESTAMP
    })

    # update pos provider in firebase
    workspace_ref.set({
        "posProvider": "Shopify POS"
    }, merge=True)

    # delete pre-existing products
    products_ref = workspace_ref.collection("products")

    docs = products_ref.stream()
    for doc in docs:
        doc.reference.delete()

    pinecone.delete_workspace_products(workspace_id)

    # create webhook

    webhook_url = os.getenv("SHOPIFY_POS_WEBHOOK_URL")

    webhook_response = requests.post(
        f"https://{shop}/admin/api/2024-01/webhooks.json",
        headers={
            "X-Shopify-Access-Token": access_token,
            "Content-Type": "application/json"
        },
        json={
            "webhook": {
                "topic": "products/update",
                "address": webhook_url,
                "format": "json"
            }
        }
    )

    print("WEBHOOK STATUS:", webhook_response.status_code)
    print("WEBHOOK BODY:", webhook_response.text)

    # sync products
    query = """
        query ($cursor: String) {
        products(first: 50, after: $cursor) {
            edges {
            cursor
            node {
                id
                title
                description
                variants(first: 5) {
                edges {
                    node {
                    id
                    price
                    inventoryQuantity
                    }
                }
                }
            }
            }
            pageInfo {
            hasNextPage
            }
        }
        }
    """

    url = f"https://{shop}/admin/api/2024-01/graphql.json"

    cursor = None
    has_next_page = True

    while has_next_page:
        response = requests.post(
            url,
            json={
                "query": query,
                "variables": {"cursor": cursor}
            },
            headers={
                "X-Shopify-Access-Token": access_token,
                "Content-Type": "application/json"
            }
        )

        data = response.json()

        products = data["data"]["products"]["edges"]

        for edge in products:
            product = edge["node"]
            product_id = product["id"]

            raw_id = product["id"]
            product_id = raw_id.split("/")[-1]

            workspace_ref.collection("products").document(product_id).set({
                "name": product.get("title"),
                "description": product.get("description"),
                "source": "shopify",
                "external_id": raw_id, 
                "last_synced": firestore.SERVER_TIMESTAMP
            }, merge=True)

            pinecone.upsert_product(workspace_id, product)

            for v in product.get("variants", {}).get("edges", []):
                variant = v["node"]

                raw_variant_id = variant["id"]
                variant_id = raw_variant_id.split("/")[-1]

                workspace_ref.collection("products") \
                    .document(product_id) \
                    .collection("variants") \
                    .document(variant_id).set({
                        "price": variant.get("price"),
                        "inventory": variant.get("inventoryQuantity"),
                        "external_id": raw_variant_id
                    }, merge=True)

        if products:
            cursor = products[-1]["cursor"]

        has_next_page = data["data"]["products"]["pageInfo"]["hasNextPage"]

    return HTMLResponse("""
        <html>
        <body>
            <script>
            if (window.opener) {
                window.opener.postMessage({ type: "shopify_connected" }, "*");
            }
            window.close();
            </script>
            <p>Shopify connected and products synced successfully.</p>
        </body>
        </html>
    """)

@router.post("/shopify/webhook")
async def shopify_webhook(request: Request):
    body_bytes = await request.body()

    if not verify_shopify_webhook(request, body_bytes):
        raise HTTPException(status_code=401, detail="Invalid webhook")

    body = await request.json()

    print("VERIFIED WEBHOOK:", body)

    shop = request.headers.get("X-Shopify-Shop-Domain")

    if not shop:
        return {"status": "no shop"}

    query = db.collection_group("integrations") \
        .where("shop", "==", shop) \
        .stream()

    workspace_id = None
    for doc in query:
        workspace_id = doc.reference.parent.parent.id

    if not workspace_id:
        return {"status": "workspace not found"}

    workspace_ref = db.collection("workspaces").document(workspace_id)

    raw_id = body.get("id")
    if not raw_id:
        return {"status": "no product id"}

    product_id = str(raw_id) 

    workspace_ref.collection("products").document(product_id).set({
        "name": body.get("title"),
        "description": body.get("body_html"),
        "source": "shopify",
        "external_id": raw_id,
        "last_synced": firestore.SERVER_TIMESTAMP
    }, merge=True)

    pinecone.upsert_product(workspace_id, {
        "id": f"gid://shopify/Product/{raw_id}", 
        "title": body.get("title"),
        "description": body.get("body_html"),
        "product_category": "",
        "brand": "",
        "supplier": "",
        "price_excluding_tax": 0
    })

    print("Webhook processed for product:", product_id)

    return {"status": "ok"}