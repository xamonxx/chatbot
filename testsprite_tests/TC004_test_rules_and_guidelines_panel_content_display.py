import requests

BASE_URL = "http://localhost:3000"
ADMIN_RUN_SCRIPT_ENDPOINT = "/api/admin/run-script"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30


def test_rules_and_guidelines_panel_content_display():
    """
    Test the Rules & Guidelines Panel API by running the admin script to update embedding data,
    then query the RAG search functionality via the run script API to verify operational rules,
    shipping policies, and FAQs content retrieval.
    """
    try:
        # Step 1: Run the admin script to update embeddings and data ingestion
        run_script_payload = {
            "scriptName": "setup-rag"
        }
        run_script_resp = requests.post(
            f"{BASE_URL}{ADMIN_RUN_SCRIPT_ENDPOINT}",
            json=run_script_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert run_script_resp.status_code == 200, f"Admin run-script failed: {run_script_resp.text}"
        run_script_data = run_script_resp.json()
        assert run_script_data.get("success") is True, "Run script did not succeed"

        # Step 2: Query the RAG search functionality for rules & guidelines content
        # Assuming run-script API accepts a query param for RAG retrieval after setup
        rag_query_payload = {
            "query": "What are the operational rules, shipping policies, and FAQs?"
        }
        rag_search_resp = requests.post(
            f"{BASE_URL}{ADMIN_RUN_SCRIPT_ENDPOINT}",
            json=rag_query_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert rag_search_resp.status_code == 200, f"RAG search failed: {rag_search_resp.text}"
        rag_search_data = rag_search_resp.json()

        # Validate that expected content keys exist in the response
        # Since this is a RAG response, expect keys or text indicating operational rules, shipping policies, FAQs
        content = rag_search_data.get("data") or rag_search_data.get("result") or rag_search_data.get("content")
        assert content, "No content returned from RAG search"
        content_lower = str(content).lower()

        assert "operational rule" in content_lower or "policy" in content_lower or "faq" in content_lower, (
            "Response does not contain expected Rules & Guidelines content"
        )

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"


test_rules_and_guidelines_panel_content_display()