import urllib.request
import json

API_KEY = "23d8de870ce857b71cca01de36de26aa"
BASE_URL = "https://v3.football.api-sports.io"
CHAMPIONS_LEAGUE_ID = 2


def api_call(endpoint):
    """Make an API call and return the response."""
    url = f"{BASE_URL}/{endpoint}"
    headers = {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
    }

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        return {"error": str(e)}

def print_result(title, data):
    """Print formatted result."""
    print(f"\n{'='*60}")
    print(f"TEST: {title}")
    print('='*60)

    if "errors" in data and data["errors"]:
        print(f"ERRORS: {data['errors']}")

    print(f"Results: {data.get('results', 'N/A')}")

    if data.get("response"):
        # Show first item preview
        first = data["response"][0] if isinstance(data["response"], list) else data["response"]
        print(f"Preview: {json.dumps(first, indent=2)[:500]}...")

def main():
    print("API-Football Free Tier Test")
    print("="*60)

    # Test 3: Standings for season 2025 (should fail)
    print("\n[3] Testing standings (season 2025 - should fail)...")
    data = api_call(f"standings?league={CHAMPIONS_LEAGUE_ID}&season=2025")
    print_result("Standings 2025", data)

    # Test 2: Standings for season 2024
    print("\n[2] Testing standings (season 2024)...")
    data = api_call(f"standings?league={CHAMPIONS_LEAGUE_ID}&season=2024")
    print_result("Standings 2024", data)

if __name__ == "__main__":
    main()