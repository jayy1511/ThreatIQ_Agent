"""
Automated Backend Testing Script

Run this after the server is running to test all endpoints.
"""

import requests
import json
import time
from typing import Dict, List

BASE_URL = "http://localhost:8000"

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_success(msg):
    print(f"{GREEN}✅ {msg}{RESET}")

def print_error(msg):
    print(f"{RED}❌ {msg}{RESET}")

def print_info(msg):
    print(f"{BLUE}ℹ️  {msg}{RESET}")

def print_warning(msg):
    print(f"{YELLOW}⚠️  {msg}{RESET}")

def test_health_check():
    """Test health check endpoint."""
    print("\n" + "="*60)
    print("🏥 Testing Health Check Endpoint")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Health check passed: {data}")
            return True
        else:
            print_error(f"Health check failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Health check failed: {e}")
        return False

def test_public_analysis(message: str, user_guess: str = None) -> Dict:
    """Test public analysis endpoint."""
    
    payload = {
        "message": message,
        "user_id": "test_user_" + str(int(time.time())),
        "user_guess": user_guess
    }
    
    try:
        print_info(f"Testing message: {message[:50]}...")
        
        response = requests.post(
            f"{BASE_URL}/api/analyze-public",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            if "classification" in data and "coach_response" in data:
                label = data["classification"]["label"]
                confidence = data["classification"]["confidence"]
                was_correct = data.get("was_correct")
                
                print_success(f"Analysis complete!")
                print(f"   Verdict: {label} (confidence: {confidence:.2f})")
                print(f"   User was correct: {was_correct}")
                print(f"   Tips provided: {len(data['coach_response'].get('tips', []))}")
                print(f"   Similar examples: {len(data['coach_response'].get('similar_examples', []))}")
                
                return data
            else:
                print_error("Invalid response structure")
                return None
        else:
            print_error(f"Request failed with status {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return None
            
    except Exception as e:
        print_error(f"Analysis failed: {e}")
        return None

def run_comprehensive_tests():
    """Run comprehensive test suite."""
    
    print("\n" + "="*60)
    print("🧪 ThreatIQ Backend - Comprehensive Testing")
    print("="*60)
    
    # Test cases
    test_cases = [
        {
            "name": "Banking Phishing",
            "message": "URGENT: Your bank account has been suspended. Click here to verify: http://fake-bank.com/verify",
            "user_guess": "phishing",
            "expected": "phishing"
        },
        {
            "name": "Shipping Scam",
            "message": "Your package delivery failed. Update your address: http://fake-shipping.com",
            "user_guess": "phishing",
            "expected": "phishing"
        },
        {
            "name": "Prize Scam",
            "message": "Congratulations! You've won $1,000,000. Send your details to claim your prize now!",
            "user_guess": "phishing",
            "expected": "phishing"
        },
        {
            "name": "Account Alert Phishing",
            "message": "Security Alert: Suspicious login attempt detected. Change your password at: http://phishing-site.com",
            "user_guess": "phishing",
            "expected": "phishing"
        },
        {
            "name": "Legitimate Email",
            "message": "Your Amazon order #12345 has been shipped and will arrive tomorrow.",
            "user_guess": "safe",
            "expected": "safe"
        },
        {
            "name": "Legitimate Bank Email",
            "message": "Dear customer, your monthly bank statement is ready for review in your online banking portal.",
            "user_guess": "safe",
            "expected": "safe"
        }
    ]
    
    results = {
        "total": len(test_cases),
        "passed": 0,
        "failed": 0,
        "errors": 0
    }
    
    # First test health check
    if not test_health_check():
        print_error("Health check failed. Make sure the server is running!")
        return
    
    print("\n" + "="*60)
    print("📧 Testing Message Analysis")
    print("="*60)
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n[Test {i}/{len(test_cases)}] {test['name']}")
        print("-" * 60)
        
        result = test_public_analysis(test["message"], test.get("user_guess"))
        
        if result is None:
            results["errors"] += 1
        else:
            actual_label = result["classification"]["label"]
            expected_label = test["expected"]
            
            if actual_label == expected_label:
                results["passed"] += 1
                print_success(f"Test passed! Classified as: {actual_label}")
            else:
                results["failed"] += 1
                print_warning(f"Expected: {expected_label}, Got: {actual_label}")
        
        # Delay to avoid rate limiting
        if i < len(test_cases):
            time.sleep(2)
    
    # Print summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    print(f"Total Tests:   {results['total']}")
    print(f"{GREEN}Passed:        {results['passed']}{RESET}")
    print(f"{YELLOW}Failed:        {results['failed']}{RESET}")
    print(f"{RED}Errors:        {results['errors']}{RESET}")
    
    accuracy = (results['passed'] / results['total']) * 100 if results['total'] > 0 else 0
    print(f"\nAccuracy:      {accuracy:.1f}%")
    
    if results['passed'] == results['total']:
        print_success("\n🎉 All tests passed!")
    elif results['errors'] == 0:
        print_warning(f"\n⚠️  {results['failed']} tests had unexpected results")
    else:
        print_error("\n❌ Some tests encountered errors")
    
    print("="*60)

if __name__ == "__main__":
    print("🚀 Starting automated backend tests...")
    print("⚠️  Make sure the backend server is running on http://localhost:8000")
    
    input("\nPress Enter to continue...")
    
    run_comprehensive_tests()
    
    print("\n✨ Testing complete!")
