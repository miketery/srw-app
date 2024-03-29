import { useState } from 'react'
import { Pressable, Text } from 'react-native'

import ds from '../../assets/styles';
import tw from '../../lib/tailwind';
import { Card, Info, Warning } from '../../components';
import { GoBackButton } from '../../components';
import MainContainer from '../../components/MainContainer';

import DigitalAgentService from '../../services/DigitalAgentService'
import base58 from 'bs58';
import { XTextInput } from '../../components/Input';

const BOB_DID = 'did:arx:EtCnZqvnQ4qNq1wV5yjK2hMTrg1i3iPFESrD6w7mGP3E'

const ContactAddScreen = (props) => {
    const [shortCodeOrDid, setShortCodeOrDid] = useState('') // BOB_DID
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

    const header = 'Add Contact'
    const buttonRow = <>
        <GoBackButton onPressOut={() => props.navigation.goBack()} />
    </>
    return (
        <MainContainer header={header} buttonRow={buttonRow}>
                <XTextInput
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
    </MainContainer>
    )
}

export default ContactAddScreen;
