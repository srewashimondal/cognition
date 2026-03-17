import os
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI

class PineconeService:
    def __init__(self):
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.index_name = "cognition-products"
        self._ensure_index()
        self.index = self.pc.Index(self.index_name)

    def _ensure_index(self):
        existing_indexes = [i.name for i in self.pc.list_indexes()]

        if self.index_name not in existing_indexes:
            print("Creating Pinecone index...")

            self.pc.create_index(
                name=self.index_name,
                dimension=1536,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
    
    def create_embedding(self, text: str):
        return self.openai.embeddings.create(
            model="text-embedding-3-small",
            input=text
        ).data[0].embedding
    
    def upsert_product(self, workspace_id: str, product: dict):
        
        product_id = product.get("id")
        name = product.get("name") or ""
        description = product.get("description") or ""
        product_category = product.get("product_category") or {}
        category = product_category.get("name", "") if isinstance(product_category, dict) else str(product_category)
        brand_obj = product.get("brand") or {}
        brand = brand_obj.get("name", "") if isinstance(brand_obj, dict) else str(brand_obj)
        supplier_obj = product.get("supplier") or {}
        supplier = supplier_obj.get("name", "") if isinstance(supplier_obj, dict) else str(supplier_obj)

        price = product.get("price_including_tax")
        if price is None:
            price = product.get("price_excluding_tax")
        if price is None:
            price = 0.0

        description = product.get("description") or ""

        text = f"""
            Name: {name}
            Brand: {brand}
            Category: {category}
            Price: {price}
            Description: {description}
        """.strip()

        embedding = self.create_embedding(text)

        metadata = {
            "workspace_id": str(workspace_id),
            "name": str(name),
            "brand": str(brand),
            "category": str(category),
            "supplier": str(supplier),
            "price": float(price),
            "text": text,
        }

        self.index.upsert([
            {
                "id": f"{workspace_id}-{product_id}",
                "values": embedding,
                "metadata": metadata
            }
        ])

    def search(self, workspace_id: str, query: str, top_k: int = 5):
        embedding = self.create_embedding(query)

        results = self.index.query(
            vector=embedding,
            top_k=top_k,
            include_metadata=True,
            filter={"workspace_id": str(workspace_id)}
        )

        return [m["metadata"] for m in results["matches"]]
    
