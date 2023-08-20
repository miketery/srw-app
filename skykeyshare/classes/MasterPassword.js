import AsyncStorage from '@react-native-async-storage/async-storage'
import nacl from 'tweetnacl'


const MASTER_PASWORD_HASH = 'master_password_hash'

export class MasterPassword {
    state = {
        'password_set': false,
    }
    password_hash = null

    constructor() {
        console.log('MasterPassword constructor()')
        // const pw_hash = await AsyncStorage.getItem(MASTER_PASWORD_HASH);
        const getData = async () => {
            try {
              const pw_hash = await AsyncStorage.getItem(MASTER_PASWORD_HASH)
              console.log('Password: ' + pw_hash)
              this.password_hash = pw_hash
              return pw_hash != null ? pw_hash : null
            } catch(e) {
                console.log('Error fetching pw_hash from async storage')
                console.log(e)
            }
        }
        const a = getData();
    }
    getPasswordHash(){
        
    }
    setPassword(pw) {
        this.password_hash = nacl.hash(pw)
        this.state.password_set = true
        console.log(this.password_hash);
        const setData = async () => {
            try {
                await AsyncStorage.setItem(MASTER_PASWORD_HASH, this.password_hash);
            } catch(e) {
                console.log('Error setting password hash to async storage');
            }
        }
    }
}