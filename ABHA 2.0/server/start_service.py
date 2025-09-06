#!/usr/bin/env python3
"""Startup script for enhanced pneumonia detection inference service.

This script:
1. Checks for available cached models
2. Starts the enhanced inference service with ensemble capabilities
3. Provides model management options
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def check_models():
    """Check for available trained models."""
    model_dir = Path(__file__).parent
    keras_files = list(model_dir.glob("*.keras"))
    
    print("🔍 Checking for trained models...")
    print("-" * 40)
    
    if not keras_files:
        print("❌ No trained models found!")
        print("   Please train a model first using: python train_model.py")
        return False
    
    for model_file in keras_files:
        size_mb = model_file.stat().st_size / (1024 * 1024)
        print(f"✅ {model_file.name} ({size_mb:.1f} MB)")
        
        # Check for metrics
        metrics_file = model_file.with_name(model_file.stem + "_metrics.json")
        if metrics_file.exists():
            print(f"   📊 Metrics available")
        else:
            print(f"   ⚠️  No metrics file")
    
    print(f"\nFound {len(keras_files)} trained models")
    return True

def start_enhanced_service():
    """Start the enhanced inference service."""
    print("\n🚀 Starting enhanced inference service...")
    print("-" * 40)
    
    try:
        # Check if enhanced service exists
        enhanced_service = Path(__file__).parent / "enhanced_inference_service.py"
        
        if enhanced_service.exists():
            print("Starting enhanced ensemble service...")
            subprocess.run([
                sys.executable, "-m", "uvicorn", 
                "enhanced_inference_service:app",
                "--host", "0.0.0.0",
                "--port", "8001",
                "--reload"
            ])
        else:
            print("Enhanced service not found, falling back to basic service...")
            subprocess.run([
                sys.executable, "-m", "uvicorn", 
                "inference_service:app",
                "--host", "0.0.0.0", 
                "--port", "8001",
                "--reload"
            ])
            
    except KeyboardInterrupt:
        print("\n👋 Service stopped by user")
    except Exception as e:
        print(f"❌ Error starting service: {e}")

def run_model_manager():
    """Run the model manager for interactive model management."""
    print("\n🔧 Starting model manager...")
    print("-" * 40)
    
    try:
        subprocess.run([sys.executable, "model_manager.py"])
    except Exception as e:
        print(f"❌ Error running model manager: {e}")

def main():
    print("🤖 Pneumonia Detection Service Launcher")
    print("=" * 50)
    
    # Check for models
    if not check_models():
        print("\n❌ Cannot start service without trained models")
        return
    
    while True:
        print("\n" + "="*50)
        print("SELECT AN OPTION:")
        print("1. Start Enhanced Inference Service")
        print("2. Run Model Manager (switch models, evaluate)")
        print("3. Check Model Status")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            start_enhanced_service()
            break
            
        elif choice == '2':
            run_model_manager()
            
        elif choice == '3':
            check_models()
            
        elif choice == '4':
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice")

if __name__ == "__main__":
    main()
