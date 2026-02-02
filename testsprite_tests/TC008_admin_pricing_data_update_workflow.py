import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_admin_pricing_data_update_workflow():
    headers = {
        "Content-Type": "application/json"
    }

    # Step 1: Simulate updating pricing data (assuming update via POST /api/pricing-catalog)
    # Prepare sample updated pricing data payload (minimal example)
    updated_pricing_payload = {
        "products": [
            {
                "id": "test-product-001",
                "name": "Test Kitchen Set Deluxe",
                "category": "Kitchen Sets",
                "price": 1999.99,
                "specifications": {
                    "material": "High-grade wood",
                    "color": "Maple",
                    "dimensions": "200x80x90 cm"
                }
            }
        ]
    }

    create_product_response = None
    try:
        # Post updated pricing data to /api/pricing-catalog
        create_product_response = requests.post(
            f"{BASE_URL}/api/pricing-catalog",
            json=updated_pricing_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert create_product_response.status_code == 200 or create_product_response.status_code == 201, \
            f"Failed to update pricing data, status code: {create_product_response.status_code}"

        # Step 2: Run embedding generation script via POST /api/admin/run-script
        # Send request with script name : setup-rag.ts
        run_script_payload = {"scriptName": "setup-rag.ts"}
        run_script_response = requests.post(
            f"{BASE_URL}/api/admin/run-script",
            json=run_script_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert run_script_response.status_code == 200, \
            f"Running embedding generation script failed, status code: {run_script_response.status_code}"

        run_script_json = run_script_response.json()
        # Expecting success confirmation in response JSON
        assert "success" in run_script_json and run_script_json["success"] is True, \
            f"Embedding generation script did not complete successfully: {run_script_json}"

        # Step 3: Validate TiDB vector DB is updated by querying the pricing catalog
        # We check if the updated product exists by searching /api/pricing-catalog/search
        search_payload = {
            "query": "Test Kitchen Set Deluxe"
        }

        search_response = requests.post(
            f"{BASE_URL}/api/pricing-catalog/search",
            json=search_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert search_response.status_code == 200, \
            f"Search API failed, status code: {search_response.status_code}"

        search_results = search_response.json()
        # Check that the product is found in search results with the updated price
        found = False
        if isinstance(search_results, dict) and "products" in search_results:
            for product in search_results["products"]:
                if product.get("id") == "test-product-001" and abs(product.get("price", 0) - 1999.99) < 0.01:
                    found = True
                    break
        assert found, "Updated pricing data not found in search results after embedding update."

    finally:
        # Cleanup: delete the test product if it was created/exists
        if create_product_response and (create_product_response.status_code == 200 or create_product_response.status_code == 201):
            # Attempt delete via DELETE /api/pricing-catalog/{id}
            try:
                requests.delete(
                    f"{BASE_URL}/api/pricing-catalog/test-product-001",
                    headers=headers,
                    timeout=TIMEOUT
                )
            except Exception:
                pass

test_admin_pricing_data_update_workflow()