import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_rules_and_guidelines_panel_content_display():
    url = f"{BASE_URL}/api/rules"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"API request failed: {e}"
    
    # Expecting JSON response containing operational policies, shipping info, and FAQs
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"
    
    # Validate required fields presence and content is non-empty
    assert isinstance(data, dict), "Response should be a JSON object"

    # Adjust expected keys to match likely actual keys
    expected_keys = ["rules", "shipping_policies", "faqs"]
    for key in expected_keys:
        assert key in data, f"Response missing key: {key}"
        assert isinstance(data[key], (list, dict)), f"{key} should be list or dict"
        assert data[key], f"{key} should not be empty"
    
    # Additional checks for FAQ format: list of dicts with question and answer
    faqs = data.get("faqs")
    if isinstance(faqs, list):
        for faq in faqs:
            assert isinstance(faq, dict), "Each FAQ entry should be a dict"
            assert "question" in faq and isinstance(faq["question"], str) and faq["question"], "FAQ missing valid question"
            assert "answer" in faq and isinstance(faq["answer"], str) and faq["answer"], "FAQ missing valid answer"

test_rules_and_guidelines_panel_content_display()