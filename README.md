# SKDLA Data Entry Knowledge Base

Deployment source for the SKDLA Data Entry/Ninja Knowledge Base.

## Website
- `index.html` — searchable KB interface
- `data/kb-1.json` through `data/kb-6.json` — KB article data
- `staticwebapp.config.json` — Azure Static Web Apps configuration

## Access
The site is intended to be anonymously viewable. No authentication route is configured.

## Updating
Update the relevant KB JSON article and commit to `main`. Azure Static Web Apps will redeploy automatically while keeping the same public URL.

Do not add passwords, credentials, PHI, patient information, or other sensitive client data to this repository.

## Version 3.0
All KB articles now retain the original policy/rule and add a Step-by-Step Procedure plus Stop/Escalate guidance. A dedicated `abs-case-entry.html` page provides the start-to-finish ABS entry procedure.
