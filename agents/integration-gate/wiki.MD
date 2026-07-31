# Integration Gate

Runs `scripts/assembly-gate.sh` and updates assembly status. Use as a **pre-merge check** or as the first stage before other workstream agents.

## Checks

- `npm ci`
- `npm run build`
- `npm run test:contracts`
- `npm run test:ui -- --run`
- `npm run lint`

## Output

- `.agent/output/gate-report.json`
- `.agent/output/gate-remediation.md` (on failure)
