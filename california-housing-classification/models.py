import tensorflow as tf
from tensorflow.keras import layers, Model
import xgboost as xgb

def build_residual_resnet(input_shape):
    inputs = layers.Input(shape=(input_shape,))
    x = layers.Dense(512, activation="swish")(inputs)
    x = layers.BatchNormalization()(x)
    res = x
    x = layers.Dense(512, activation="swish")(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(512, activation="swish")(x)
    x = layers.Add()([res, x])
    x = layers.BatchNormalization()(x)
    x = layers.Dense(256, activation="swish")(x)
    x = layers.Dense(128, activation="swish")(x)
    outputs = layers.Dense(1, activation="sigmoid")(x)
    return Model(inputs, outputs)

def get_optimized_xgb():
    return xgb.XGBClassifier(
        n_estimators=1000,
        max_depth=10,
        learning_rate=0.03,
        subsample=0.8,
        colsample_bytree=0.8,
        tree_method="hist",
        random_state=42
    )