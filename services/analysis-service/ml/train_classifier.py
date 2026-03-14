import os
import random
import csv
import uuid
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib

SEED = 42
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "phishing_dataset.csv")
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
EXPERIMENT_LOG = os.path.join(os.path.dirname(__file__), "experiment_log.csv")

LOG_COLUMNS = ["run_id", "timestamp", "model", "max_features", "C", "random_seed", "validation_f1", "notes"]


def set_seeds(seed):
    random.seed(seed)
    np.random.seed(seed)


def load_data(path):
    df = pd.read_csv(path)
    df = df.dropna(subset=["text"])
    df["text"] = df["text"].astype(str).str.strip()
    return df


def split_data(df, seed=SEED):
    X = df["text"]
    y = df["label"]
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=seed, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=seed, stratify=y_temp
    )
    return X_train, X_val, X_test, y_train, y_val, y_test


def train(X_train, y_train, max_features=5000, C=1.0, seed=SEED):
    vectorizer = TfidfVectorizer(max_features=max_features)
    X_train_tfidf = vectorizer.fit_transform(X_train)

    model = LogisticRegression(max_iter=1000, C=C, random_state=seed)
    model.fit(X_train_tfidf, y_train)

    return model, vectorizer


def evaluate(model, vectorizer, X, y, split_name="Validation"):
    X_tfidf = vectorizer.transform(X)
    y_pred = model.predict(X_tfidf)

    acc = accuracy_score(y, y_pred)
    prec = precision_score(y, y_pred)
    rec = recall_score(y, y_pred)
    f1 = f1_score(y, y_pred)

    print(f"\n{'=' * 40}")
    print(f"  {split_name} Set Metrics")
    print(f"{'=' * 40}")
    print(f"  Accuracy:  {acc:.4f}")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1 Score:  {f1:.4f}")
    print(f"{'=' * 40}\n")

    return {"accuracy": acc, "precision": prec, "recall": rec, "f1": f1}


def save_artifacts(model, vectorizer, output_dir=ARTIFACTS_DIR):
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, "phishing_model.joblib")
    vec_path = os.path.join(output_dir, "tfidf_vectorizer.joblib")
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vec_path)
    print(f"Model saved to {model_path}")
    print(f"Vectorizer saved to {vec_path}")


def log_experiment(run_id, max_features, C, seed, val_f1, notes=""):
    file_exists = os.path.exists(EXPERIMENT_LOG)
    with open(EXPERIMENT_LOG, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=LOG_COLUMNS)
        if not file_exists:
            writer.writeheader()
        writer.writerow({
            "run_id": run_id,
            "timestamp": datetime.now().isoformat(timespec="seconds"),
            "model": "LogisticRegression",
            "max_features": max_features,
            "C": C,
            "random_seed": seed,
            "validation_f1": f"{val_f1:.4f}",
            "notes": notes,
        })
    print(f"Experiment logged to {EXPERIMENT_LOG}")


def main():
    seed = SEED
    max_features = 5000
    C = 1.0

    set_seeds(seed)
    run_id = uuid.uuid4().hex[:8]

    print("Loading dataset...")
    df = load_data(DATA_PATH)
    print(f"Dataset: {len(df)} samples ({df['label'].sum()} phishing, {(df['label'] == 0).sum()} legitimate)")

    X_train, X_val, X_test, y_train, y_val, y_test = split_data(df, seed=seed)
    print(f"Split: train={len(X_train)}, val={len(X_val)}, test={len(X_test)}")

    print("Training TF-IDF + Logistic Regression...")
    model, vectorizer = train(X_train, y_train, max_features=max_features, C=C, seed=seed)

    metrics = evaluate(model, vectorizer, X_val, y_val, split_name="Validation")

    save_artifacts(model, vectorizer)
    log_experiment(run_id, max_features, C, seed, metrics["f1"], notes="baseline")

    print("Training complete.")


if __name__ == "__main__":
    main()
