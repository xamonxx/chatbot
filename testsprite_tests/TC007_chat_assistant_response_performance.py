import requests
import time

BASE_URL = "http://localhost:3000"
CHAT_ENDPOINT = "/api/chat"
TIMEOUT = 30
MAX_ACCEPTABLE_RESPONSE_TIME_SECONDS = 2.0  # Define acceptable threshold for response time


def test_chat_assistant_response_performance():
    url = BASE_URL + CHAT_ENDPOINT
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "message": "Hello, can you help me estimate the budget for a small kitchen renovation?"
    }

    try:
        start_time = time.perf_counter()
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        elapsed_time = time.perf_counter() - start_time
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Validate response status code
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    # Basic validation that response contains expected fields (at least a text reply)
    try:
        resp_json = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(resp_json, dict), "Response JSON should be a dictionary"
    assert "reply" in resp_json or "message" in resp_json, "Response JSON missing expected reply field"

    # Assert response time is within acceptable threshold
    assert elapsed_time <= MAX_ACCEPTABLE_RESPONSE_TIME_SECONDS, (
        f"Chat assistant response time {elapsed_time:.2f}s exceeded threshold of "
        f"{MAX_ACCEPTABLE_RESPONSE_TIME_SECONDS:.2f}s"
    )


test_chat_assistant_response_performance()