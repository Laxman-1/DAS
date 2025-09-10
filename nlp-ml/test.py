# save as evaluate_learning_curve.py and run with your virtualenv active: python evaluate_learning_curve.py
import math
import os
import re
import joblib
import numpy as np
import pandas as pd
from nltk.stem import PorterStemmer
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, mean_squared_error
import matplotlib.pyplot as plt

# ---- CONFIG ----
CSV_PATH = 'symptoms_dataset.csv'   # change if needed
OUTPUT_DIR = 'model'
os.makedirs(OUTPUT_DIR, exist_ok=True)

sizes = [100, 200, 300, 400, 500, 600]  # dataset sizes to evaluate (will skip > available)
repeats = 5                              # repeats per size
test_size = 0.2
random_seed_base = 42

# ---- Stopwords fallback ----
# Try nltk stopwords; if not available, use a small built-in fallback list
try:
    nltk.download('stopwords', quiet=True)
    from nltk.corpus import stopwords
    STOP_WORDS = set(stopwords.words('english'))
except Exception:
    # Small fallback set (expand if you want)
    STOP_WORDS = {
        'a','an','the','and','or','is','are','was','were','in','on','at','of','for','to','from',
        'with','without','by','as','that','this','it','be','have','has','had','i','you','we','they'
    }

stemmer = PorterStemmer()

def preprocess_text(text):
    if pd.isna(text):
        return ''
    text = re.sub(r'[^a-zA-Z\s]', '', str(text).lower())
    words = text.split()
    words = [stemmer.stem(w) for w in words if w not in STOP_WORDS]
    return ' '.join(words)

def evaluate_on_sample(df_sample, seed):
    df_sample = df_sample.copy()
    df_sample['text'] = (df_sample['disease'].fillna('') + ' ' + df_sample['symptoms'].fillna('')).apply(preprocess_text)
    df_sample = df_sample[df_sample['text'].str.strip() != '']
    if df_sample.shape[0] < 10:
        raise ValueError("Not enough non-empty samples after preprocessing.")

    le = LabelEncoder()
    y = le.fit_transform(df_sample['specialist'])
    X_text = df_sample['text'].values

    # stratified split
    try:
        X_train_text, X_test_text, y_train, y_test = train_test_split(X_text, y, test_size=test_size, random_state=seed, stratify=y)
    except Exception:
        X_train_text, X_test_text, y_train, y_test = train_test_split(X_text, y, test_size=test_size, random_state=seed)

    vec = TfidfVectorizer(max_features=5000, ngram_range=(1,2))
    X_train = vec.fit_transform(X_train_text)
    X_test = vec.transform(X_test_text)

    clf = SVC(kernel='linear', C=1.0, probability=False, random_state=seed)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='macro', zero_division=0)
    rec = recall_score(y_test, y_pred, average='macro', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)
    rmse = math.sqrt(mean_squared_error(y_test, y_pred))

    return {'accuracy': acc, 'precision': prec, 'recall': rec, 'f1': f1, 'rmse': rmse, 'n_classes': len(le.classes_)}

# ---- Main ----
df = pd.read_csv(CSV_PATH)
required = {'disease', 'symptoms', 'specialist'}
if not required.issubset(set(df.columns)):
    raise SystemExit(f"CSV must contain columns: {required}. Found: {list(df.columns)}")

total_rows = df.shape[0]
print(f"Total rows in CSV: {total_rows}")

available_sizes = [s for s in sizes if s <= total_rows]
if not available_sizes:
    raise SystemExit("No requested dataset sizes are <= available rows in CSV. Reduce sizes.")

results = []
details = []

for s in available_sizes:
    metrics_list = {'accuracy': [], 'precision': [], 'recall': [], 'f1': [], 'rmse': []}
    for r in range(repeats):
        seed = random_seed_base + r
        # Try stratified sampling by class to preserve distribution
        try:
            sample = df.groupby('specialist', group_keys=False).apply(
                lambda x: x.sample(frac=min(1, s/len(df)), random_state=seed)
            ).reset_index(drop=True)
            if sample.shape[0] > s:
                sample = sample.sample(n=s, random_state=seed)
            if sample.shape[0] < s:
                sample = df.sample(n=s, random_state=seed).reset_index(drop=True)
        except Exception:
            sample = df.sample(n=s, random_state=seed).reset_index(drop=True)

        try:
            m = evaluate_on_sample(sample, seed)
        except Exception as ex:
            print(f"Warning: evaluation failed for size={s}, repeat={r}, error={ex}")
            continue

        metrics_list['accuracy'].append(m['accuracy'])
        metrics_list['precision'].append(m['precision'])
        metrics_list['recall'].append(m['recall'])
        metrics_list['f1'].append(m['f1'])
        metrics_list['rmse'].append(m['rmse'])
        details.append({'size': s, 'repeat': r, **m})

    row = {
        'size': s,
        'n_repeats': len(metrics_list['accuracy']),
        'accuracy_mean': np.mean(metrics_list['accuracy']) if metrics_list['accuracy'] else np.nan,
        'accuracy_std': np.std(metrics_list['accuracy']) if metrics_list['accuracy'] else np.nan,
        'precision_mean': np.mean(metrics_list['precision']) if metrics_list['precision'] else np.nan,
        'precision_std': np.std(metrics_list['precision']) if metrics_list['precision'] else np.nan,
        'recall_mean': np.mean(metrics_list['recall']) if metrics_list['recall'] else np.nan,
        'recall_std': np.std(metrics_list['recall']) if metrics_list['recall'] else np.nan,
        'f1_mean': np.mean(metrics_list['f1']) if metrics_list['f1'] else np.nan,
        'f1_std': np.std(metrics_list['f1']) if metrics_list['f1'] else np.nan,
        'rmse_mean': np.mean(metrics_list['rmse']) if metrics_list['rmse'] else np.nan,
        'rmse_std': np.std(metrics_list['rmse']) if metrics_list['rmse'] else np.nan,
    }
    results.append(row)

results_df = pd.DataFrame(results).sort_values('size').reset_index(drop=True)
results_csv = os.path.join(OUTPUT_DIR, 'learning_curve_results.csv')
results_df.to_csv(results_csv, index=False)
details_df = pd.DataFrame(details)
details_df.to_csv(os.path.join(OUTPUT_DIR, 'learning_curve_details.csv'), index=False)

print(f"Saved summary results to: {results_csv}")
print(f"Saved details to: {os.path.join(OUTPUT_DIR, 'learning_curve_details.csv')}")
print(results_df)

# Plot
plt.figure(figsize=(10,6))
plt.plot(results_df['size'], results_df['accuracy_mean'], marker='o', label='Accuracy (mean)')
plt.plot(results_df['size'], results_df['precision_mean'], marker='o', label='Precision (macro mean)')
plt.plot(results_df['size'], results_df['recall_mean'], marker='o', label='Recall (macro mean)')
plt.plot(results_df['size'], results_df['f1_mean'], marker='o', label='F1 (macro mean)')
plt.plot(results_df['size'], results_df['rmse_mean'], marker='o', label='RMSE (mean)')
plt.xlabel('Dataset size (rows)')
plt.ylabel('Score / Error')
plt.title('Model performance vs dataset size (mean over repeats)')
plt.legend()
plt.grid(True)
plt.tight_layout()
plot_path = os.path.join(OUTPUT_DIR, 'learning_curve_metrics.png')
plt.savefig(plot_path)
plt.show()
print(f"Plot saved to: {plot_path}")

# --- Existing plot ---
plt.figure(figsize=(10,6))
plt.plot(results_df['size'], results_df['accuracy_mean'], marker='o', label='Accuracy (mean)')
plt.plot(results_df['size'], results_df['precision_mean'], marker='o', label='Precision (macro mean)')
plt.plot(results_df['size'], results_df['recall_mean'], marker='o', label='Recall (macro mean)')
plt.plot(results_df['size'], results_df['f1_mean'], marker='o', label='F1 (macro mean)')
plt.plot(results_df['size'], results_df['rmse_mean'], marker='o', label='RMSE (mean)')
plt.xlabel('Dataset size (rows)')
plt.ylabel('Score / Error')
plt.title('Model performance vs dataset size (mean over repeats)')
plt.legend()
plt.grid(True)
plt.tight_layout()
plot_path = os.path.join(OUTPUT_DIR, 'learning_curve_metrics.png')
plt.savefig(plot_path)
plt.show()
print(f"Plot saved to: {plot_path}")

# --- New: Bar diagram ---
metrics_to_plot = ['accuracy_mean', 'precision_mean', 'recall_mean', 'f1_mean']
x = np.arange(len(results_df['size']))  # label locations
width = 0.2  # bar width

fig, ax = plt.subplots(figsize=(10,6))
for i, metric in enumerate(metrics_to_plot):
    ax.bar(x + i*width, results_df[metric], width, label=metric.replace('_mean','').capitalize())

ax.set_xlabel('Dataset size (rows)')
ax.set_ylabel('Score')
ax.set_title('Model performance vs dataset size (Bar chart)')
ax.set_xticks(x + width*(len(metrics_to_plot)-1)/2)
ax.set_xticklabels(results_df['size'])
ax.legend()
ax.grid(True, axis='y', linestyle='--', alpha=0.7)

bar_plot_path = os.path.join(OUTPUT_DIR, 'learning_curve_metrics_bar.png')
plt.tight_layout()
plt.savefig(bar_plot_path)
plt.show()
print(f"Bar chart saved to: {bar_plot_path}")

