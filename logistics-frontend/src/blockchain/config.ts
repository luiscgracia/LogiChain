import { http, createConfig } from 'wagmi'
import { anvil } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import LogisticsArtifact from '../../../out/LogisticsTracking.sol/LogisticsTracking.json'

import deployment from '../../../broadcast/DeployLogistics.s.sol/31337/run-latest.json'
export const CONTRACT_ADDRESS = deployment.transactions[0].contractAddress as `0x${string}`;

export const ACTOR_ROLES = ['NONE', 'SENDER', 'CARRIER', 'HUB', 'RECIPIENT', 'INSPECTOR'];

export const ABI = LogisticsArtifact.abi;

export const config = createConfig({
  chains: [anvil],
  connectors: [injected()],
  multiInjectedProviderDiscovery: true,
  transports: {
    [anvil.id]: http('http://127.0.0.1:8545'),
  },
})