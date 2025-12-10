"""
Test Runner Script for AI Desk
Runs all comprehensive tests and generates a report
"""

import subprocess
import sys
import os
from datetime import datetime


def run_tests():
    """Run the comprehensive test suite"""
    
    print("=" * 80)
    print("AI DESK COMPREHENSIVE TEST SUITE")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Ensure we're in the right directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Test categories
    test_categories = [
        ("All Tests", "test_comprehensive.py"),
        ("Unit Tests Only", "test_comprehensive.py::TestMultiSourceFetching"),
        ("Integration Tests", "test_comprehensive.py::TestIntegration"),
    ]
    
    print("Available test suites:")
    for i, (name, _) in enumerate(test_categories, 1):
        print(f"  {i}. {name}")
    print()
    
    # Run all tests by default
    test_file = "test_comprehensive.py"
    
    print(f"Running: {test_file}")
    print("-" * 80)
    
    # Run pytest with verbose output
    cmd = [
        sys.executable,
        "-m",
        "pytest",
        test_file,
        "-v",
        "--tb=short",
        "--color=yes",
        "-s",  # Show print statements
    ]
    
    try:
        result = subprocess.run(cmd, check=False)
        print()
        print("-" * 80)
        
        if result.returncode == 0:
            print("[PASS] ALL TESTS PASSED")
        else:
            print("[FAIL] SOME TESTS FAILED")
            print(f"Exit code: {result.returncode}")
        
        print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
        
        return result.returncode
        
    except Exception as e:
        print(f"Error running tests: {e}")
        return 1


if __name__ == "__main__":
    exit_code = run_tests()
    sys.exit(exit_code)
