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
import BackupUtil from '../../managers/BackupUtil';

const getManifest = (vault: Vault) => {
    console.log('getManifest');
    // DAS.getBackupManifest(vault).then((res) => {
    //     console.log('getBackupManifest res', res);
    // }).catch((err) => {
    //     console.log('getBackupManifest err', err);
    // });
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
    // DAS.uploadObjects(vault, objecst).then((res) => {
    //     console.log('uploadContacts res', res);
    // }).catch((err) => {
    //     console.log('uploadContacts err', err);
    // });
}

const getObjects = (vault: Vault, pks: string[]) => {
    console.log('getObjects');
    DAS.getObjects(vault, pks).then((res) => {
        console.log('getFiles res', res);
    }).catch((err) => {
        console.log('getFiles err', err);
    });

}
const logMissingRemotePks = async (backupUtil: BackupUtil) => {
    const remotePks = backupUtil.fetchManifest()
    const localPks = backupUtil.compileLocalPks()
    console.log('localPks', localPks)
    console.log('remotePks', await remotePks)
    const missingPks = backupUtil.getMissingRemotePks()
    console.log('missingPks', missingPks)
}
const uploadMissing = async (backupUtil: BackupUtil) => {
    await logMissingRemotePks(backupUtil)
    backupUtil.backupMissingObjects()
}
const uploadSingle = async (backupUtil: BackupUtil, contactsManager: ContactsManager) => {
    console.log('uploadSingle');
    const object = contactsManager.getContactsArray()[0].toDict()
    console.log(object)
    backupUtil.uploadObject(object)
}
const getBackupEvents = async (BackupUtil: BackupUtil) => {
    console.log('getBackupEvents');
    const events = await DAS.getBackupEvents(BackupUtil._vault)
    console.log(events)
}


const DevBackupScreen = () => {
    const { vault, manager } = useSessionContext();
    const backupUtil = manager.backupUtil

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
            <Pressable onPress={() => manager.backupUtil.compileLocalPks() } style={[ds.button, ds.purpleButton, tw`w-full`]}>
                <Text style={ds.buttonText}>Compile Local Pks</Text>
            </Pressable>
            <View style={tw`h-4`} />
            <Pressable onPress={() => logMissingRemotePks(backupUtil)} style={[ds.button, ds.greenButton, tw`w-full`]}>
                <Text style={ds.buttonText}>logMissingRemotePks</Text>
            </Pressable>
            <View style={tw`h-4`} />
            <Pressable onPress={() => uploadMissing(backupUtil)} style={[ds.button, ds.greenButton, tw`w-full`]}>
                <Text style={ds.buttonText}>Upload Missing</Text>
            </Pressable>
            <View style={tw`h-4`} />
            <Pressable onPress={() => uploadSingle(backupUtil, manager.contactsManager)} style={[ds.button, ds.blueButton, tw`w-full`]}>
                <Text style={ds.buttonText}>Upload Single</Text>
            </Pressable>
            <View style={tw`h-4`} />
            <Pressable onPress={() => getBackupEvents(backupUtil)} style={[ds.button, ds.blueButton, tw`w-full`]}>
                <Text style={ds.buttonText}>Get Backup Events</Text>
            </Pressable>
            <View style={tw`h-4`} />
            

        </MainContainer>
    );
};

export default DevBackupScreen;