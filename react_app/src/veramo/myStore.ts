import { IIdentifier, IKey, ManagedKeyInfo } from '@veramo/core'
import { AbstractDIDStore } from '@veramo/did-manager'
import { AbstractKeyStore, AbstractPrivateKeyStore, ManagedPrivateKey } from '@veramo/key-manager'
import { ImportablePrivateKey } from '@veramo/key-manager/build/abstract-private-key-store'

import cryptoJs from 'crypto-js'

function getLocalStorage(keyName: string) {
  var objectStorage = []
  var stringStorage = localStorage.getItem(keyName)
  if (stringStorage !== null) {
    stringStorage = cryptoJs.AES.decrypt(stringStorage, 'prova').toString(cryptoJs.enc.Utf8)
    if (stringStorage !== null) {
      objectStorage = JSON.parse(stringStorage)
    }
  }
  return objectStorage
}

async function setLocalStorage(keyName: string, value: object) {
  const lStorage = getLocalStorage(keyName)
  lStorage.push(value)
  var stringStorage = JSON.stringify(lStorage)
  var cipherStorage = cryptoJs.AES.encrypt(stringStorage, 'prova').toString()
  localStorage.setItem(keyName, cipherStorage)
}

class MyPrivateKeyStore implements AbstractPrivateKeyStore {
  import(args: ImportablePrivateKey): Promise<ManagedPrivateKey> {
    return new Promise<ManagedPrivateKey>((resolve, reject) => {
      if (args.alias !== undefined) {
        let managedPrivateKey: ManagedPrivateKey = {
          alias: args.alias,
          type: args.type,
          privateKeyHex: args.privateKeyHex
        }
        setLocalStorage('MyPrivateKeyStore', managedPrivateKey)
        resolve(managedPrivateKey) // resolve perquè és una promise
      }
    })
    // throw new Error('Method import from MyPrivateKeyStore not implemented.')
  }
  get(args: { alias: string }): Promise<ManagedPrivateKey> { // TODO ESTO HACE REJECCT PORQUE FALTA EL MyPrivateKeyStore
    return new Promise<ManagedPrivateKey>((resolve, reject) => {
      const lStorage = getLocalStorage('MyPrivateKeyStore')
      var index = lStorage.findIndex((x: any) => x.alias === args.alias)
      if (index !== -1) {
        resolve(lStorage[index])
      } else {
        reject()
      }
    })
  }
  delete(args: { alias: string }): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const lStorage = getLocalStorage('MyPrivateKeyStore')
      var index = lStorage.findIndex((x: any) => x.alias === args.alias)
      if (index !== -1) {
        lStorage.splice(index, 1)
        setLocalStorage('MyPrivateKeyStore',lStorage)
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }
  list(args: {}): Promise<ManagedPrivateKey[]> {
    return new Promise<ManagedPrivateKey[]>((resolve, reject) => {
      const lStorage = getLocalStorage('MyPrivateKeyStore')
      if (lStorage.length > 0) {
        resolve(lStorage)
      } else {
        resolve([])
      }
    })
  }
}

class MyKeyStore implements AbstractKeyStore {
  import(args: Partial<IKey>): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      setLocalStorage('MyKeyStore', args)
      resolve(true)
    })
  }
  get(args: { kid: string }): Promise<IKey> {
    return new Promise<IKey>((resolve, reject) => {
      const lStorage = getLocalStorage('MyKeyStore')
      var index = lStorage.findIndex((x: any) => x.kid === args.kid)
      if (index !== -1) {
        resolve(lStorage[index])
      } else {
        reject()
      }
    })
  }
  delete(args: { kid: string }): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const lStorage = getLocalStorage('MyKeyStore')
      var index = lStorage.findIndex((x: any) => x.kid === args.kid)
      if (index !== -1) {
        lStorage.splice(index, 1)
        setLocalStorage('MyKeyStore',lStorage)
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }
  list(args: {}): Promise<ManagedKeyInfo[]> {
    return new Promise<ManagedKeyInfo[]>((resolve, reject) => {
      const lStorage = getLocalStorage('MyKeyStore')
      if (lStorage.length > 0) {
        resolve(lStorage)
      } else {
        resolve([])
      }
    })
  }
}

class MyDidStore implements AbstractDIDStore {
  import(args: IIdentifier): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      setLocalStorage('MyDidStore', args)
      resolve(true)
    })
  }
  get(args: { did: string }): Promise<IIdentifier>
  get(args: { alias: string; provider: string }): Promise<IIdentifier>
  get(args: any): Promise<IIdentifier> {
    return new Promise<IIdentifier>((resolve, reject) => {
      const lStorage = getLocalStorage('MyDidStore')
      var index = -1
      if (args.alias !== undefined && args.alias !== '') {
        index = lStorage.findIndex((x: any) => x.alias === args.alias)
      }
      if (args.did !== undefined && args.did !== '') {
        index = lStorage.findIndex((x: any) => x.did === args.did)
      }
      if (index !== -1) {
        resolve(lStorage[index])
      } else {
        reject()
      }
    })
  }
  delete(args: { did: string }): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const lStorage = getLocalStorage('MyDidStore')
      var index = lStorage.findIndex((x: any) => x.did === args.did)
      if (index !== -1) {
        lStorage.splice(index, 1)
        setLocalStorage('MyDidStore',lStorage)
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }
  list(args: { alias?: string | undefined; provider?: string | undefined }): Promise<IIdentifier[]> {
    return new Promise<IIdentifier[]>((resolve, reject) => {
      const lStorage = getLocalStorage('MyDidStore')
      const identifiers = []
      if (args.alias !== undefined && args.provider !== undefined){
        lStorage.forEach(element => {
          if (element.alias === args.alias && element.provider === args.provider) {
            identifiers.push(element)
          }
        });
        resolve(identifiers)
      }
      if (args.alias !== undefined){
        lStorage.forEach(element => {
          if (element.alias === args.alias) {
            identifiers.push(element)
          }
        });
        resolve(identifiers)
      }
      if (args.provider !== undefined){
        lStorage.forEach(element => {
          if (element.provider === args.provider) {
            identifiers.push(element)
          }
        });
        resolve(identifiers)
      }
      if (lStorage.length > 0) {
        resolve(lStorage)
      } else {
        resolve([])
      }
    })
  }
}

export { MyPrivateKeyStore, MyKeyStore, MyDidStore }