import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_rag_data_ingestion_and_embedding_generation():
    url = f"{BASE_URL}/api/admin/run-script"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "scriptName": "setup-rag"  # Assuming the script name to trigger ingestion and embedding generation
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        # Check that the request was successful
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        resp_json = response.json()
        # Validate presence of success message or status key indicating successful execution
        assert "success" in resp_json or "message" in resp_json, "Response JSON missing success confirmation"
        if "success" in resp_json:
            assert resp_json["success"] is True, f"Script run reported failure: {resp_json}"
        if "message" in resp_json:
            assert "error" not in resp_json["message"].lower(), f"Error reported in message: {resp_json['message']}"
    except requests.exceptions.RequestException as e:
        assert False, f"HTTP request failed: {e}"

test_rag_data_ingestion_and_embedding_generation()