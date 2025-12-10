"""
Quick Test Summary Script
Runs key tests from each category to verify the system
"""

import subprocess
import sys


def run_test_category(name, test_path):
    """Run a specific test category and return result"""
    print(f"\n{'='*80}")
    print(f"Testing: {name}")
    print('='*80)
    
    cmd = [
        sys.executable,
        "-m",
        "pytest",
        test_path,
        "-v",
        "--tb=line",
        "-q"
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    # Parse output for pass/fail count
    output = result.stdout + result.stderr
    
    if result.returncode == 0:
        print(f"[PASS] {name}")
        return True
    else:
        print(f"[FAIL] {name}")
        print(output[-500:] if len(output) > 500 else output)  # Last 500 chars
        return False


def main():
    """Run all test categories"""
    print("\n" + "="*80)
    print("AI DESK - QUICK TEST SUMMARY")
    print("="*80)
    
    test_categories = [
        ("1. Multi-Source Fetching", "test_comprehensive.py::TestMultiSourceFetching::test_google_news_fetch_structure"),
        ("2. Agent Workflow", "test_comprehensive.py::TestAgentWorkflow::test_writer_agent_output_format"),
        ("3. Duplicate Detection", "test_comprehensive.py::TestDuplicateDetection"),
        ("4. Content Classification", "test_comprehensive.py::TestContentClassification"),
        ("5. Content Generation", "test_comprehensive.py::TestContentGeneration"),
        ("6. UI Rendering", "test_comprehensive.py::TestUIRendering"),
        ("7. Rate Limit Handling", "test_comprehensive.py::TestRateLimitHandling::test_concurrent_requests_handling"),
        ("8. Error Handling", "test_comprehensive.py::TestErrorHandling"),
        ("9. Media Validation", "test_comprehensive.py::TestMediaValidation"),
        ("10. Search & Filtering", "test_comprehensive.py::TestSearchFiltering::test_chronological_sorting"),
    ]
    
    results = []
    
    for name, test_path in test_categories:
        passed = run_test_category(name, test_path)
        results.append((name, passed))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    for name, passed in results:
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status} {name}")
    
    print("\n" + "-"*80)
    print(f"Results: {passed_count}/{total_count} test categories passed")
    print(f"Success Rate: {(passed_count/total_count)*100:.1f}%")
    print("="*80 + "\n")
    
    # Return 0 if all passed, 1 otherwise
    return 0 if passed_count == total_count else 1


if __name__ == "__main__":
    sys.exit(main())
