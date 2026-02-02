import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
CHAT_ENDPOINT = f"{BASE_URL}/api/chat"

def test_ai_chat_assistant_data_retrieval_accuracy():
    headers = {
        "Content-Type": "application/json"
    }
    # Example question about interior design and pricing to validate RAG data retrieval accuracy
    payload = {
        "message": "Can you provide an accurate cost estimate and material suggestion for a modern kitchen set renovation?"
    }

    try:
        response = requests.post(CHAT_ENDPOINT, json=payload, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
        data = response.json()

        # Validate response structure
        assert isinstance(data, dict), "Response is not a JSON object"
        assert "answer" in data, "Response JSON has no 'answer' field"
        answer = data["answer"]
        assert isinstance(answer, str) and len(answer.strip()) > 0, "Answer is empty or not a string"

        # Basic heuristic checks to ensure response references data-backed content
        # For example, it should mention pricing or materials relevant to kitchen sets
        lower_answer = answer.lower()
        assert any(keyword in lower_answer for keyword in ["price", "cost", "budget", "material", "kitchen", "renovation", "estimate"]), \
            "Answer does not reference relevant pricing or material information, possible hallucination"

    except requests.exceptions.RequestException as e:
        assert False, f"HTTP request failed: {e}"

test_ai_chat_assistant_data_retrieval_accuracy()