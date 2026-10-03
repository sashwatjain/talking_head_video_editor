# Prompt: draft a video theme from a visual reference

Give this prompt to a multimodal ChatGPT together with a poster, screenshot, or website image. The returned file is a draft; ask the user to verify it before editing. Do not ask the model to copy the reference artwork.

```text
You are preparing a visual style guide for a talking-head video edit built with Remotion. Analyze the attached poster or website screenshot as design inspiration, not as artwork to reproduce.

Return only Markdown for a file named project/theme.md, using exactly these sections:

# Theme and visual system
## Brand
## Color palette
## Typography
## Layout and motion
## Assets and restrictions
## Approval

Describe the overall visual direction, likely audience, and the reference's visual hierarchy. Propose a compact palette with HEX values and semantic roles (background, surface, primary, secondary, text, muted text). If a pixel value or font cannot be identified reliably, say it is an estimate and include a suitable fallback rather than claiming certainty. Suggest heading/body type characteristics, safe margins, speaker framing, graphic placement, caption treatment, restrained motion, and transitions appropriate for talking-head footage.

Separate observations from recommendations. Do not invent the brand name, logo, font identity, licensing rights, facts, or user preferences. Do not include text, logos, or distinctive artwork copied from the reference. Mark unknowns as questions for the user. Keep the result practical for an AI coding agent to implement, concise, accessible, and consistent. In the Approval section, leave reviewer and date blank and list the inferences the user should verify.
```
