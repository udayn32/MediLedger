"""train_model.py

Train a CNN (Keras / TensorFlow) for Pneumonia detection on chest X‑ray images.

Usage examples:
    python train_model.py --data ./chest_xray --epochs 15
    python train_model.py --data ./chest_xray --img-size 224 224 --batch-size 16 --model-path pneumonia_model.keras

Kaggle dataset (Chest X-Ray Pneumonia) structure expected:
chest_xray/
    train/
        NORMAL/...
        PNEUMONIA/...
    val/
        NORMAL/...
        PNEUMONIA/...
    test/ (optional)

Arguments:
    --data / -d        Base directory containing train/ and val/
    --epochs / -e      Number of epochs (default 15)
    --batch-size / -b  Batch size (default 32)
    --img-size         Two ints H W (default 150 150)
    --model-path / -o  Output model file (default pneumonia_detection_model.keras)
    --lr               Learning rate (default 1e-4)
    --early-stop       Enable EarlyStopping (patience 4)
    --augment-off      Disable data augmentation

Environment alternative:
    DATA_DIR, MODEL_PATH, EPOCHS, BATCH_SIZE
"""

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization,
    RandomFlip, RandomRotation
)
from tensorflow.keras.optimizers import Adam
import os
import json
import numpy as np
import matplotlib.pyplot as plt
import argparse
from typing import Tuple, List, Dict, Any
try:
    from sklearn.metrics import (
        accuracy_score,
        precision_recall_fscore_support,
        roc_auc_score,
        average_precision_score,
        confusion_matrix,
        classification_report,
        log_loss,
        brier_score_loss,
        mean_squared_error,
        r2_score,
        RocCurveDisplay,
        PrecisionRecallDisplay,
    )
    _HAS_SKLEARN = True
except Exception:
    _HAS_SKLEARN = False

# --- 1. Configuration and Data Loading ---

def parse_args():
    parser = argparse.ArgumentParser(description="Train Pneumonia Detection CNN")
    parser.add_argument('-d','--data', default=os.getenv('DATA_DIR', None), help='Base data directory containing train/ and val/ (auto-detected if omitted)')
    parser.add_argument('-e','--epochs', type=int, default=int(os.getenv('EPOCHS',1)))
    parser.add_argument('-b','--batch-size', type=int, default=int(os.getenv('BATCH_SIZE',32)))
    parser.add_argument('--img-size', nargs=2, type=int, default=[150,150], metavar=('H','W'))
    parser.add_argument('-o','--model-path', default=os.getenv('MODEL_PATH','pneumonia_detection_model.keras'))
    parser.add_argument('--lr', type=float, default=1e-4)
    parser.add_argument('--early-stop', action='store_true')
    parser.add_argument('--augment-off', action='store_true', help='Disable augmentation')
    parser.add_argument('--auto-kaggle', action='store_true', help='Download Kaggle chest-xray-pneumonia dataset automatically via kagglehub (requires internet)')
    parser.add_argument('--train-steps', type=int, default=None, help='Limit steps per epoch for quick runs (optional)')
    parser.add_argument('--val-steps', type=int, default=None, help='Limit validation steps per epoch (optional)')
    return parser.parse_args()

def build_datasets(train_dir: str, val_dir: str, img_size: Tuple[int,int], batch_size: int, augment: bool):
    if not os.path.exists(train_dir) or not os.path.exists(val_dir):
        raise FileNotFoundError(f"Dataset not found. Expecting train/ and val/ inside: {os.path.abspath(os.path.dirname(train_dir))}")

    # Use ImageDataGenerator for more powerful augmentation
    if augment:
        train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            fill_mode='nearest'
        )
    else:
        train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)

    val_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)

    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='binary'
    )

    validation_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='binary'
    )
    
    print(f"Found classes: {list(train_generator.class_indices.keys())}")

    return train_generator, validation_generator

def build_model(img_size: Tuple[int,int]):
    h,w = img_size
    model = Sequential([
        tf.keras.Input(shape=(h,w,3)),
        Conv2D(32,(3,3),activation='relu'), BatchNormalization(), MaxPooling2D((2,2)),
        Conv2D(64,(3,3),activation='relu'), BatchNormalization(), MaxPooling2D((2,2)),
        Conv2D(128,(3,3),activation='relu'), BatchNormalization(), MaxPooling2D((2,2)),
        Flatten(),
        Dense(512, activation='relu'), Dropout(0.5),
        Dense(1, activation='sigmoid')
    ])
    return model


def train():
    args = parse_args()
    img_size = (args.img_size[0], args.img_size[1])
    # Resolve dataset directory (auto-discover common paths if not provided)
    def has_required_subdirs(p: str) -> bool:
        return os.path.isdir(os.path.join(p, 'train')) and os.path.isdir(os.path.join(p, 'val'))

    base_dir = args.data
    if not base_dir:
        candidates = [
            os.path.join('data', 'chest_xray', 'chest_xray'),
            os.path.join('data', 'chest_xray'),
            'chest_xray',
        ]
        for c in candidates:
            if has_required_subdirs(c):
                base_dir = c
                break
    # If still not set, but DATA_DIR env was provided and missing subdirs, keep it to let build_datasets raise a helpful error
    if not base_dir:
        # As a last resort, try absolute path relative to this script's directory
        here = os.path.dirname(os.path.abspath(__file__))
        maybe = os.path.join(here, 'data', 'chest_xray', 'chest_xray')
        if has_required_subdirs(maybe):
            base_dir = maybe
        else:
            base_dir = os.getenv('DATA_DIR', 'data/chest_xray/chest_xray')

    # Optional Kaggle auto download
    if args.auto_kaggle:
        try:
            import kagglehub  # type: ignore
            print('Downloading Kaggle dataset (paultimothymooney/chest-xray-pneumonia)...')
            kaggle_path = kagglehub.dataset_download('paultimothymooney/chest-xray-pneumonia')
            print('Kaggle dataset downloaded to:', kaggle_path)
            # The kaggle dataset root contains 'chest_xray' folder; detect it
            potential = os.path.join(kaggle_path, 'chest_xray')
            if os.path.isdir(potential):
                base_dir = potential
            else:
                # If user points data somewhere else, keep original base_dir
                print('Could not find chest_xray folder inside Kaggle path; using provided --data directory')
        except ModuleNotFoundError:
            raise SystemExit('kagglehub not installed. Install with: pip install kagglehub')
        except Exception as e:
            raise SystemExit(f'Failed to download Kaggle dataset: {e}')
    train_dir = os.path.join(base_dir,'train')
    val_dir = os.path.join(base_dir,'val')
    train_ds, val_ds = build_datasets(train_dir, val_dir, img_size, args.batch_size, augment=not args.augment_off)
    
    # Calculate steps per epoch if not provided
    if args.train_steps is None:
        args.train_steps = train_ds.samples // train_ds.batch_size
    if args.val_steps is None:
        args.val_steps = val_ds.samples // val_ds.batch_size

    print(f"Training with:\n Data: {base_dir}\n Train: {train_dir}\n Val: {val_dir}\n Img: {img_size}\n Batch: {args.batch_size}\n Epochs: {args.epochs}\n Model Out: {args.model_path}")
    
    model = build_model(img_size)
    model.compile(optimizer=Adam(learning_rate=args.lr), loss='binary_crossentropy', metrics=['accuracy'])
    model.summary()
    callbacks = []
    if args.early_stop:
        callbacks.append(tf.keras.callbacks.EarlyStopping(monitor='val_accuracy', patience=4, restore_best_weights=True))
    print("\n--- Starting Model Training ---")
    fit_kwargs = {}
    if args.train_steps is not None:
        fit_kwargs['steps_per_epoch'] = args.train_steps
    if args.val_steps is not None:
        fit_kwargs['validation_steps'] = args.val_steps
    # Provide a fast default when no explicit limits are set, so `python train_model.py` completes quickly
    if 'steps_per_epoch' not in fit_kwargs and 'validation_steps' not in fit_kwargs:
        # No longer setting a quick-run default, use the full dataset unless specified
        # fit_kwargs['steps_per_epoch'] = 20
        # fit_kwargs['validation_steps'] = 1
        # print("Using quick-run defaults: steps_per_epoch=20, validation_steps=1. Pass --train-steps/--val-steps to override or remove limits.")
        pass
    history = model.fit(train_ds, validation_data=val_ds, epochs=args.epochs, callbacks=callbacks, **fit_kwargs)
    print("--- Model Training Finished ---\n")
    # Plot
    acc = history.history['accuracy']
    val_acc = history.history.get('val_accuracy') or history.history.get('validation_accuracy')
    loss = history.history['loss']
    val_loss = history.history.get('val_loss') or history.history.get('validation_loss')
    epochs_range = range(len(acc))
    plt.figure(figsize=(12,5))
    plt.subplot(1,2,1)
    plt.plot(epochs_range, acc, label='Train Acc')
    if val_acc: plt.plot(epochs_range, val_acc, label='Val Acc')
    plt.legend(); plt.title('Accuracy')
    plt.subplot(1,2,2)
    plt.plot(epochs_range, loss, label='Train Loss')
    if val_loss: plt.plot(epochs_range, val_loss, label='Val Loss')
    plt.legend(); plt.title('Loss')
    plt.tight_layout()
    out_png = os.path.splitext(args.model_path)[0] + '_training.png'
    plt.savefig(out_png)
    print(f"Saved training curves to {out_png}")
    model.save(args.model_path)
    print(f"Model saved as '{args.model_path}'")

    # --- Evaluation and Reporting ---
    if not _HAS_SKLEARN:
        print("sklearn not installed; skipping extended metrics. Install with: pip install scikit-learn")
        return

    def collect_probs_and_labels(ds, steps=None) -> Tuple[np.ndarray, np.ndarray]:
        y_true_list: List[float] = []
        y_prob_list: List[float] = []
        
        # If ds is a generator from flow_from_directory, steps must be provided to avoid infinite loop
        if steps:
            for i, (xb, yb) in enumerate(ds):
                if i >= steps:
                    break
                probs = model.predict(xb, verbose=0).ravel()
                y_prob_list.append(probs)
                y_true_list.append(yb.ravel())
        else: # Assumes a finite dataset like tf.data.Dataset which doesn't loop
            for xb, yb in ds:
                probs = model.predict(xb, verbose=0).ravel()
                y_prob_list.append(probs)
                y_true_list.append(yb.ravel())

        if not y_prob_list:
            return np.array([]), np.array([])

        y_true = np.concatenate(y_true_list, axis=0)
        y_prob = np.concatenate(y_prob_list, axis=0)
        return y_true, y_prob

    def compute_metrics(y_true: np.ndarray, y_prob: np.ndarray, threshold: float = 0.5) -> Dict[str, Any]:
        y_pred = (y_prob >= threshold).astype(int)
        acc = float(accuracy_score(y_true, y_pred))
        precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='binary', zero_division=0)
        # AUC metrics may fail if only one class present; guard them
        roc_auc = float(roc_auc_score(y_true, y_prob)) if len(np.unique(y_true)) > 1 else float('nan')
        pr_auc = float(average_precision_score(y_true, y_prob)) if len(np.unique(y_true)) > 1 else float('nan')
        cm = confusion_matrix(y_true, y_pred).tolist()
        # Additional scores
        # Clip probabilities to avoid log(0) without using deprecated 'eps' argument
        y_prob_clipped = np.clip(y_prob, 1e-15, 1-1e-15)
        ll = float(log_loss(y_true, y_prob_clipped)) if len(np.unique(y_true)) > 1 else float('nan')
        brier = float(brier_score_loss(y_true, y_prob))
        mse = float(mean_squared_error(y_true, y_prob))
        r2 = float(r2_score(y_true, y_prob)) if len(np.unique(y_true)) > 1 else float('nan')
        report = classification_report(y_true, y_pred, target_names=['NORMAL','PNEUMONIA'], zero_division=0)
        return {
            'threshold': threshold,
            'accuracy': acc,
            'precision': float(precision),
            'recall': float(recall),
            'f1': float(f1),
            'roc_auc': roc_auc,
            'pr_auc': pr_auc,
            'log_loss': ll,
            'brier_score': brier,
            'mse': mse,
            'r2': r2,
            'confusion_matrix': cm,
            'classification_report': report,
        }

    def save_curves(y_true: np.ndarray, y_prob: np.ndarray, prefix: str):
        # ROC
        try:
            RocCurveDisplay.from_predictions(y_true, y_prob)
            plt.title('ROC Curve')
            roc_path = prefix + '_roc.png'
            plt.savefig(roc_path)
            plt.close()
            print(f"Saved ROC curve to {roc_path}")
        except Exception as e:
            print(f"Skipping ROC curve: {e}")
        # PR
        try:
            PrecisionRecallDisplay.from_predictions(y_true, y_prob)
            plt.title('Precision-Recall Curve')
            pr_path = prefix + '_pr.png'
            plt.savefig(pr_path)
            plt.close()
            print(f"Saved PR curve to {pr_path}")
        except Exception as e:
            print(f"Skipping PR curve: {e}")

    # Evaluate on validation set
    print("\n--- Evaluating on validation set ---")
    y_true_val, y_prob_val = collect_probs_and_labels(val_ds, steps=args.val_steps)
    metrics_val = compute_metrics(y_true_val, y_prob_val)
    prefix = os.path.splitext(args.model_path)[0]
    save_curves(y_true_val, y_prob_val, prefix + '_val')

    # Evaluate on test set if exists
    metrics_test = None
    test_dir = os.path.join(base_dir, 'test')
    if os.path.isdir(test_dir) and len(os.listdir(test_dir)) > 0:
        try:
            test_ds_raw = tf.keras.utils.image_dataset_from_directory(
                test_dir, image_size=img_size, batch_size=args.batch_size, label_mode='binary')
            norm = tf.keras.layers.Rescaling(1./255)
            test_ds = test_ds_raw.map(lambda x,y: (norm(x), y)).cache().prefetch(buffer_size=tf.data.AUTOTUNE)
            print("\n--- Evaluating on test set ---")
            y_true_test, y_prob_test = collect_probs_and_labels(test_ds)
            metrics_test = compute_metrics(y_true_test, y_prob_test)
            save_curves(y_true_test, y_prob_test, prefix + '_test')
        except Exception as e:
            print(f"Test set evaluation skipped due to error: {e}")

    # Save metrics report
    report_txt = prefix + '_report.txt'
    report_json = prefix + '_metrics.json'
    with open(report_txt, 'w', encoding='utf-8') as f:
        f.write('Pneumonia Detection Model Report\n')
        f.write(f"Model: {args.model_path}\n")
        f.write(f"Image Size: {img_size}\nBatch Size: {args.batch_size}\nEpochs: {args.epochs}\n\n")
        f.write('Validation Metrics (threshold=0.5):\n')
        for k in ['accuracy','precision','recall','f1','roc_auc','pr_auc','log_loss','brier_score','mse','r2']:
            f.write(f"  {k}: {metrics_val[k]}\n")
        f.write(f"Confusion Matrix (val): {metrics_val['confusion_matrix']}\n\n")
        f.write('Classification Report (val):\n')
        f.write(metrics_val['classification_report'] + '\n')
        if metrics_test:
            f.write('\nTest Metrics (threshold=0.5):\n')
            for k in ['accuracy','precision','recall','f1','roc_auc','pr_auc','log_loss','brier_score','mse','r2']:
                f.write(f"  {k}: {metrics_test[k]}\n")
            f.write(f"Confusion Matrix (test): {metrics_test['confusion_matrix']}\n\n")
            f.write('Classification Report (test):\n')
            f.write(metrics_test['classification_report'] + '\n')
    with open(report_json, 'w', encoding='utf-8') as f:
        json.dump({'validation': metrics_val, 'test': metrics_test}, f, indent=2)
    print(f"Saved report to {report_txt} and metrics JSON to {report_json}")

if __name__ == '__main__':
    train()


## (Legacy procedural code removed – now handled inside train())
