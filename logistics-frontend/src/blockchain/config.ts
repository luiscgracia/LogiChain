import { http, createConfig } from 'wagmi'
import { anvil } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import LogisticsArtifact from '../../../out/LogisticsTracking.sol/LogisticsTracking.json'

// Leemos la dirección del contrato desde las variables de entorno de Vite
import deployment from '../../../broadcast/DeployLogistics.s.sol/31337/run-latest.json'
export const CONTRACT_ADDRESS = deployment.transactions[0].contractAddress as `0x${string}`;
// export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`;

export const ACTOR_ROLES = ['NONE', 'SENDER', 'CARRIER', 'HUB', 'RECIPIENT', 'INSPECTOR'];

export const ABI = LogisticsArtifact.abi as const;

export const config = createConfig({
  chains: [anvil],
  connectors: [injected()],		// para conectar con Metamask
  transports: {
    [anvil.id]: http('http://127.0.0.1:8545'),
  },
})

