# ArtRefinery Prompts Documentation

This document records the core system prompts used in ArtRefinery for analysis and image generation.

## 1. Image Analysis Prompt
**Model:** `gemini-3-flash-preview`
**Context:** Triggered when an image is uploaded.
**Prompt:**
```text
Analyze this image and extract its core components for a prompt. Return JSON with:
- subject: The main subject(s)
- action: What is happening
- setting: Where it is
- mood: The emotional tone
- lighting: Lighting conditions
- details: Any specific notable details
Keep each field concise (1-5 words).
```
**Output Config:** JSON Schema enforced via `responseSchema`.

## 2. Randomization Logic
**Model:** `gemini-3-flash-preview`
**Context:** Triggered via the "Randomize Logic" button.
**Prompt:**
```text
Given the current image components: {{analysis}}, generate a set of RANDOMIZED alternative versions that keep the structure but change the content significantly (e.g. if it's a person, make it a robot or mythical creature). Return ONLY JSON.
```

## 3. Style Transformation Prompt
**Model:** `gemini-3.1-flash-image-preview`
**Context:** Triggered during batch generation for each selected style.
**Prompt Template:**
```text
Transform this image into the following style: {{style.name}}. {{style.description}}. 
Final prompt: {{basePrompt}} {{style.promptSuffix}}
```
**Inputs:**
- `basePrompt`: Constructed from the mad-libs variables (subject, action, setting, etc.)
- `style.promptSuffix`: Specific artistic keywords for each of the 18 styles.
