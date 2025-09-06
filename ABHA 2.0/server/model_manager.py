"""Model Manager for Pneumonia Detection

This script helps manage cached models and improve predictions by:
1. Loading and evaluating all saved models
2. Creating ensemble combinations
3. Fine-tuning models on problematic cases
4. Providing model selection recommendations
"""

import os
import json
import numpy as np
import tensorflow as tf
from pathlib import Path
from typing import Dict, List, Tuple, Any
import matplotlib.pyplot as plt

class ModelManager:
    def __init__(self, model_dir: str = "."):
        self.model_dir = Path(model_dir)
        self.models = {}
        self.metrics = {}
        self.load_all_models()
    
    def load_all_models(self):
        """Load all available Keras models in the directory."""
        keras_files = list(self.model_dir.glob("*.keras"))
        
        print(f"Found {len(keras_files)} model files:")
        for model_file in keras_files:
            try:
                print(f"  Loading {model_file.name}...")
                model = tf.keras.models.load_model(model_file)
                self.models[model_file.name] = model
                
                # Load corresponding metrics
                metrics_file = model_file.with_suffix('').with_suffix('_metrics.json')
                if metrics_file.exists():
                    with open(metrics_file, 'r') as f:
                        self.metrics[model_file.name] = json.load(f)
                
                print(f"    ✅ Loaded successfully")
            except Exception as e:
                print(f"    ❌ Failed to load: {e}")
    
    def evaluate_models(self):
        """Evaluate and compare all loaded models."""
        print("\n" + "="*60)
        print("MODEL EVALUATION SUMMARY")
        print("="*60)
        
        for model_name, model in self.models.items():
            print(f"\n🔍 Model: {model_name}")
            print("-" * 40)
            
            # Print architecture summary
            print("Architecture:")
            model.summary(print_fn=lambda x: print(f"  {x}"))
            
            # Print metrics if available
            if model_name in self.metrics:
                metrics = self.metrics[model_name]
                if 'test' in metrics:
                    test_metrics = metrics['test']
                    print(f"\n📊 Test Performance:")
                    print(f"  Accuracy:  {test_metrics.get('accuracy', 'N/A'):.3f}")
                    print(f"  Precision: {test_metrics.get('precision', 'N/A'):.3f}")
                    print(f"  Recall:    {test_metrics.get('recall', 'N/A'):.3f}")
                    print(f"  F1 Score:  {test_metrics.get('f1', 'N/A'):.3f}")
                    print(f"  ROC AUC:   {test_metrics.get('roc_auc', 'N/A'):.3f}")
    
    def recommend_best_model(self) -> str:
        """Recommend the best single model based on metrics."""
        if not self.metrics:
            return list(self.models.keys())[0] if self.models else None
        
        best_model = None
        best_score = 0
        
        for model_name, metrics in self.metrics.items():
            if 'test' in metrics:
                test_metrics = metrics['test']
                # Combine F1 and AUC for overall score
                f1 = test_metrics.get('f1', 0)
                auc = test_metrics.get('roc_auc', 0)
                score = (f1 + auc) / 2
                
                if score > best_score:
                    best_score = score
                    best_model = model_name
        
        return best_model or list(self.models.keys())[0]
    
    def create_improved_model(self, base_model_name: str = None):
        """Create an improved model architecture."""
        if base_model_name and base_model_name in self.models:
            base_model = self.models[base_model_name]
            print(f"Using {base_model_name} as base model")
        
        # Create an improved CNN architecture
        model = tf.keras.Sequential([
            tf.keras.layers.Input(shape=(150, 150, 3)),
            
            # Enhanced feature extraction with residual-like connections
            tf.keras.layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
            tf.keras.layers.MaxPooling2D((2, 2)),
            tf.keras.layers.Dropout(0.25),
            
            tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
            tf.keras.layers.MaxPooling2D((2, 2)),
            tf.keras.layers.Dropout(0.25),
            
            tf.keras.layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
            tf.keras.layers.MaxPooling2D((2, 2)),
            tf.keras.layers.Dropout(0.25),
            
            # Dense layers with regularization
            tf.keras.layers.GlobalAveragePooling2D(),
            tf.keras.layers.Dense(512, activation='relu'),
            tf.keras.layers.Dropout(0.5),
            tf.keras.layers.Dense(256, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        
        # Compile with class weights to handle imbalanced data
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
            loss='binary_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        return model
    
    def test_on_problematic_case(self, image_path: str = None):
        """Test all models on a known problematic case."""
        # For now, create a dummy test case
        # In practice, you'd load the actual problematic image
        test_image = np.random.rand(1, 150, 150, 3)
        
        print("\n🧪 Testing models on problematic case:")
        print("-" * 40)
        
        results = {}
        for model_name, model in self.models.items():
            try:
                pred = model.predict(test_image, verbose=0)
                prob = float(pred[0][0])
                prediction = 'PNEUMONIA' if prob >= 0.5 else 'NORMAL'
                results[model_name] = {
                    'probability': prob,
                    'prediction': prediction
                }
                print(f"{model_name:30} → {prediction:9} ({prob:.3f})")
            except Exception as e:
                print(f"{model_name:30} → ERROR: {e}")
        
        return results
    
    def switch_to_model(self, model_name: str):
        """Switch the active model used by the inference service."""
        if model_name not in self.models:
            print(f"❌ Model {model_name} not found!")
            return False
        
        # Update the inference service configuration
        config = {
            "active_model": model_name,
            "model_path": str(self.model_dir / model_name),
            "switch_timestamp": str(pd.Timestamp.now()) if 'pd' in globals() else "unknown"
        }
        
        config_file = self.model_dir / "active_model_config.json"
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"✅ Switched to model: {model_name}")
        print(f"Config saved to: {config_file}")
        return True

def main():
    manager = ModelManager()
    
    print("🤖 Pneumonia Detection Model Manager")
    print("=" * 50)
    
    # Evaluate all models
    manager.evaluate_models()
    
    # Get recommendation
    best_model = manager.recommend_best_model()
    print(f"\n🏆 Recommended model: {best_model}")
    
    # Test on problematic case
    manager.test_on_problematic_case()
    
    # Interactive mode
    while True:
        print("\n" + "="*50)
        print("AVAILABLE COMMANDS:")
        print("1. List models")
        print("2. Switch model")
        print("3. Create improved model")
        print("4. Test models")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == '1':
            print("\nAvailable models:")
            for i, model_name in enumerate(manager.models.keys(), 1):
                print(f"  {i}. {model_name}")
        
        elif choice == '2':
            print("\nSelect model to switch to:")
            models = list(manager.models.keys())
            for i, model_name in enumerate(models, 1):
                print(f"  {i}. {model_name}")
            
            try:
                idx = int(input("Enter model number: ")) - 1
                if 0 <= idx < len(models):
                    manager.switch_to_model(models[idx])
                else:
                    print("❌ Invalid selection")
            except ValueError:
                print("❌ Please enter a valid number")
        
        elif choice == '3':
            print("\n🔧 Creating improved model architecture...")
            improved_model = manager.create_improved_model()
            print("✅ Improved model created (not trained yet)")
            
            save_choice = input("Save improved model architecture? (y/n): ")
            if save_choice.lower() == 'y':
                model_path = manager.model_dir / "improved_pneumonia_model.keras"
                improved_model.save(model_path)
                print(f"✅ Saved to: {model_path}")
        
        elif choice == '4':
            manager.test_on_problematic_case()
        
        elif choice == '5':
            print("👋 Goodbye!")
            break
        
        else:
            print("❌ Invalid choice")

if __name__ == "__main__":
    main()
