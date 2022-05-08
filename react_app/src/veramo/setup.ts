import { createAgent, IDIDManager, IKeyManager, IResolver } from '@veramo/core'
import { DIDManager } from '@veramo/did-manager'
import { EthrDIDProvider } from '@veramo/did-provider-ethr'
import { WebDIDProvider } from '@veramo/did-provider-web'

import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'

import { KeyManager } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { CredentialIssuer, ICredentialIssuer } from '@veramo/credential-w3c'

const myStore = require('./myStore.ts')

var didStoreDatabase = new myStore.MyDidStore()
var keyStoreDatabase = new myStore.MyKeyStore()
var privateKeyStoreDatabase = new myStore.MyPrivateKeyStore()

// You will need to get a project ID from infura https://www.infura.io
const INFURA_PROJECT_ID = '3010b402343c4a02ad8cf9b8e7c9b8c0'

// La cosa que hay entre <> sirve para poder autocompletar en las variables
export const agent = createAgent<IResolver & IDIDManager & IKeyManager & ICredentialIssuer>({
  plugins: [
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        ...webDidResolver(),
      }),
    }),
    new DIDManager({
        store: didStoreDatabase,
        defaultProvider: 'did:ethr:ropsten',
        providers: {
          'did:ethr:ropsten': new EthrDIDProvider({
            defaultKms: 'local',
            network: 'ropsten',
            rpcUrl: 'https://ropsten.infura.io/v3/' + INFURA_PROJECT_ID,
            gas: 500000
          }),
          'did:ethr:rinkeby': new EthrDIDProvider({
            defaultKms: 'local',
            network: 'rinkeby',
            rpcUrl: 'https://rinkeby.infura.io/v3/' + INFURA_PROJECT_ID,
            gas: 500000
          }),
          'did:web': new WebDIDProvider({
            defaultKms: 'local'
          })
        }
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        }),
      }),
      new CredentialIssuer(),
      new KeyManager({
        store: keyStoreDatabase,
        kms: {
          local: new KeyManagementSystem(privateKeyStoreDatabase)
        }
      }),
  ],
})