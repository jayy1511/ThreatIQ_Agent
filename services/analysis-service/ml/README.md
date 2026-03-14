# ML Pipeline — Phishing Email Classifier

## Dataset

- **Source**: `../data/phishing_dataset.csv`
- **Size**: 2,000 samples (1,000 phishing, 1,000 legitimate)
- **Features**: raw email text
- **Split**: 70% train / 15% validation / 15% test (stratified)

## Model

**TF-IDF + Logistic Regression** — chosen for interpretability, fast training, and strong baseline performance on text classification tasks.

- TF-IDF: `max_features=5000`
- Logistic Regression: `C=1.0`, `max_iter=1000`

## Usage

### Train

```bash
cd services/analysis-service/ml
python train_classifier.py
```

### Evaluate

```bash
python evaluate_classifier.py
```

## Artifacts

Saved to `artifacts/` after training:

| File | Description |
|------|-------------|
| `phishing_model.joblib` | Trained Logistic Regression model |
| `tfidf_vectorizer.joblib` | Fitted TF-IDF vectorizer |
