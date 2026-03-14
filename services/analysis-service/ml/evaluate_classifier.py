import os
import pandas as pd
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
)
import joblib

SEED = 42
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "phishing_dataset.csv")
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")


def load_data(path):
    df = pd.read_csv(path)
    df = df.dropna(subset=["text"])
    df["text"] = df["text"].astype(str).str.strip()
    return df


def get_test_split(df, seed=SEED):
    from sklearn.model_selection import train_test_split

    X = df["text"]
    y = df["label"]
    _, X_temp, _, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=seed, stratify=y
    )
    _, X_test, _, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=seed, stratify=y_temp
    )
    return X_test, y_test


def main():
    np.random.seed(SEED)

    model_path = os.path.join(ARTIFACTS_DIR, "phishing_model.joblib")
    vec_path = os.path.join(ARTIFACTS_DIR, "tfidf_vectorizer.joblib")

    if not os.path.exists(model_path) or not os.path.exists(vec_path):
        print("Error: model artifacts not found. Run train_classifier.py first.")
        return

    model = joblib.load(model_path)
    vectorizer = joblib.load(vec_path)
    print("Loaded model and vectorizer from artifacts/")

    df = load_data(DATA_PATH)
    X_test, y_test = get_test_split(df)
    print(f"Test set: {len(X_test)} samples")

    X_test_tfidf = vectorizer.transform(X_test)
    y_pred = model.predict(X_test_tfidf)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    print(f"\n{'=' * 40}")
    print(f"  Test Set Metrics")
    print(f"{'=' * 40}")
    print(f"  Accuracy:  {acc:.4f}")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1 Score:  {f1:.4f}")
    print(f"{'=' * 40}")

    print(f"\nConfusion Matrix:")
    print(f"                 Predicted")
    print(f"              Legit  Phish")
    print(f"  Actual Legit  {cm[0][0]:>4}   {cm[0][1]:>4}")
    print(f"  Actual Phish  {cm[1][0]:>4}   {cm[1][1]:>4}")


if __name__ == "__main__":
    main()
