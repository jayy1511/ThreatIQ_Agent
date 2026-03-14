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

Optional arguments for performance tuning:
```bash
python train_classifier.py --max_features 10000 --C 1.0 --seed 42
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

## Reproducibility

Seeds are set for `random`, `numpy`, and `sklearn` (via `random_state`) to ensure deterministic results. Running `train_classifier.py` with the same seed produces identical metrics.

## Experiment Tracking

Each training run is automatically logged to `experiment_log.csv`:

| Column | Description |
|--------|-------------|
| `run_id` | Unique 8-char hex identifier |
| `timestamp` | ISO-format run time |
| `model` | Model family used |
| `max_features` | TF-IDF vocabulary size |
| `C` | Regularization parameter |
| `random_seed` | Seed used for reproducibility |
| `validation_f1` | F1 score on validation set |
| `notes` | Free-text annotation |

