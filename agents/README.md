# ENS Granular Assembly Agents

Harness AI agents that **continuously assemble** the ENS Granular monorepo into enterprise-ready decentralized software. Each agent owns a workstream from the [enterprise readiness review](https://github.com/escache/ens-granular-monorepo); the orchestrator coordinates them on a schedule.

## Architecture

```
                    ┌─────────────────────────┐
                    │   Assembly Orchestrator  │  ← every 6h or on push
                    │   (assess → plan → fix)  │
                    └───────────┬─────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Integration Gate │   │ Contracts       │   │ UI Integration  │
│ build/test/lint  │   │ Hardening       │   │ delegate wiring │
└─────────────────┘   └─────────────────┘   └─────────────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                ▼
                    ┌─────────────────────────┐
                    │  Enterprise Readiness    │
                    │  scorecard + compliance  │
                    └─────────────────────────┘
```

## Agents

| Agent | Directory | Purpose |
|-------|-----------|---------|
| **Assembly Orchestrator** | `orchestrator/` | Runs gate, plans work, implements top fix, opens PRs |
| **Integration Gate** | `integration-gate/` | Build + test + lint; publishes `gate-report.json` |
| **Contracts Hardening** | `contracts-hardening/` | Critical Solidity fixes, tests, audit prep |
| **UI Integration** | `ui-integration/` | Wire AppContext, addresses, errors, a11y |
| **CLI Implementation** | `cli-implementation/` | Real viem commands; no fake success |
| **Docs Reconciliation** | `docs-reconciliation/` | Truth-aligned docs + Docusaurus build |
| **Enterprise Readiness** | `enterprise-readiness/` | Scorecard and procurement-facing gaps |

## Shared Files

| File | Role |
|------|------|
| `assembly-manifest.json` | Workstream definitions and dependencies |
| `ASSEMBLY_STATUS.md` | Living status tracker (agents update each run) |
| `../scripts/assembly-gate.sh` | Local + CI validation script |
| `.agent/output/*` | Agent handoff artifacts (gitignored) |

## Deploy to Harness

### 1. Prerequisites

Create secrets in Harness:

- `bedrock_api_key` — LLM inference
- `github_pat` — GitHub MCP (PR creation)
- `ethereum_rpc_url` — (optional) for contract fork tests

Create connectors:

- Git connector for `escache/ens-granular-monorepo`

### 2. Create agents from templates

For each directory under `agents/` (except root files), use the Harness MCP `harness_create` tool:

```
resource_type: agent
body:
  uid: ens_granular_assembly_orchestrator
  name: ENS Granular Assembly Orchestrator
  spec: <contents of agents/orchestrator/pipeline.yaml>
  wiki: <contents of agents/orchestrator/wiki.MD>
```

Repeat for: `integration_gate`, `contracts_hardening`, `ui_integration`, `cli_implementation`, `docs_reconciliation`, `enterprise_readiness`.

### 3. Schedule continuous assembly

**Option A — Cron trigger (recommended)**

Run the orchestrator every 6 hours:

```yaml
# Harness trigger on agent ens_granular_assembly_orchestrator
cron: "0 */6 * * *"
inputs:
  repo: escache/ens-granular-monorepo
  branch: main
  createPr: "true"
```

**Option B — Webhook on push to main**

Trigger orchestrator after merges to keep `main` assembly-green.

**Option C — Pipeline chain**

Nightly pipeline stages:

1. Integration Gate agent
2. Parallel: Contracts + UI + CLI + Docs agents (only if gate failed relevant checks)
3. Enterprise Readiness agent

### 4. Manual run

```bash
# Local gate (no Harness required)
chmod +x scripts/assembly-gate.sh
./scripts/assembly-gate.sh
```

## Workstream Dependencies

From `assembly-manifest.json`:

```
integration-gate
    ├── contracts-hardening ──┐
    ├── ui-integration ───────┼── enterprise-readiness
    ├── cli-implementation ───┤
    └── docs-reconciliation ──┘
```

## Definition of Done (industry deployment)

The assembly pipeline is complete when:

- [ ] Integration gate passes on `main`
- [ ] Critical contract issues resolved or explicitly deferred with ADR
- [ ] UI end-to-end: factory → delegate selection → all tabs functional
- [ ] CLI commands perform real on-chain ops or fail explicitly
- [ ] Docs match code; no phantom features
- [ ] Enterprise scorecard ≥ 4/5 with audit scheduled
- [ ] Reference mainnet/Sepolia deployments documented

## Adding a New Workstream

1. Add entry to `assembly-manifest.json`
2. Create `agents/<name>/` with `metadata.json`, `pipeline.yaml`, `wiki.MD`
3. Add row to `ASSEMBLY_STATUS.md`
4. Register agent in Harness
5. Update orchestrator task to dispatch the new workstream
