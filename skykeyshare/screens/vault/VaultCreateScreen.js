import React from 'react'
import Clipboard from '@react-native-clipboard/clipboard'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons'

import Vault from '../../classes/Vault';
import { ErrorScreen, FieldError, Info, LoadingScreen } from '../../components';
import { primary_route } from '../LandingScreen'
import Cache from '../../classes/Cache';

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { trim_and_lower } from '../../lib/utils.js';

const romans = [
    'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix',
    'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix',
    'xx', 'xxi', 'xxii', 'xxiii', 'xxiv'
]

class VaultCreateScreen extends React.Component {
    state = {
        name: '',
        my_name: '',
        email: '',
        loading: true,
        create_loading: false,
        words: [],
        errors: {},
    }
    // words = []
    vault = null;
    constructor(props) {
        console.log('[VaultCreateScreen.constructor]')
        super(props);
    }
    componentDidMount() {
        this.vault = new Vault();
        this.vault.genWords().then((words) =>
            this.setState({loading: false, words: words.split(' ')})
        )
    }
    handleNameChange = (text) => {
        this.setState({name: text})
    }
    handleEmailChange = (text) => {
        this.setState({email: text})
    }
    handleMyNameChange = (text) => {
        this.setState({my_name: text})
    }
    finishSubmit = () => {
        console.log(' [VaultCreateScreen.finishSubmit] '+this.vault.getPk())
        Cache.setVaultPk(this.vault.getPk())
        this.props.navigation.dispatch(CommonActions.reset(primary_route()))
    }
    checkForm = () => {
        const errors = {}
        if (!this.state.my_name || trim_and_lower(this.state.my_name) === '') {
            errors.my_name = 'Name is required'
        }
        // https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
        if (!String(this.state.email).toLowerCase().match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )) {
            errors.email = 'Valid email is required'
        }
        this.setState({errors: errors})
        return Object.keys(errors).length === 0
    }
    handleSubmit = () => {
        if(!this.checkForm())
            return
        console.log('[VaultCreateScreen.handleSubmit]')
        this.setState({create_loading: true})
        setTimeout(() => 
            this.vault.create(this.state.my_name, this.state.email,
                this.finishSubmit, 
                () => this.setState({
                    errors: {general: 'Something went wrong, unknown error.'},
                    create_loading: false
                })), 250);
    }
    render() {
        if(this.state.loading)
            return <LoadingScreen />
        if('general' in this.state.errors)
            return <ErrorScreen error={this.state.errors.general} toggle={() => this.setState({errors: {}})} />
        if(this.state.create_loading) {
            // TODO: make special loading animation here...
            return <LoadingScreen t={'Creating your vault now!'} />
        }
        let words = this.state.words
        let words_formatted = []
        const column_count = 2
        let words_in_column = Math.ceil(words.length / column_count)
        for(let i=0; i < column_count; i++) {
            let word_column = []
            for(let j=0; j < words_in_column; j++) {
                let word_number = i * words_in_column + j
                if(word_number >= words.length)
                    continue
                word_column[j] = <View style={styles.wordContainer} key={'w'+word_number}>
                    <Text style={styles.number}>
                        {word_number < 9 ? '0' : ''}{word_number+1}
                        {/* {romans[word_number]} */}
                    </Text>
                    <Text style={styles.word}>
                        {words[word_number]}
                    </Text>
                </View>
            }
            words_formatted[i] = <View style={styles.wordsColumn} key={'c' + i}>
                    {word_column}</View>
        }
        return (<View style={[ds.mainContainerPtNoNav]}>
            <ScrollView>
            <Text style={ds.header}>Create Vault</Text>
            {/* <View style={ds.container}>
                <Text style={ds.label}>Name Your Vault</Text>
                <TextInput placeholder='Alices Main Vault'
                    style={ds.input}
                    onChangeText={this.handleNameChange}
                    value={this.state.name} />
            </View> */}
            <View style={ds.container}>
                <Text style={ds.label}>Your Name</Text>
                <TextInput placeholder='Alice Roberts'
                    style={ds.input}
                    onChangeText={this.handleMyNameChange}
                    value={this.state.my_name} />
                <Text style={[ds.smallLabel, tw`italic -mt-1`]}>The name your contacts will see when you add them</Text>
                <FieldError name='my_name' errors={this.state.errors} />
            </View>
            <View style={ds.container}>
                <Text style={ds.label}>Email</Text>
                <TextInput placeholder='alice@skycastle.dev'
                    style={ds.input}
                    onChangeText={this.handleEmailChange}
                    value={this.state.email} />
                <Text style={[ds.smallLabel, tw`italic -mt-1`]}>Used for social recovery</Text>
                <FieldError name='email' errors={this.state.errors} />
            </View>
            <View style={styles.phraseContainer}>
                <Text style={ds.label}>Recovery Phrase</Text>
                <Pressable onPress={() => Clipboard.setString(words.join(' '))}>
                    <View style={styles.words}>
                        {words_formatted}
                    </View>
                    <View style={tw`items-end pr-4 -mt-10 mb-4`}>
                        <Text style={tw`text-blue-400`}>
                            <Icon name='copy-outline' size={24} />
                        </Text>
                    </View>
                    <Info t={'The above is your recovery phrase. '+
                            'Keep it safe, use Social Recovery, or back it up securely.\n'+
                            'You can view / save it later too.'} />
                    {/* <View style={styles.warningContainer}>
                        <Text style={tw`px-2 mr-2`}>
                            <Icon name='warning' size={24} />
                        </Text>
                        <Text>
                            The above words are your recovery phrase.{'\n'}
                            With it you can recover your vault.
                            Keep it safe, use Social Recovery, or back it up securely.{'\n'}
                            <i>You can do this at a later time.</i>
                        </Text>
                    </View> */}
                </Pressable>
            </View>
            </ScrollView>
            <View style={{flex: 1}} />
            <View style={ds.buttonRow}>
                <Pressable onPressOut={() => this.props.navigation.goBack()}>
                    <View style={[ds.button, tw`w-16`]}>
                        <Text style={ds.buttonText}>
                            <Icon name='arrow-back' size={24} />
                        </Text>
                    </View>
                </Pressable>
                <Pressable onPress={() => this.handleSubmit()}
                        style={[ds.button, ds.greenButton]}>
                    <Text style={ds.buttonText}>Create & Save</Text>
                </Pressable>            
            </View>
        </View>);
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: '#0d1020',
      alignItems: 'center',
    },
    phraseContainer: {
        width: '100%',
        marginBottom: 20,
    },
    wordsColumn: tw`flex-col grow-1`,
    wordContainer: tw`flex-row items-center`,
    words: tw`flex-row bg-slate-800 p-2 px-3 border-2 border-blue-400`,
    number: tw`text-blue-400 mr-2 pt-1 text-xs w-4`,
    word: tw`text-blue-400 text-xl`,
    warningContainer: tw`flex-row border-2 border-yellow-400 bg-yellow-200 p-2 items-center mx-1 my-4 rounded-xl`,
});

export default VaultCreateScreen;

  
