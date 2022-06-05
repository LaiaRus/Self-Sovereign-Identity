import cryptoJs from "crypto-js"

export module localStorageManagement {
    let key = ''
    export function getLocalStorage(keyName: string) {
        var objectStorage = []
        var stringStorage = localStorage.getItem(keyName)
        if (stringStorage !== null) {
          stringStorage = cryptoJs.AES.decrypt(stringStorage, key).toString(cryptoJs.enc.Utf8)
          if (stringStorage !== null) {
            objectStorage = JSON.parse(stringStorage)
          }
        }
        return objectStorage
      }
      
      export async function setLocalStorage(keyName: string, value: object) {
        const lStorage = getLocalStorage(keyName)
        lStorage.push(value)
        var stringStorage = JSON.stringify(lStorage)
        var cipherStorage = cryptoJs.AES.encrypt(stringStorage, key).toString()
        localStorage.setItem(keyName, cipherStorage)
      }
}

