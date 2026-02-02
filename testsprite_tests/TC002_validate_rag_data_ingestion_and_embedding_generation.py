import requests
import time

BASE_URL = "http://localhost:3000"
RUN_SCRIPT_ENDPOINT = f"{BASE_URL}/api/admin/run-script"
RAG_SEARCH_ENDPOINT = f"{BASE_URL}/api/rag/search"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_validate_rag_data_ingestion_and_embedding_generation():
    # Step 1: Run the admin RAG setup script to ingest data and generate embeddings
    try:
        run_script_resp = requests.post(RUN_SCRIPT_ENDPOINT, json={"script": "setup-rag.ts"}, headers=HEADERS, timeout=TIMEOUT)
        assert run_script_resp.status_code == 200, f"Run script failed with status {run_script_resp.status_code}"
        resp_json = run_script_resp.json()
        assert "success" in resp_json and resp_json["success"] is True, "Run script response indicates failure"
    except Exception as e:
        raise AssertionError(f"Failed to run the data ingestion script: {e}")

    # Step 2: Wait briefly for DB update and embedding generation (adjust if needed)
    time.sleep(5)

    # Step 3: Test RAG search with a sample query that should return data from TiDB vector database
    sample_query = {
        "query": "What is the price and material specification for kitchen sets?"
    }
    try:
        search_resp = requests.post(RAG_SEARCH_ENDPOINT, json=sample_query, headers=HEADERS, timeout=TIMEOUT)
        assert search_resp.status_code == 200, f"RAG search failed with status {search_resp.status_code}"
        search_json = search_resp.json()
        # Validate response contains embeddings and relevant data
        assert "results" in search_json, "RAG search response missing 'results'"
        results = search_json["results"]
        assert isinstance(results, list), "'results' should be a list"
        assert len(results) > 0, "No results returned; embeddings likely not generated or stored correctly"

        # Each result should have embedding/vector data and relevant metadata
        for item in results:
            assert "embedding" in item or "vector" in item, "Result missing embedding/vector data"
            assert "text" in item or "content" in item, "Result missing text/content data"
    except Exception as e:
        raise AssertionError(f"RAG search query failed or returned invalid data: {e}")


test_validate_rag_data_ingestion_and_embedding_generation()
