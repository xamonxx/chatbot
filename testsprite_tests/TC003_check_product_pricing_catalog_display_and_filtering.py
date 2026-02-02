import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}

def test_check_product_pricing_catalog_display_and_filtering():
    # Step 1: Run admin script to update pricing and embeddings via the run-script API
    run_script_payload = {
        "scriptName": "setup-rag.ts"
    }
    run_script_resp = requests.post(
        f"{BASE_URL}/api/admin/run-script",
        json=run_script_payload,
        headers=HEADERS,
        timeout=TIMEOUT,
    )
    assert run_script_resp.status_code == 200, "Run script API call failed"
    run_script_result = run_script_resp.json()
    # Assuming the API returns a success flag or message
    assert run_script_result.get("success") or run_script_result.get("message"), "Run script did not succeed"

    # Step 2: Test RAG search functionality simulating a query for Kitchen Sets pricing
    rag_search_payload = {
        "query": "Show me the price catalog for Kitchen Sets with filter on modern style"
    }
    rag_search_resp = requests.post(
        f"{BASE_URL}/api/rag/search",
        json=rag_search_payload,
        headers=HEADERS,
        timeout=TIMEOUT,
    )
    assert rag_search_resp.status_code == 200, "RAG search request failed"
    rag_search_result = rag_search_resp.json()

    # Validate that the response contains expected pricing data for Kitchen Sets and includes filtering
    assert "pricingTables" in rag_search_result, "Pricing tables missing in RAG search response"
    pricing_tables = rag_search_result["pricingTables"]
    # Must have entries for Kitchen Sets and Wallpanels
    assert any(pt.get("category") == "Kitchen Sets" for pt in pricing_tables), "Kitchen Sets category missing"
    assert any(pt.get("category") == "Wallpanels" for pt in pricing_tables), "Wallpanels category missing"

    # Validate filtering is applied: prices should relate to query about 'modern style'
    for pt in pricing_tables:
        if pt.get("category") == "Kitchen Sets":
            # Example: check filtered attribute
            filtered_items = pt.get("items", [])
            assert all("modern" in item.get("style", "").lower() for item in filtered_items), \
                "Filtering for modern style failed in Kitchen Sets items"

    # Validate presence of pricing fields and recent update info
    for pt in pricing_tables:
        for item in pt.get("items", []):
            assert "price" in item, "Price missing in item"
            assert isinstance(item["price"], (int, float)), "Price is not a numeric value"
            assert "lastUpdated" in item, "lastUpdated field missing in item"


test_check_product_pricing_catalog_display_and_filtering()
