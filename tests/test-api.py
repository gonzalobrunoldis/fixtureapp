#!/usr/bin/env python3
"""
API-Football Test Script
Tests various endpoints to understand free tier limitations.

Usage: python tests/test-api.py
"""

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

    # Test 1: Available seasons for Champions League
    print("\n[1] Checking available seasons...")
    data = api_call(f"leagues?id={CHAMPIONS_LEAGUE_ID}")
    if data.get("response"):
        seasons = data["response"][0]["seasons"]
        print(f"Found {len(seasons)} seasons")
        print("Last 3 seasons:")
        for s in seasons[-3:]:
            current = " (CURRENT)" if s["current"] else ""
            print(f"  - {s['year']}: {s['start']} to {s['end']}{current}")

    # Test 2: Standings for season 2024
    print("\n[2] Testing standings (season 2024)...")
    data = api_call(f"standings?league={CHAMPIONS_LEAGUE_ID}&season=2024")
    print_result("Standings 2024", data)

    # Test 3: Standings for season 2025 (should fail)
    print("\n[3] Testing standings (season 2025 - should fail)...")
    data = api_call(f"standings?league={CHAMPIONS_LEAGUE_ID}&season=2025")
    print_result("Standings 2025", data)

    # Test 4: Fixtures without date filter
    print("\n[4] Testing fixtures (season 2024, no date)...")
    data = api_call(f"fixtures?league={CHAMPIONS_LEAGUE_ID}&season=2024")
    print_result("Fixtures 2024 (all)", data)

    # Test 5: Fixtures with date filter
    print("\n[5] Testing fixtures (season 2024, date=2025-01-21)...")
    data = api_call(f"fixtures?league={CHAMPIONS_LEAGUE_ID}&season=2024&date=2025-01-21")
    print_result("Fixtures 2024 by date", data)

    # Test 6: Current season
    print("\n[6] Testing current season...")
    data = api_call(f"leagues?id={CHAMPIONS_LEAGUE_ID}&current=true")
    if data.get("response"):
        seasons = data["response"][0]["seasons"]
        for s in seasons:
            if s["current"]:
                print(f"Current season: {s['year']} ({s['start']} to {s['end']})")

    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60)

if __name__ == "__main__":
    main()
