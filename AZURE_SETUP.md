# Azure Static Web Apps setup

Use the Azure Portal to create a Static Web App connected to this repository.

Recommended settings:
- Plan: Free
- Source: GitHub
- Repository: nadare0297-source/skdla-de-knowledge-base
- Branch: main
- Build preset: Custom
- App location: /
- API location: leave blank
- Output location: leave blank

The site is intended to be anonymously accessible. Do not add authentication restrictions unless desired later.

After Azure creates the resource, it will add a GitHub Actions workflow and provide a permanent *.azurestaticapps.net URL.
