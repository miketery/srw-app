import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from 'axios'

import { ENDPOINTS } from '../config';

const __SESSION = {
    auth_token: null,
    user: null,
}

const setAxiosAuthToken = (auth_token) => {
    axios.defaults.headers.common['Authorization'] = `Token ${auth_token}`;
}

const SessionManager = {
    setAuthToken: (auth_token) => {
        __SESSION.auth_token = auth_token
        setAxiosAuthToken(auth_token);
        AsyncStorage.setItem('auth_token', auth_token)
    },
    getAuthToken: () => __SESSION.auth_token,
    setUser: (user) => __SESSION.user = user,
    getUser: () => __SESSION.user,
    init: async () => {
        // get auth_token from AsyncStorage (web: localStorage)
        return AsyncStorage.getItem('auth_token').then((auth_token) => {
            if(auth_token != null) {
                __SESSION.auth_token = auth_token;
                setAxiosAuthToken(auth_token);
            }
        })
    },
    // tokenHeaders: () => {return {headers: {Authorization: `Token ${__SESSION.auth_token}`}}},
    checkSession: async () => {
        console.log('[SessionManager] checkSession')
        // console.log(SessionManager.tokenHeaders())
        if(__SESSION.auth_token == null) {
            return false;
        } else {
            return axios.get(ENDPOINTS.user)
                .then((response) => {
                    SessionManager.setUser(response.data);
                    return true;
                }).catch((error) => {
                    if(error.response.code == 401) {
                        delete axios.defaults.headers.common["Authorization"];
                        console.log('Warning: auth token invalid, 401')
                        SessionManager.unsetSession();
                        return false;
                    } else {
                        // something else has gone wrong
                        console.log(error)
                        return false;
                    }
                })
        }
    },
    unsetSession: () => {
        __SESSION.auth_token = null;
        __SESSION.user = null;
        AsyncStorage.removeItem('auth_token');
    },
    logout: () => {
        axios.post(ENDPOINTS.logout, {}).then((response) => {
            console.log(response)
        }).catch((error) => {
            console.log(error)
        })
        SessionManager.unsetSession();
    },
    login: (email, password, success, failed) => {
        console.log('[SessionManager] login()', email)
        delete axios.defaults.headers.common["Authorization"];
        axios.post(ENDPOINTS.login, {email, password}).then((response) => {
            SessionManager.setAuthToken(response.data.auth_token);
            return SessionManager.checkSession();
        }).then((out) => {
            if(out)
                success()
            else {
                console.log('Something went wrong with check session aafter login')
                failed('Something unexpected happend.')
            }
        }).catch((data) => {
            console.log(data.response.data)
            failed('Could not login, wrong email and/or password.');
        })
    },
}

Object.freeze(SessionManager);

export default SessionManager;