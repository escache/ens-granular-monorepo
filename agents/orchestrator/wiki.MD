# Assembly Orchestrator

**Version:** 1.0.0

## Overview

The Assembly Orchestrator is the **control plane** for continuously assembling ENS Granular into enterprise-ready decentralized software. It runs the integration gate, reads assembly status, prioritizes work across workstreams, implements the highest-impact fix, and opens PRs.

Run this agent on a **schedule** (every 6 hours) or on **every push to main**.

## Key Capabilities

- **Integration gate** — build, contract tests, UI tests, lint
- **Prioritized planning** — writes `.agent/output/assembly-plan.md`
- **Status tracking** — updates `agents/ASSEMBLY_STATUS.md`
- **Autonomous fixes** — implements one high-impact item per run
- **PR automation** — opens draft PRs with gate results

## Required Inputs

| Input | Type | Description | Default |
|-------|------|-------------|---------|
| `repo` | string | Repository identifier | — |
| `branch` | string | Branch to assemble | `main` |
| `gitConnector` | connector | Git clone/push | — |
| `createPr` | string | Open PR after fixes | `true` |

## Required Secrets

- `bedrock_api_key` — LLM inference
- `github_pat` — PR creation via GitHub MCP

## Schedule (recommended)

```yaml
cron: "0 */6 * * *"  # every 6 hours
```

## Troubleshooting

### Gate always fails
Run locally: `chmod +x scripts/assembly-gate.sh && ./scripts/assembly-gate.sh`

### No PR created
Set `createPr` to `true` and verify `github_pat` has repo write access.
