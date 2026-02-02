import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_proposal_copy_functionality():
    chat_url = f"{BASE_URL}/api/chat"
    headers = {
        "Content-Type": "application/json"
    }

    # Step 1: Send a chat request to generate a proposal quotation
    chat_payload = {
        "messages": [
            {
                "role": "user",
                "content": (
                    "Please provide a detailed quotation for a kitchen set and wallpanel "
                    "selection including price estimation and design suggestions."
                )
            }
        ],
        "copy_proposal": True  # assuming this triggers generation + copy of proposal in the payload
    }

    try:
        chat_response = requests.post(chat_url, json=chat_payload, headers=headers, timeout=TIMEOUT)
        assert chat_response.status_code == 200, f"Expected 200 OK, got {chat_response.status_code}"
        data = chat_response.json()

        # Validate response structure contains a proposal field or copy data
        assert "proposal" in data, "Response JSON missing 'proposal' field"
        proposal_text = data["proposal"]
        assert isinstance(proposal_text, str) and len(proposal_text) > 0, "Proposal text is invalid or empty"

        # Simulate the "one-click copy" by checking the presence or retrievable copy data
        assert "copySuccess" not in data or data.get("copySuccess") is True, "Copy functionality indicator missing or false"

    except requests.exceptions.RequestException as e:
        assert False, f"Request to /api/chat failed: {e}"

test_proposal_copy_functionality()