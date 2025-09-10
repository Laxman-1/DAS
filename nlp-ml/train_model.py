
import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader
from transformers import BertTokenizer, BertModel
from torch.optim import AdamW
import joblib
import numpy as np
import os

# Download NLTK stopwords
nltk.download('stopwords', quiet=True)

# 1️⃣ Preprocess text
def preprocess_text(text):
    text = re.sub(r'[^a-zA-Z\s]', '', text.lower())
    stop_words = set(stopwords.words('english'))
    words = text.split()
    words = [w for w in words if w not in stop_words]
    return ' '.join(words)

# 2️⃣ Load dataset
df = pd.read_csv('symptoms_dataset.csv', quoting=2)
df['text'] = (df['disease'].fillna('') + ' ' + df['symptoms'].fillna('')).apply(preprocess_text)

# 3️⃣ Encode labels
label_encoder = LabelEncoder()
df['specialist_encoded'] = label_encoder.fit_transform(df['specialist'])

# 4️⃣ Split data
X_train, X_test, y_train, y_test = train_test_split(
    df['text'], df['specialist_encoded'], test_size=0.2, random_state=42, stratify=df['specialist_encoded']
)

# 5️⃣ TF-IDF + SVM pipeline
tfidf_svm_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=3000, ngram_range=(1, 2))),
    ('svm', SVC(kernel='linear', C=1.0, probability=True))
])
tfidf_svm_pipeline.fit(X_train, y_train)
svm_preds = tfidf_svm_pipeline.predict(X_test)
print("TF-IDF + SVM Accuracy:", accuracy_score(y_test, svm_preds))
print("TF-IDF + SVM Classification Report:\n", classification_report(y_test, svm_preds, target_names=label_encoder.classes_))

# 6️⃣ TF-IDF + Naive Bayes pipeline
tfidf_nb_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=3000, ngram_range=(1, 2))),
    ('nb', MultinomialNB())
])
tfidf_nb_pipeline.fit(X_train, y_train)
nb_preds = tfidf_nb_pipeline.predict(X_test)
print("TF-IDF + Naive Bayes Accuracy:", accuracy_score(y_test, nb_preds))
print("TF-IDF + Naive Bayes Classification Report:\n", classification_report(y_test, nb_preds, target_names=label_encoder.classes_))

# 7️⃣ BERT Tokenizer + Dataset
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
MAX_LEN = 128

class SymptomDataset(Dataset):
    def __init__(self, texts, labels):
        self.texts = texts
        self.labels = labels

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = tokenizer(
            self.texts[idx],
            padding='max_length',
            truncation=True,
            max_length=MAX_LEN,
            return_tensors='pt'
        )
        return {
            'input_ids': encoding['input_ids'].squeeze(0),
            'attention_mask': encoding['attention_mask'].squeeze(0),
            'label': torch.tensor(self.labels[idx], dtype=torch.long)
        }

train_dataset = SymptomDataset(X_train.tolist(), y_train.tolist())
test_dataset = SymptomDataset(X_test.tolist(), y_test.tolist())

train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=16)

# 8️⃣ Neural Network classifier
class BERTClassifier(nn.Module):
    def __init__(self, bert_model, hidden_size=768, num_classes=len(label_encoder.classes_)):
        super(BERTClassifier, self).__init__()
        self.bert = bert_model
        self.dropout = nn.Dropout(0.3)
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls_output = outputs.last_hidden_state[:, 0, :]  # [CLS] token
        x = self.dropout(cls_output)
        return self.fc(x)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model_bert = BertModel.from_pretrained('bert-base-uncased')
classifier = BERTClassifier(model_bert).to(device)

# 9️⃣ Optimizer and loss
optimizer = AdamW(classifier.parameters(), lr=2e-5)
criterion = nn.CrossEntropyLoss()

# 10️⃣ Training loop
EPOCHS = 3
for epoch in range(EPOCHS):
    classifier.train()
    total_loss = 0
    for batch in train_loader:
        optimizer.zero_grad()
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['label'].to(device)
        outputs = classifier(input_ids, attention_mask)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    print(f"Epoch {epoch+1}, Loss: {total_loss/len(train_loader):.4f}")

# 11️⃣ Evaluation
classifier.eval()
all_preds = []
all_labels = []
with torch.no_grad():
    for batch in test_loader:
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['label'].to(device)
        outputs = classifier(input_ids, attention_mask)
        preds = torch.argmax(outputs, dim=1)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

print("BERT + NN Accuracy:", accuracy_score(all_labels, all_preds))
print("BERT + NN Classification Report:\n", classification_report(all_labels, all_preds, target_names=label_encoder.classes_))

# 12️⃣ Ensemble: Average probabilities from SVM, Naive Bayes, and BERT
with torch.no_grad():
    bert_probs = []
    for batch in test_loader:
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        outputs = classifier(input_ids, attention_mask)
        probs = nn.Softmax(dim=1)(outputs)
        bert_probs.append(probs.cpu().numpy())
    bert_probs = np.vstack(bert_probs)

tfidf_svm_probs = tfidf_svm_pipeline.predict_proba(X_test)
tfidf_nb_probs = tfidf_nb_pipeline.predict_proba(X_test)
combined_probs = (bert_probs + tfidf_svm_probs + tfidf_nb_probs) / 3
ensemble_preds = np.argmax(combined_probs, axis=1)

print("Ensemble (SVM + Naive Bayes + BERT) Accuracy:", accuracy_score(y_test, ensemble_preds))
print("Ensemble Classification Report:\n", classification_report(y_test, ensemble_preds, target_names=label_encoder.classes_))

# 13️⃣ Save models
os.makedirs('model', exist_ok=True)
torch.save(classifier.state_dict(), 'model/bert_classifier.pth')
joblib.dump(tokenizer, 'model/bert_tokenizer.joblib')
joblib.dump(label_encoder, 'model/label_encoder.joblib')
joblib.dump(tfidf_svm_pipeline, 'model/tfidf_svm_pipeline.joblib')
joblib.dump(tfidf_nb_pipeline, 'model/tfidf_nb_pipeline.joblib')

print("Training complete and models saved.")