import { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import { Card, Info, MyTextInput, TopGradient, Warning } from '../../components';
import { GoBackButton } from '../../components';

import DigitalAgentService from '../../services/DigitalAgentService'
import { MOCKDATA } from '../../config';
import base58 from 'bs58';

const BOB_DID = 'did:arx:EtCnZqvnQ4qNq1wV5yjK2hMTrg1i3iPFESrD6w7mGP3E'

const ContactAddScreen = (props) => {
    const [shortCodeOrDid, setShortCodeOrDid] = useState(MOCKDATA ? BOB_DID : '')
    const [contactInfo, setContactInfo] = useState(null)
    const [notFound, setNotFound] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [inviteSuccess, setInviteSuccess] = useState(false)
    const [error, setError] = useState(false)

    const handleLookup = async () => {
        setIsLoading(true)
        try {
            const res = await DigitalAgentService.contactLookUp(props.vault, shortCodeOrDid)
            if(res.error) {
                setError(res.error)
                setContactInfo(null)
                setNotFound(false)
            }
            else if(res.found) {
                setContactInfo(res.data)
                setNotFound(false)
            } else {
                setContactInfo(null)
                setNotFound(true)
            }
        } catch (e) {
            console.log('[ContactAddScreen.handleLookup] error', e)
            setError('Unexpected error: ' + e.message)
            setContactInfo(null)
            setNotFound(true)
        }
        setIsLoading(false)
    }
    const handleContactAdd = async () => {
        // Your function to add the contact and send an invite
        const contact = await props.contactsManager.addContact(
            contactInfo.name, contactInfo.did, base58.decode(contactInfo.public_key),
            base58.decode(contactInfo.verify_key), Uint8Array.from([]), '', true)
        props.contactsManager.sendContactRequest(contact, () => setInviteSuccess(true))
    }

    return (
        <View style={ds.mainContainerPtGradient}>
            <ScrollView style={ds.scrollViewGradient}>
                <View style={ds.headerRow}>
                    <Text style={ds.header}>Add Contact</Text>
                </View>
                <MyTextInput
                    label="Short Code or DID"
                    placeholder="A2C3D4 or did:arx:base58..."
                    value={shortCodeOrDid}
                    onChangeText={setShortCodeOrDid}
                />
                <Pressable onPress={() => !isLoading && handleLookup()} style={[ds.button, !isLoading ? ds.blueButton : null, tw`w-full`]}>
                    <Text style={ds.buttonText}>{isLoading ? 'Loading...' : 'Lookup'}</Text>
                </Pressable>
                {error && <Warning msg={error} />}
                {contactInfo && (
                    <Card label={contactInfo.name}>
                        <Text style={ds.textLg}>Name: {contactInfo.name}</Text>
                        <Text style={ds.textLg}>Email: {contactInfo.email}</Text>
                        {inviteSuccess ? 
                            <Info header={'Success Sending Invite!'} msg={'Wait for the receipient to accept your invite.'} />
                            : <Pressable onPress={handleContactAdd} style={[ds.button, ds.greenButton]}>
                                <Text style={ds.buttonText}>Send Invite</Text>
                            </Pressable>}
                    </Card>
                )}
                {notFound && <Info header={'Contact not found'} msg={'Make sure the short code or DID is correct'} />}
            </ScrollView>
            <TopGradient />
            {/* <BottomGradient /> */}
            <View style={ds.buttonRowB}>
                <GoBackButton onPressOut={() => props.navigation.goBack()} />
            </View>
        </View>
    )
}

export default ContactAddScreen;
