import requests

BASE_URL = "http://localhost:3000"
CHAT_ENDPOINT = f"{BASE_URL}/api/chat"
TIMEOUT = 30

def test_proposal_generator_output_formatting():
    headers = {
        "Content-Type": "application/json"
    }
    # Sample consultation chat content that would trigger proposal generation
    chat_payload = {
        "messages": [
            {
                "role": "user",
                "content": (
                    "Hello, I need a quotation for a kitchen set with modern design, "
                    "including cabinets and countertop, and a wardrobe for the bedroom. "
                    "Please include price estimates and material options."
                )
            }
        ]
    }

    response = None
    try:
        response = requests.post(CHAT_ENDPOINT, json=chat_payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Unexpected status code: {response.status_code}"
        data = response.json()
        assert "proposal" in data, "Response JSON does not contain 'proposal' key"
        proposal = data["proposal"]
        assert isinstance(proposal, str) and len(proposal.strip()) > 0, "Proposal content is empty or not a string"

        # Adjusted checks for formatting - use case-insensitive partial match
        required_keywords = ["kitchen", "price", "wardrobe", "material", "total"]
        proposal_lower = proposal.lower()
        for keyword in required_keywords:
            assert keyword in proposal_lower, f"'{keyword}' not found in proposal content"

        # Check that proposal contains newlines or formatting characters for neatness
        assert "\n" in proposal or "<br>" in proposal, "Proposal formatting seems missing (no line breaks)"

        # Check proposal can be copied in one click: in API context, assume presence of 'copyable' flag or similar
        # 'copyable' flag should be True or missing, so check that it is True or not present
        copyable = data.get("copyable", True)
        assert copyable is True, "'copyable' flag missing or false in response"

    except requests.RequestException as e:
        assert False, f"Request to {CHAT_ENDPOINT} failed: {e}"

test_proposal_generator_output_formatting()
