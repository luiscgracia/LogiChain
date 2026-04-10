# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**LOGICHAIN v4** — An on-chain logistics traceability system for supply-chain traceability.
The core is a Solidity smart contract (`src/LogisticsTracking.sol`) that tracks the full lifecycle
of shipments: creation, checkpoints, incidents, cold-chain validation, and delivery confirmation.
The frontend is a single Vite + React SPA at `logistics-frontend/`.

The `web/` Next.js skeleton has been **removed** and no longer exists.

## Repository layout

```
/
├── src/LogisticsTracking.sol      # Main Solidity contract (v4, audited)
├── script/                        # Foundry broadcast scripts (deploy + demo seeds)
├── test/                          # Foundry unit & integration tests (87 total)
├── logistics-frontend/            # Vite + React frontend (LOGICHAIN v4 UI)
├── Makefile                       # make targets for common workflows
├── foundry.toml                   # Foundry config (optimizer, gas reports)
├── sync-contract.js               # Node script: broadcast → .env address sync
├── package.json                   # Root package (sync-contract deps)
└── .env                           # RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY
```

## Commands

### Smart Contract (Foundry — run from repo root)

```bash
forge build                         # Compile contracts → out/
forge test                          # Run all 87 tests with gas report
forge test --match-test <name>      # Run a single test (e.g. testRegisterSender)
forge test -vvvv                    # Verbose output for debugging reverts
forge clean                         # Remove build artifacts
```

### Local deployment with Anvil

```bash
anvil                               # Start local EVM node on port 8545
make deploy                         # Deploy LogisticsTracking to Anvil
make iniciar                        # Full demo: deploy + actors + 3 demo shipments
make act-env                        # Register actors and shipment #1 only
make chkpnt                         # Add checkpoints to shipment #1
make envio2                         # Create frozen-food shipment with cold chain
make insulina                       # Create insulin shipment with temperature violations
make Demo15Shipments                # Deploy + seed 15 varied demo shipments
make deploy-sepolia                 # Deploy to Sepolia (needs .env with RPC_URL etc.)
```

### Frontend (from `logistics-frontend/`)

```bash
npm run dev        # Start Vite dev server (port 5173)
npm run build      # TypeScript check + Vite production build
npm run lint       # ESLint
npm run preview    # Preview production build
```

> **Important**: run `forge build` before `npm run dev` — the frontend imports the ABI
> directly from `../../out/LogisticsTracking.sol/LogisticsTracking.json`.

## Smart Contract (`src/LogisticsTracking.sol`)

### Overview

Solidity `^0.8.24`, no inheritance, no external dependencies. Role-based access with 5 actor roles.
Only the deployer is admin; admin registers actors via `registerActor()`.
Contract is v4 — the result of a security audit; inline comments tag every fix with codes like
`[C-1]`, `[W-1]`, `[S-2]`, `[GAS-1]`, etc.

### Enums

- `ActorRole`: None, Sender, Carrier, Hub, Recipient, Inspector
- `ShipmentStatus`: Created, InTransit, AtHub, OutForDelivery, Delivered, Returned, Cancelled
- `IncidentType`: Delay, Damage, Lost, TempViolation, Unauthorized
- `CheckpointType`: Pickup, Hub, Transit, Delivery, Other

### Structs

- `Actor` — actorAddress, name, role, location, isActive
- `Shipment` — id, sender, recipient, product, origin, destination, dateCreated, dateDelivered,
  status, checkpointIds[], incidentIds[], requiresColdChain
- `Checkpoint` — id, shipmentId, actor, location, checkpointType, timestamp, notes,
  temperature (int256, Celsius × 10)
- `Incident` — id, shipmentId, incidentType, reporter, description, timestamp, resolved

### Key design decisions

- **Admin transfer**: Safe two-step path via `proposeAdmin()` + `acceptAdmin()`.
  One-step immediate path via `transferAdmin()` (use with care — cancels any pending proposal).
- **Actor lifecycle**: Admin calls `deactivateActor()` / `reactivateActor()`; both emit
  `ActorStatusChanged` for off-chain indexing.
- **Cold chain**: Temperature stored as `int256 × 10` (e.g. `45` = 4.5 °C).
  Valid range: `COLD_CHAIN_TEMP_MIN = 20` … `COLD_CHAIN_TEMP_MAX = 80` (2.0–8.0 °C).
  Pass `TEMPERATURE_NOT_SET` (`type(int256).min`) to skip validation for a checkpoint.
  An out-of-range reading automatically calls `_createIncident(TempViolation)`.
  Use `verifyTemperatureCompliance(shipmentId)` to check overall cold-chain compliance.
- **Actor assignment**: An actor can interact with a shipment only if they created it or called
  `updateShipmentStatus()` for it. Enforced by `_actorHasShipment` mapping (O(1), [GAS-1]).
  Use `getActorShipments(address)` to list an actor's shipment IDs.
- **Shipment status flow**: Created → InTransit → AtHub → OutForDelivery → Delivered.
  Terminal states: Delivered, Cancelled, Returned. Cancellation is only allowed from Created
  or AtHub. `Delivered` can only be set via `confirmDelivery()`, not `updateShipmentStatus()`.
- **Limits**: max 200 checkpoints and 50 incidents per shipment.
- **Checks-Effects-Interactions**: Applied in `recordCheckpoint` and `confirmDelivery` [C-1].
- **Pagination**: `getShipmentCheckpoints(id, offset, limit)` and
  `getShipmentIncidents(id, offset, limit)` — prefer these for on-chain calls.
  `getAllShipmentCheckpoints` / `getAllShipmentIncidents` are for off-chain use only.
- **Custom errors**: All reverts use custom errors (no `require` strings) for gas efficiency [GAS-5].
  Full list in `src/LogisticsTracking.sol` lines 75–95.
- **Optimizer**: `foundry.toml` sets `optimizer = true`, `optimizer_runs = 200` to keep deployed
  bytecode under the 24 KB Spurious Dragon limit.

### Public functions reference

**Admin**
- `proposeAdmin(address)` — two-step transfer step 1
- `acceptAdmin()` — two-step transfer step 2 (called by proposed admin)
- `transferAdmin(address)` — immediate one-step transfer (cancels any pending proposal)

**Actors**
- `registerActor(name, role, location, address)` — admin only
- `deactivateActor(address)` — admin only; emits `ActorStatusChanged`
- `reactivateActor(address)` — admin only; emits `ActorStatusChanged`
- `getActor(address) → Actor`

**Shipments**
- `createShipment(recipient, product, origin, destination, requiresColdChain) → id` — Sender only
- `getShipment(id) → Shipment`
- `updateShipmentStatus(shipmentId, newStatus)` — Carrier or Hub only; cannot set Delivered
- `confirmDelivery(shipmentId)` — Recipient only; sets Delivered + dateDelivered
- `cancelShipment(shipmentId)` — Sender only; valid from Created or AtHub

**Checkpoints**
- `recordCheckpoint(shipmentId, location, checkpointType, notes, temperature) → cpId` — assigned actors
- `getCheckpoint(cpId) → Checkpoint`
- `getShipmentCheckpoints(id, offset, limit) → Checkpoint[]` — paginated
- `getAllShipmentCheckpoints(id) → Checkpoint[]` — off-chain only

**Incidents**
- `reportIncident(shipmentId, type, description) → incId` — assigned actors
- `resolveIncident(incidentId)` — admin only
- `getIncident(incidentId) → Incident`
- `getShipmentIncidents(shipmentId, offset, limit) → Incident[]` — paginated
- `getAllShipmentIncidents(shipmentId) → Incident[]` — off-chain only
- `isIncidentResolved(incidentId) → bool`

**Auxiliary**
- `getActorShipments(address) → uint256[]`
- `verifyTemperatureCompliance(shipmentId) → bool`
- `nextShipmentId()`, `nextCheckpointId()`, `nextIncidentId()` — counter getters

### Events

- `ShipmentCreated(shipmentId, sender, recipient, product)`
- `CheckpointRecorded(checkpointId, shipmentId, checkpointType, actor)`
- `ShipmentStatusChanged(shipmentId, newStatus)`
- `IncidentReported(incidentId, shipmentId, incidentType)`
- `IncidentResolved(incidentId)`
- `DeliveryConfirmed(shipmentId, recipient, timestamp)`
- `ActorRegistered(actorAddress, name, role)`
- `ActorStatusChanged(actorAddress, isActive)`
- `AdminTransferProposed(proposedAdmin)`
- `AdminTransferAccepted(newAdmin)`

### Custom errors

`OnlyAdmin`, `NotPendingAdmin`, `ActorInactive`, `ShipmentNotFound(id)`,
`AlreadyRegisteredAndActive`, `InvalidAddress`, `InvalidRole`, `OnlySendersCanCreate`,
`OnlyCarrierOrHub`, `CannotSetDeliveredDirectly`, `OnlyRecipientCanConfirm`,
`AlreadyDelivered`, `OnlySenderCanCancel`, `CannotCancelAfterTransit`,
`AlreadyClosedShipment`, `MaxCheckpointsReached`, `MaxIncidentsReached`,
`CheckpointNotFound(id)`, `IncidentNotFound(id)`, `ActorDoesNotExist`,
`ActorNotAssignedToShipment`

## Frontend (`logistics-frontend/`)

### Stack

- React 19 + Vite 8 + TypeScript 5.9
- wagmi v3 + viem v2 (blockchain reads/writes)
- TanStack Query v5 (caching, invalidation)
- Tailwind CSS v4 (utility classes)
- MetaMask (injected connector) — only supported wallet
- Configured for Anvil (chain id 31337, `http://127.0.0.1:8545`) only

### Entry point

`src/main.tsx` wraps the app in `WagmiProvider` + `QueryClientProvider` (with `reconnectOnMount=false`).
`src/App.tsx` handles wallet connection, tab routing, dark-mode toggle, header, and footer.

### Tabs

| Tab | Component file | Contract functions used |
|-----|---------------|------------------------|
| Actores | `panels/ActorsPanel.tsx` | `registerActor`, `getActor`, `deactivateActor`, `reactivateActor`, `transferAdmin` |
| Envíos | `panels/ShipmentsPanel.tsx` | `createShipment`, `getShipment`, `nextShipmentId` |
| Operaciones | `panels/OperationsPanel.tsx` | `recordCheckpoint`, `updateShipmentStatus`, `confirmDelivery`, `cancelShipment`, `reportIncident`, `resolveIncident`, `getShipmentIncidents` |
| Trazabilidad | `panels/TraceabilityPanel.tsx` | `getShipment`, `getShipmentCheckpoints`, `getShipmentIncidents`, `verifyTemperatureCompliance` |

### Panel details

**`panels/ActorsPanel.tsx`** — `ActorsTab` orchestrates three sub-components:
- `RolesGovernance` — register new actor form; optimistically adds address to localStorage before tx confirms.
- `TransferAdmin` — calls `transferAdmin()` with a confirmation modal; irreversible warning displayed.
- `ActorsList` — reads known addresses from localStorage, fetches `getActor()` on-chain per row;
  filter by all / active / inactive. Per-row "Desactivar" / "Reactivar" button calls
  `deactivateActor` / `reactivateActor`. "Sync desde chain" re-fetches all `ActorRegistered` events.

**`panels/ShipmentsPanel.tsx`** — two exported components:
- `ShippingPanel` — create shipment form with `LocationSelect` for origin/destination and a cold-chain checkbox.
- `ShipmentsTable` — lists all shipment IDs (from `nextShipmentId`), filterable by ID or status badge.
  Each row is a `ShipmentRow` that reads `getShipment(id)` on-chain.

**`panels/OperationsPanel.tsx`** — operations on existing shipments:
- Add checkpoint: ID, location (`LocationSelect`), type, notes, temperature (or "Sin lectura" checkbox
  which sends `TEMPERATURE_NOT_SET`).
- Update status: ID + new status selector (Carrier/Hub only; Delivered excluded from list).
- Confirm delivery: ID; checks for open incidents first via `getShipmentIncidents` and blocks if any exist.
- Cancel shipment: ID.
- Report incident: ID, type, description.
- Resolve incident: incident ID (admin only).
- All operations simulate via `publicClient.simulateContract()` before opening MetaMask.

**`panels/TraceabilityPanel.tsx`** — traceability view:
- Query by shipment ID; displays shipment header, checkpoint timeline, incident list, cold-chain badge.
- **PDF export** via jsPDF + autoTable loaded dynamically from CDN (not bundled); saves as
  `trazabilidad-envio-<id>.pdf` in landscape letter format.

**`panels/LocationSelect.tsx`** — two chained `<select>` dropdowns (department → municipality)
  backed by `data/colombia-locations.json`. Produces a string in the format `"Municipio, Departamento"`.

### Blockchain config (`src/blockchain/config.ts`)

- `CONTRACT_ADDRESS` — **hardcoded** at `0x5FbDB2315678afecb367f032d93F642f64180aa3`.
  Update this constant manually after redeploying. (The `VITE_CONTRACT_ADDRESS` env-var path is
  commented out.)
- `ABI` — imported from `../../../out/LogisticsTracking.sol/LogisticsTracking.json`.
  Run `forge build` before starting the frontend.
- `ACTOR_ROLES` — `['NONE','SENDER','CARRIER','HUB','RECIPIENT','INSPECTOR']` (index == enum value)
- wagmi `config` — `anvil` chain, `injected()` connector, HTTP transport to `127.0.0.1:8545`.
- `blockchain/LogisticsABI.json.json` — redundant local ABI copy; used as fallback reference.

### Shared utilities (`src/shared.tsx`)

**Constants**: `TEMPERATURE_NOT_SET`, `TEMP_LOW_TENTHS` (20), `TEMP_HIGH_TENTHS` (80),
`CHECKPOINT_TYPES`, `SHIPMENT_STATUSES`, `INCIDENT_TYPES`, `STATUS_COLORS`.

**Hooks**:
- `useToast()` — ephemeral toast queue (4.5 s auto-dismiss); types: `ok`, `err`, `info`.
- `useTx(push)` — wraps `useWriteContract` + `useWaitForTransactionReceipt`; invalidates all
  TanStack Query caches on success; surfaces errors via `parseContractError`.
- `useKnownActors()` — reads/writes actor address list in `localStorage` under the key
  `actors_<CONTRACT_ADDRESS>`.
- `useDark()` — consumes `DarkContext`.

**Error decoding**: `parseContractError(error)` extracts the 4-byte selector from the viem error
string (`custom error 0x…`) and maps it to a human-readable Spanish message via `ERROR_SELECTORS`
+ `CONTRACT_ERRORS` maps. Falls back to MetaMask rejection detection and then raw error message.

**UI helpers**: `btnPrimary(disabled?)`, `btnDanger(disabled?)`, `btnSecondary`,
`inputStyle(dark, error?)`, `labelStyle(dark)`, `TH_STYLE`, `TD_STYLE`.

**Base components**: `<Card accent>`, `<SectionHeader>`, `<FieldError msg>`, `<Toasts toasts>`.

**Formatters**: `shortAddr(address)`, `isValidAddress(str)`, `tempDisplay(raw)`,
`tempToTenths(raw)`, `tempIsUnset(raw)`, `tempIsOutOfRange(raw)`, `fmtTs(timestamp)`.

### Write pattern (all panels)

1. Validate form client-side.
2. `publicClient.simulateContract(…)` — catch and show Spanish error via `parseContractError`.
3. `useTx.write(…)` — opens MetaMask. On confirmation, invalidates TanStack Query cache.

## Scripts (`script/`)

All are Foundry broadcast scripts. Run with `forge script … --rpc-url … --broadcast`.

- `DeployLogistics.s.sol` — deploys the contract (deterministically to
  `0x5FbDB2315678afecb367f032d93F642f64180aa3` on a fresh Anvil instance).
- `SetupDemo.s.sol` — registers demo actors and creates shipment #1.
- `CheckpointsDemo.s.sol` — adds checkpoints to a shipment. Invoke with
  `--sig "run(uint256)" <id>`.
- `AlimentosCongelados.s.sol` — creates shipment #2 (frozen food, cold chain, full lifecycle
  through delivery).
- `ViolacionTemperatura.s.sol` — creates shipment #3 (insulin) with 2 out-of-range temperature
  readings that auto-generate `TempViolation` incidents.
- `Demo15Shipments.s.sol` — registers actors and seeds 15 varied demo shipments covering all
  statuses, cold-chain scenarios, and incident types. Used by `make Demo15Shipments`.

## Tests (`test/`)

- `LogisticsTrackingTest.t.sol` — **72 unit tests**: full coverage of all contract functions,
  access control, state transitions, cold-chain validation, and custom errors.
- `LogisticsTrackingTest15.t.sol` — **15 integration tests**: validates the 15-shipment demo
  scenario end-to-end.
- `ejemplos LogisticsTrackingTest15.t.ods` — spreadsheet with expected test data for the 15-shipment
  scenario (reference doc, not executed by Foundry).

Run all 87 tests: `forge test --gas-report`

## Deployment sync flow

After `make deploy`, `sync-contract.js` (Node CJS script) reads
`broadcast/DeployLogistics.s.sol/31337/run-latest.json`, extracts the deployed contract address,
and writes `VITE_CONTRACT_ADDRESS=<address>` to the root `.env`. The frontend **ignores this** —
the address is hardcoded in `logistics-frontend/src/blockchain/config.ts`. Update it manually.

## Environment

`.env` (repo root):
- `RPC_URL` — Sepolia RPC endpoint (for `make deploy-sepolia`)
- `PRIVATE_KEY` — deployer private key for Sepolia
- `ETHERSCAN_API_KEY` — for contract verification on Sepolia
- Default values point to Anvil account #0 (`ANVIL_PK = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`)

`foundry.toml` key settings:
- `optimizer = true`, `optimizer_runs = 200`
- `gas_reports = ["LogisticsTracking"]`
- `ignored_error_codes = [5574]` (suppresses bytecode-size warnings during local tests)

## Notes for AI agents

- Always run `forge build` before touching frontend code; the ABI import path resolves to `out/`.
- Contract address `0x5FbDB2315678afecb367f032d93F642f64180aa3` is only valid on a fresh Anvil
  instance (nonce-deterministic). If Anvil has been used before, redeploy or reset with `anvil --reset`.
- All UI text is in Spanish. Error messages, labels, and toasts must remain in Spanish.
- Temperature values in the contract are `int256` stored as Celsius × 10. The UI converts with
  `Math.round(parseFloat(temp) * 10)` before sending and displays with `tempDisplay(raw)`.
- `useTx` in `shared.tsx` is the canonical write hook — use it for all contract writes.
- Tailwind CSS v4 classes are used alongside inline styles; do not convert one to the other
  wholesale as both coexist intentionally.
