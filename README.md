# token2.cash

Cashu Gate Aggregator — A directory of services that accept Cashu ecash tokens for LLM API access.

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

## License

MIT
