# train_model.py
#
# This script trains a Convolutional Neural Network (CNN) to detect pneumonia
# from chest X-ray images.
#
# --- SETUP INSTRUCTIONS ---
# 1. Install necessary libraries:
#    pip install tensorflow numpy matplotlib
#
# 2. Organize your dataset into the following structure:
#    /path/to/your/dataset/
#    ├── train/
#    │   ├── NORMAL/
#    │   │   ├── image1.jpeg
#    │   │   └── ...
#    │   └── PNEUMONIA/
#    │       ├── image1.jpeg
#    │       └── ...
#    └── val/
#        ├── NORMAL/
#        │   └── ...
#        └── PNEUMONIA/
#            └── ...
#    (A 'test' directory with the same structure is also recommended for final evaluation)
#
# 3. Update the `train_dir` and `val_dir` variables below to point to your dataset.
#
# 4. Run the script from your terminal:
#    python train_model.py

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization, RandomFlip, RandomRotation
from tensorflow.keras.optimizers import Adam
import os
import numpy as np
import matplotlib.pyplot as plt

# --- 1. Configuration and Data Loading ---

# Define image dimensions and batch size
IMG_HEIGHT = 150
IMG_WIDTH = 150
BATCH_SIZE = 32

# IMPORTANT: Update these paths to where your dataset is located
# This should point to the directory containing 'train' and 'val' folders
base_dir = './chest_xray' # Change this to your dataset path
train_dir = os.path.join(base_dir, 'train')
val_dir = os.path.join(base_dir, 'val')
# test_dir = os.path.join(base_dir, 'test') # Uncomment if you have a test set

# Check if directories exist
if not os.path.exists(train_dir) or not os.path.exists(val_dir):
    print("="*50)
    print("ERROR: Dataset directories not found.")
    print(f"Please make sure the paths are correct. I'm looking for:")
    print(f"- Training data in: {os.path.abspath(train_dir)}")
    print(f"- Validation data in: {os.path.abspath(val_dir)}")
    print("="*50)
    exit()


# Use image_dataset_from_directory to load the images
# This function automatically infers class labels from the folder names (NORMAL, PNEUMONIA)
train_dataset = tf.keras.utils.image_dataset_from_directory(
    train_dir,
    image_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
    label_mode='binary' # Use 'binary' for two classes
)

validation_dataset = tf.keras.utils.image_dataset_from_directory(
    val_dir,
    image_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
    label_mode='binary'
)

# Get class names
class_names = train_dataset.class_names
print(f"Found classes: {class_names}")


# --- 2. Preprocessing and Performance Optimization ---

# Create a data augmentation layer
data_augmentation = Sequential([
    RandomFlip("horizontal"),
    RandomRotation(0.1),
])

# Normalize pixel values to be between 0 and 1
normalization_layer = tf.keras.layers.Rescaling(1./255)

# Apply data augmentation and normalization to the training dataset
# This is done on-the-fly during training
augmented_train_ds = train_dataset.map(lambda x, y: (data_augmentation(x, training=True), y))
normalized_ds = augmented_train_ds.map(lambda x, y: (normalization_layer(x), y))

# Normalize the validation dataset (no augmentation)
normalized_val_ds = validation_dataset.map(lambda x, y: (normalization_layer(x), y))

# Use caching and prefetching to optimize performance
AUTOTUNE = tf.data.AUTOTUNE
train_dataset_final = normalized_ds.cache().prefetch(buffer_size=AUTOTUNE)
validation_dataset_final = normalized_val_ds.cache().prefetch(buffer_size=AUTOTUNE)


# --- 3. Build the CNN Model ---

model = Sequential([
    # Input layer
    tf.keras.Input(shape=(IMG_HEIGHT, IMG_WIDTH, 3)),

    # First Convolutional Block
    Conv2D(32, (3, 3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(pool_size=(2, 2)),

    # Second Convolutional Block
    Conv2D(64, (3, 3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(pool_size=(2, 2)),

    # Third Convolutional Block
    Conv2D(128, (3, 3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(pool_size=(2, 2)),

    # Flatten the results to feed into a dense layer
    Flatten(),

    # Dense (fully connected) layers
    Dense(512, activation='relu'),
    Dropout(0.5), # Dropout for regularization to prevent overfitting
    Dense(1, activation='sigmoid') # Sigmoid activation for binary classification
])

# Compile the model
model.compile(
    optimizer=Adam(learning_rate=0.0001),
    loss='binary_crossentropy',
    metrics=['accuracy']
)

# Print a summary of the model architecture
model.summary()


# --- 4. Train the Model ---

print("\n--- Starting Model Training ---")
epochs = 15 # You can increase this for better results, e.g., to 20 or 30
history = model.fit(
    train_dataset_final,
    validation_data=validation_dataset_final,
    epochs=epochs
)
print("--- Model Training Finished ---\n")


# --- 5. Visualize Training Results ---

acc = history.history['accuracy']
val_acc = history.history['validation_accuracy']
loss = history.history['loss']
val_loss = history.history['validation_loss']

epochs_range = range(epochs)

plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 1)
plt.plot(epochs_range, acc, label='Training Accuracy')
plt.plot(epochs_range, val_acc, label='Validation Accuracy')
plt.legend(loc='lower right')
plt.title('Training and Validation Accuracy')

plt.subplot(1, 2, 2)
plt.plot(epochs_range, loss, label='Training Loss')
plt.plot(epochs_range, val_loss, label='Validation Loss')
plt.legend(loc='upper right')
plt.title('Training and Validation Loss')
plt.show()


# --- 6. Save the Trained Model ---

# The model will be saved in the Keras format.
# You can then load this file in your backend for making predictions.
model.save('pneumonia_detection_model.keras')
print("Model saved as 'pneumonia_detection_model.keras'")
