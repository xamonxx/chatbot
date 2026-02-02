import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json",
}

def test_search_and_filter_functionality_in_pricing_catalog():
    try:
        # Test Kitchen Sets search
        kitchen_search_payload = {
            "category": "Kitchen Sets",
            "searchTerm": "modern",
            "filters": {
                "priceRange": {"min": 1000, "max": 5000},
                "material": ["wood", "metal"]
            }
        }
        kitchen_response = requests.post(
            f"{BASE_URL}/api/pricing-catalog/search",
            json=kitchen_search_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert kitchen_response.status_code == 200, f"Expected 200 but got {kitchen_response.status_code}"
        kitchen_data = kitchen_response.json()
        assert "data" in kitchen_data and isinstance(kitchen_data["data"], list), "Response for Kitchen Sets should have a data list"
        for item in kitchen_data["data"]:
            assert "category" in item and item["category"] == "Kitchen Sets"
            assert "price" in item and 1000 <= item["price"] <= 5000
            assert "name" in item and kitchen_search_payload["searchTerm"].lower() in item["name"].lower()

        # Test Wallpanels filter
        wallpanel_filter_payload = {
            "category": "Wallpanels",
            "filters": {
                "color": ["white", "gray"],
                "thickness": {"min": 2, "max": 10}
            }
        }
        wallpanel_response = requests.post(
            f"{BASE_URL}/api/pricing-catalog/search",
            json=wallpanel_filter_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert wallpanel_response.status_code == 200, f"Expected 200 but got {wallpanel_response.status_code}"
        wallpanel_data = wallpanel_response.json()
        assert "data" in wallpanel_data and isinstance(wallpanel_data["data"], list), "Response for Wallpanels should have a data list"
        for item in wallpanel_data["data"]:
            assert "category" in item and item["category"] == "Wallpanels"
            if "color" in item:
                assert item["color"] in ["white", "gray"]
            if "thickness" in item:
                assert 2 <= item["thickness"] <= 10

        # Test Wardrobes with search term and availability filter
        wardrobe_search_filter_payload = {
            "category": "Wardrobes",
            "searchTerm": "classic",
            "filters": {
                "availability": "in-stock"
            }
        }
        wardrobe_response = requests.post(
            f"{BASE_URL}/api/pricing-catalog/search",
            json=wardrobe_search_filter_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert wardrobe_response.status_code == 200, f"Expected 200 but got {wardrobe_response.status_code}"
        wardrobe_data = wardrobe_response.json()
        assert "data" in wardrobe_data and isinstance(wardrobe_data["data"], list), "Response for Wardrobes should have a data list"
        for item in wardrobe_data["data"]:
            assert "category" in item and item["category"] == "Wardrobes"
            if "availability" in item:
                assert item["availability"] == "in-stock"
            assert "name" in item and wardrobe_search_filter_payload["searchTerm"].lower() in item["name"].lower()
    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"
    except AssertionError as ae:
        raise ae

test_search_and_filter_functionality_in_pricing_catalog()