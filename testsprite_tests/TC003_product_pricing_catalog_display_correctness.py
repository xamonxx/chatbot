import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_product_pricing_catalog_display_correctness():
    try:
        # 1. GET /api/pricing-catalog to fetch full catalog
        response = requests.get(f"{BASE_URL}/api/pricing-catalog", timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
        catalog_data = response.json()
        assert isinstance(catalog_data, dict), "Catalog response should be a JSON object"
        
        # Check presence of Kitchen Sets and Wallpanels keys in catalog
        assert "kitchenSets" in catalog_data or "KitchenSets" in catalog_data or "kitchen_sets" in catalog_data, \
            "Catalog should include Kitchen Sets section"
        assert "wallpanels" in catalog_data or "Wallpanels" in catalog_data or "wall_panels" in catalog_data, \
            "Catalog should include Wallpanels section"

        # Validate Kitchen Sets entries if present
        kitchen_key = None
        for key in ["kitchenSets", "KitchenSets", "kitchen_sets"]:
            if key in catalog_data:
                kitchen_key = key
                break
        if kitchen_key:
            kitchen_sets = catalog_data[kitchen_key]
            assert isinstance(kitchen_sets, list), "Kitchen Sets data should be a list"
            assert len(kitchen_sets) > 0, "Kitchen Sets list should not be empty"
            for item in kitchen_sets:
                assert isinstance(item, dict), "Each Kitchen Set should be a dict"
                # Check important fields typical for pricing catalog entries
                assert "name" in item and isinstance(item["name"], str) and item["name"], "Each Kitchen Set should have a non-empty name"
                assert "price" in item and (isinstance(item["price"], float) or isinstance(item["price"], int)), "Each Kitchen Set should have a numeric price"
                assert "specifications" in item, "Each Kitchen Set should have specifications"
        
        # Validate Wallpanels entries if present
        wallpanels_key = None
        for key in ["wallpanels", "Wallpanels", "wall_panels"]:
            if key in catalog_data:
                wallpanels_key = key
                break
        if wallpanels_key:
            wallpanels = catalog_data[wallpanels_key]
            assert isinstance(wallpanels, list), "Wallpanels data should be a list"
            assert len(wallpanels) > 0, "Wallpanels list should not be empty"
            for item in wallpanels:
                assert isinstance(item, dict), "Each Wallpanel should be a dict"
                # Check important fields
                assert "name" in item and isinstance(item["name"], str) and item["name"], "Each Wallpanel should have a non-empty name"
                assert "price" in item and (isinstance(item["price"], float) or isinstance(item["price"], int)), "Each Wallpanel should have a numeric price"
                assert "specifications" in item, "Each Wallpanel should have specifications"

        # 2. Test search functionality by POST /api/pricing-catalog/search with a search term for Kitchen Sets
        search_payload = {
            "query": "kitchen",
            "filters": {}
        }
        search_resp = requests.post(f"{BASE_URL}/api/pricing-catalog/search", json=search_payload, timeout=TIMEOUT)
        assert search_resp.status_code == 200, f"Search POST expected 200 OK, got {search_resp.status_code}"
        search_results = search_resp.json()
        assert isinstance(search_results, dict), "Search response should be a JSON object"

        # Validate that search results contain matches relevant to "kitchen"
        # Looking for at least one Kitchen Set that matches
        kitchen_results = None
        for key in ["results", "items", "matches"]:
            if key in search_results:
                kitchen_results = search_results[key]
                break
        if kitchen_results is None:
            # fallback: if no standard key, try the whole response as list
            kitchen_results = search_results if isinstance(search_results, list) else []

        assert isinstance(kitchen_results, list), "Search results should be a list"
        assert len(kitchen_results) > 0, "Search results should not be empty for 'kitchen' query"

        # Check if returned items have expected fields and mention kitchen sets or similar
        found_kitchen = False
        for item in kitchen_results:
            assert isinstance(item, dict), "Each search result item should be a dict"
            assert "name" in item and isinstance(item["name"], str), "Search result item should have a name"
            assert "price" in item and (isinstance(item["price"], float) or isinstance(item["price"], int)), "Search result item should have a price"
            if "kitchen" in item["name"].lower():
                found_kitchen = True

        assert found_kitchen, "Search results should include items related to 'kitchen'"

        # 3. Test filtered search: example filter for Wallpanels price range (if API supports filters)
        filter_payload = {
            "query": "",
            "filters": {
                "category": "Wallpanels",
                "price_min": 100,
                "price_max": 1000
            }
        }
        filter_resp = requests.post(f"{BASE_URL}/api/pricing-catalog/search", json=filter_payload, timeout=TIMEOUT)
        assert filter_resp.status_code == 200, f"Filtered search expected 200 OK, got {filter_resp.status_code}"
        filter_results = filter_resp.json()
        assert isinstance(filter_results, dict), "Filtered search response should be a JSON object"
        
        # Extract filtered items list same logic as above
        filtered_items = None
        for key in ["results", "items", "matches"]:
            if key in filter_results:
                filtered_items = filter_results[key]
                break
        if filtered_items is None:
            filtered_items = filter_results if isinstance(filter_results, list) else []

        assert isinstance(filtered_items, list), "Filtered search results should be a list"
        # If results exist, verify every item matches filter criteria
        for item in filtered_items:
            assert isinstance(item, dict), "Filtered search item should be a dict"
            # Name must contain Wallpanel or similar
            assert "name" in item and isinstance(item["name"], str), "Filtered item should have a name"
            assert "price" in item and (isinstance(item["price"], float) or isinstance(item["price"], int)), "Filtered item should have a price"
            price = item["price"]
            assert 100 <= price <= 1000, f"Filtered item price {price} out of specified range 100-1000"
            # Category might be present to verify
            if "category" in item:
                assert "wallpanel" in item["category"].lower(), "Filtered item category should be Wallpanel"

    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"

test_product_pricing_catalog_display_correctness()