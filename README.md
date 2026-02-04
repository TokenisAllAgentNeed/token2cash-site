# token2.cash

Cashu Gate Aggregator — A directory of services that accept Cashu ecash tokens for LLM API access.

## Overview

token2.cash lists Gate services in the token2chat ecosystem. Users can browse available gates, compare pricing, and choose a provider that fits their needs.

## Features

- 📋 Gate listing with details (URLs, providers, models, pricing)
- 🌙 Dark theme, responsive design
- 📄 Pure static site — no build step required
- ⚡ Fast loading, minimal dependencies

## Project Structure

```
token2cash-site/
├── .github/
│   ├── scripts/
│   │   └── validate-gates.mjs   # Gate validation script
│   ├── workflows/
│   │   ├── validate-gate.yml    # PR validation CI
│   │   └── deploy.yml           # Auto-deploy on merge
│   └── ISSUE_TEMPLATE/
│       └── list-gate.md         # Gate listing issue template
├── index.html      # Main page
├── styles.css      # Styles
├── script.js       # JavaScript (loads gates.json)
├── gates.json      # Gate data
└── README.md       # This file
```

## Local Development

Just serve the files with any static server:

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .

# Or just open index.html in a browser
```

## Deployment to Cloudflare Pages

### Option 1: Git Integration (Recommended)

1. Push this folder to a GitHub/GitLab repo
2. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
3. Create a new project → Connect to Git
4. Select the repository
5. Configure:
   - **Build command:** (leave empty)
   - **Build output directory:** `/` or the folder name
6. Deploy!

### Option 2: Direct Upload

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Create a new project → Upload assets
3. Drag and drop all files (index.html, styles.css, script.js, gates.json)
4. Deploy!

### Custom Domain

After deployment:
1. Go to project settings → Custom domains
2. Add `token2.cash`
3. Cloudflare will auto-configure DNS (domain already on Cloudflare)

## Register Your Gate

Anyone can list their gate on token2.cash by submitting a pull request. The process is fully automated — a CI check validates your gate before merge, and the site updates automatically after merge.

### Step-by-step

1. **Fork** this repository
2. **Edit** `gates.json` — append your gate entry to the `gates` array
3. **Submit a Pull Request** to `main`
4. **Wait for CI** — the `Validate Gate PR` check will automatically:
   - Verify JSON syntax
   - Verify all required fields are present
   - Probe `GET <your-gate-url>/health` (must return 200)
   - Probe `GET <your-mint-url>/v1/info` (must return 200)
5. **Merge** — once approved and CI passes, the site deploys automatically

### gates.json Schema

Each entry in the `gates` array must have **all** of the following fields:

| Field | Type | Description |
|---|---|---|
| `name` | string | Short, unique name for your gate |
| `url` | string | Public HTTPS URL of your gate |
| `mint` | string | Public HTTPS URL of the Cashu mint backing this gate |
| `providers` | string[] | LLM providers routed through this gate (e.g. `["openrouter", "openai"]`) |
| `models` | string[] | Models available (e.g. `["gpt-4o", "claude-sonnet-4"]`) |
| `markup` | string | Markup percentage (e.g. `"0%"`, `"5%"`) |
| `description` | string | One or two sentences describing your gate |

Example entry:

```json
{
  "name": "my-gate",
  "url": "https://gate.example.com",
  "mint": "https://mint.example.com",
  "providers": ["openrouter"],
  "models": ["gpt-4o", "claude-sonnet-4"],
  "markup": "5%",
  "description": "Low-cost gate with OpenRouter access. 5% markup covers infrastructure."
}
```

### Requirements

- Your gate must be publicly accessible and respond to `GET /health` with HTTP 200.
- Your mint must be publicly accessible and respond to `GET /v1/info` with HTTP 200.
- Your gate must accept Cashu ecash payments.
- Keep the JSON valid — trailing commas and duplicate keys will fail validation.

## Future Enhancements

- [ ] Real-time status checks (online/offline)
- [ ] Search and filter
- [ ] Sort by markup/rating
- [x] ~~Gate submission form (GitHub issue template)~~ PR-based flow
- [ ] Multi-language support

## License

MIT
