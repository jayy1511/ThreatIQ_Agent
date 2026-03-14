# Error Analysis

This document explores misclassified examples from the test set (4 errors out of 300 samples) to understand the model's failure modes and identify potential improvements. Note that the model achieved perfect recall (1.000) on the test set, meaning there were 0 False Negatives. Therefore, we examine two False Positives.

## 1. False Positive Example 1
*(Legitimate email incorrectly classified as phishing)*

**Example Text**:
> "fw filling vacancies adding head count new policy please email justification hiring replacements consider alternatives automatically hiring also carefully consider level need hire see additional hires require multiple sign offs require face face meeting proceeding let know questions tks bob original message hall bob sent thursday october 04 2001 3 04 pm reeves leslie superty robert gossett jeffrey c white stacey w wynne rita mcclure mark subject filling vacancies adding head count recent budgeting experience think need tighten procedures around filling vacancies adding head count filling vacancies would like review positions think need challenge managers conservative possible would like sign replacements promise difficult adding personnel current budgeted number besides commercial team sign addition think may approved coo americas louise planning meeting next week discuss detail keep loop new hires resulting business changes asset management deals service arrangements let know think thanks bob"

**Why it failed**:
The TF-IDF + Logistic Regression model relies purely on word frequencies. This legitimate email likely contains terms that frequently appear in phishing emails in our training set (e.g., words related to "filling vacancies" or job offers which are common phishing lures). Because the model lacks sequential context or sender information, it misclassified the email based solely on these keywords.

## 2. False Positive Example 2
*(Legitimate email incorrectly classified as phishing)*

**Example Text**:
> "goldston outage per kevin goldston plant turnaround 19 20 21 flowing 0 point 989603 days wanted give heads advance"

**Why it failed**:
This is a very short, informal internal communication ("outage per kevin goldston plant turnaround"). Very short texts provide few TF-IDF features. If words like "outage" or "heads advance" happen to have a high positive weight for the phishing class in the learned weights (perhaps due to "urgent" or "alert" contexts in the training set), it can easily push the probability over the 0.5 threshold. The lack of standard email structure also contributes to the error.

## Observed Patterns
1. **Context Blindness:** The model cannot distinguish between a legitimate discussion of a topic (e.g., HR vacancies) and a phishing lure about the same topic.
2. **Short Text Sensitivity:** Very short emails provide very few TF-IDF features, making them highly susceptible to misclassification if even one word has a strong feature weight.

## Potential Improvements
1. **Contextual Embeddings:** Move from TF-IDF to a transformer-based model (e.g., DistilBERT or the existing Gemini LLM agent) that understands semantics and word order.
2. **Metadata Features:** Incorporate sender reputation, URL analysis (link count/domain), and structural features (e.g., presence of forms/attachments) rather than relying exclusively on email body text.
3. **Threshold Tuning:** Adjust the classification threshold. If reducing false positives (legitimate emails marked as spam) is more critical for user experience, the threshold can be raised (e.g., > 0.8 probability to classify as phishing), trading off some recall for perfectly clean inboxes.
