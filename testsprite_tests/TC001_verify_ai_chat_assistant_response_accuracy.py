import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json"
}

def test_verify_ai_chat_assistant_response_accuracy():
    # Step 1: Run Admin Script to ensure data ingestion and RAG embeddings are up to date
    run_script_endpoint = f"{BASE_URL}/api/admin/run-script"
    script_name = "setup-rag.ts"  # Assuming this is the script that ingests and generates embeddings
    
    # Execute the admin run-script API
    try:
        run_script_resp = requests.post(
            run_script_endpoint,
            json={"scriptName": script_name},
            headers=HEADERS,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Admin run-script API request failed: {str(e)}"
    
    assert run_script_resp.status_code == 200, f"Admin run-script failed with status {run_script_resp.status_code}"
    run_script_data = run_script_resp.json()
    assert run_script_data.get("success", False) is True, f"Admin run-script response indicates failure: {run_script_data}"

    # Step 2: Test AI Chat Assistant endpoint (simulate a chat query to get a data-backed response)
    # Since the detailed chat API endpoint isn't explicitly given, infer typical REST pattern:
    # POST /api/chat or similar with query text payload - We try /api/chat-assistant or /api/chat (fallback to /api/chat)
    chat_endpoint_candidates = [
        f"{BASE_URL}/api/chat-assistant",
        f"{BASE_URL}/api/chat"
    ]
    chat_endpoint = None
    for ep in chat_endpoint_candidates:
        try:
            resp = requests.options(ep, timeout=5)
            if resp.status_code < 400:
                chat_endpoint = ep
                break
        except requests.RequestException:
            continue
    if chat_endpoint is None:
        assert False, "Could not determine AI chat assistant endpoint."

    # Prepare a natural language query expected to trigger RAG retrieval from TiDB vector DB
    query_text = "What is the estimated price range for a custom kitchen set with high-quality wood?"

    payload = {
        "query": query_text,
        "sessionId": str(uuid.uuid4())  # Use session id if needed to identify user
    }

    try:
        chat_resp = requests.post(chat_endpoint, json=payload, headers=HEADERS, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"AI Chat Assistant request failed: {str(e)}"
    
    assert chat_resp.status_code == 200, f"AI Chat Assistant responded with status {chat_resp.status_code}"
    
    try:
        chat_data = chat_resp.json()
    except Exception as e:
        assert False, f"AI Chat Assistant response is not valid JSON: {str(e)}"

    # Validate response contains answer and references data-backed details (heuristic validations)
    answer = chat_data.get("answer") or chat_data.get("response") or chat_data.get("text")
    assert answer and isinstance(answer, str) and len(answer) > 10, "AI Chat Assistant response text is missing or too short."

    # Check for presence of key phrases indicating data-backed response (heuristic)
    required_phrases = [
        "price",
        "kitchen set",
        "wood",
        "estimated",
        "range"
    ]
    answer_lower = answer.lower()
    matched_phrases = [p for p in required_phrases if p in answer_lower]
    assert len(matched_phrases) >= 3, f"AI response seems lacking expected data references, matched phrases: {matched_phrases}"

test_verify_ai_chat_assistant_response_accuracy()