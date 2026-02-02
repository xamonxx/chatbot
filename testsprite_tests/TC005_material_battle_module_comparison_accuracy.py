import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_material_battle_module_comparison_accuracy():
    url = f"{BASE_URL}/api/chat"
    headers = {
        "Content-Type": "application/json"
    }
    # Prepare a payload to request a material battle comparison
    # The prompt should specifically ask to compare different interior materials on key technical aspects
    payload = {
        "messages": [
            {
                "role": "user",
                "content": (
                    "Please compare the following interior materials on their key technical aspects such as durability, "
                    "cost-efficiency, maintenance, and aesthetic appeal: "
                    "1. Solid Wood vs Veneer\n"
                    "2. Ceramic Tiles vs Natural Stone\n"
                    "Provide a clear and data-backed comparison reflecting true differences "
                    "to help user decision-making."
                )
            }
        ]
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    json_data = response.json()
    # The expected response should contain a clear comparison mentioning the technical aspects distinctly for each pair.
    # Validate presence of key technical terms and clear comparative wording
    assert isinstance(json_data, dict), "Response is not a JSON object"
    assert "choices" in json_data or "response" in json_data or "message" in json_data, "Response missing expected keys"

    # Extract AI reply text
    # Possible keys depending on implementation: 'choices'[0]['message']['content'], 'response', or 'message'
    content = None
    if "choices" in json_data:
        choices = json_data["choices"]
        if len(choices) > 0:
            content = choices[0].get("message", {}).get("content", None)
    if content is None:
        content = json_data.get("response") or json_data.get("message")

    assert content and isinstance(content, str), "Response content missing or not string"

    # Adjusted keywords to better match expected response variations - corrected to use spaced words
    required_keywords = [
        "durability",
        "cost",
        "maintenance",
        "aesthetic",
        "solid wood",
        "veneer",
        "ceramic tiles",
        "natural stone",
        "comparison",
        "difference"
    ]
    content_lower = content.lower()
    missing_keywords = [kw for kw in required_keywords if kw not in content_lower]
    assert not missing_keywords, f"Response missing expected technical comparison details for: {missing_keywords}"

    # Additional heuristic checks to ensure comparative language exists
    comparative_terms = ["more durable", "less expensive", "requires more maintenance", "better aesthetic", "vs", "compared to"]
    assert any(term in content.lower() for term in comparative_terms), "Response does not contain clear comparative language"

test_material_battle_module_comparison_accuracy()
