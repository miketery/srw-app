import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';

import MainContainer from '../../components/MainContainer';
import ds from '../../assets/styles';
import tw from '../../lib/tailwind';

import DAS from '../../services/DigitalAgentService';
import { useSessionContext } from '../../contexts/SessionContext';
import VaultManager from '../../managers/VaultManager';
import Vault from '../../models/Vault';
import ContactsManager from '../../managers/ContactsManager';
import BackupManager from '../../managers/BackupManager';

const getManifest = (vault: Vault) => {
    console.log('getManifest');
    DAS.getBackupManifest(vault).then((res) => {
        console.log('getBackupManifest res', res);
    }).catch((err) => {
        console.log('getBackupManifest err', err);
    });
}

const uploadContacts = (vault: Vault, manager: VaultManager) => {
    console.log('uploadContacts');
    const contactsManager: ContactsManager = manager.contactsManager;
    const objecst = contactsManager.getContactsArray().map((contact) => {
        return {
            pk: contact.pk,
            data: contact.name,
        }
    })
    console.log(objecst)
    DAS.uploadObjects(vault, objecst).then((res) => {
        console.log('uploadContacts res', res);
    }).catch((err) => {
        console.log('uploadContacts err', err);
    });
}

const getObjects = (vault: Vault, pks: string[]) => {
    console.log('getObjects');
    DAS.getObjects(vault, pks).then((res) => {
        console.log('getFiles res', res);
    }).catch((err) => {
        console.log('getFiles err', err);
    });

}
const logMissingRemotePks = async (backupManager: BackupManager) => {
    const remotePks = backupManager.fetchManifest()
    const localPks = backupManager.compileLocalPks()
    console.log('localPks', localPks)
    console.log('remotePks', await remotePks)
    const missingPks = backupManager.getMissingRemotePks()
    console.log('missingPks', missingPks)
}
const uploadMissing = async (backupManager: BackupManager) => {
    await logMissingRemotePks(backupManager)
    backupManager.backupMissingObjects()
}


const DevBackupScreen = () => {
    const { vault, manager } = useSessionContext();
    const backupManager = manager.backupManager


    return (
        <MainContainer buttonRow={null} header='Dev Backup'>
            <Pressable onPress={() => getManifest(vault)} style={[ds.button, ds.blueButton]}>
                <Text style={ds.buttonText}>Get Manifest</Text>
            </Pressable>
            <View style={tw`h-4`} />
            <Pressable onPress={() => uploadContacts(vault, manager)} style={[ds.button, ds.greenButton]}>
                <Text style={ds.buttonText}>Upload Contacts</Text>
            </Pressable>
            <View style={tw`h-4`} />
            <Pressable onPress={() => getObjects(vault, ['c__bob', 'c__dan', 'c__charlie'])} style={[ds.button, ds.blueButton]}>
                <Text style={ds.buttonText}>Get Contacts</Text>
            </Pressable>
            <View>
                <Text style={ds.text2xl}>Backup Manager</Text>
            </View>
            <Pressable onPress={() => manager.backupManager.compileLocalPks()} style={[ds.button, ds.purpleButton, tw`w-full`]}>
                <Text style={ds.buttonText}>Compile Local Pks</Text>
            </Pressable>
            <View style={tw`h-4`} />
            <Pressable onPress={() => logMissingRemotePks(backupManager)} style={[ds.button, ds.greenButton, tw`w-full`]}>
                <Text style={ds.buttonText}>logMissingRemotePks</Text>
            </Pressable>
            <View style={tw`h-4`} />
            <Pressable onPress={() => uploadMissing(backupManager)} style={[ds.button, ds.greenButton, tw`w-full`]}>
                <Text style={ds.buttonText}>Upload Missing</Text>
            </Pressable>
            <View style={tw`h-4`} />
            

        </MainContainer>
    );
};

export default DevBackupScreen;