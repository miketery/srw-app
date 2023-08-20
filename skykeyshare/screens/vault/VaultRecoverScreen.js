import React from 'react'
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable } from 'react-native'
import { wordlists } from 'bip39'
import Icon from 'react-native-vector-icons/Ionicons'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import Vault from '../../classes/Vault'
// Recover using seed (words) or QR code if you have it!

const wordlist = wordlists.english
const words = ["assault","yard","joke","mercy","lab","stairs",
        "jeans","fire","airport","size","among","firm"]

export default class VaultRecoverScreen extends React.Component {
    state = {
        words: [],
        nextPossibleWord: '',
        wordInput: '',
        warning: '',
    }
    vault = null
    constructor(props) {
        console.log('VaultRecoverScreen.constructor')
        super(props)
    }
    componentDidMount() {
    }
    recoverVault(words) {
        console.log('VaultRecoverScreen.recoverVault')
        let vault = new Vault()
        vault.setWords(words)
        // load from server
        // vault.loadFromServer()
    }
    resetWords = () => {
        this.setState({wordInput: '', nextPossibleWord: '', words: []})
    }
    handleDeleteWord = () => {
        let words = this.state.words
        words.pop()
        this.setState({ wordInput: '', nextPossibleWord: '', words: words })
    }
    handleInputChange = (text) => {
        let possible_word = text.length > 0 ? wordlist.filter(
                w => w.slice(0, text.length) == text.toLowerCase())[0] : null
        console.log(possible_word)
        let warning = possible_word == null && text.length > 0 ? 
            'Word not found in list.' : null
        this.setState({
            wordInput: text,
            nextPossibleWord: possible_word,
            warning: warning
        })
    }
    checkInputSubmit = (event) => {
        // if(event['key'] == 'Backspace' && this.state.wordInput.length == 0) {
        //     this.handleDeleteWord()
        // }
    }
    handleWordSubmit = () => {
        let words = this.state.words
        if(words.length == 12)
            return this.handleSubmit()
        if(this.state.nextPossibleWord == '' | this.state.nextPossibleWord === undefined)
            return
        this.setState({
            warning: '',
            wordInput: '',
            nextPossibleWord: '',
            words: this.state.words.concat([this.state.nextPossibleWord])
        })
    }
    handleSubmit = () => {
        let words = this.state.words
        if(words.length != 12) {
            this.setState({warning: 'Need 12 words.'})
            return
        }
        // verify words checksum passes
        try {
            this.recoverVault(words)
        } catch(e) {
            // need to do checksum checking...
            console.log(e)
        }
    }
    render() {
        let words = this.state.words
        let words_formatted = []
        const column_count = 2
        let words_in_column = 12 / column_count
        let word_count = words.length
        for(let i=0; i < column_count; i++) {
            let word_column = []
            for(let j=0; j < words_in_column; j++) {
                let word_number = i * words_in_column + j
                word_column[j] = <View style={styles.wordContainer} key={'w'+word_number}>
                    <Text style={styles.number}>
                        {word_number < 9 ? '0' : ''}{word_number+1}
                    </Text>
                    <Text style={[styles.word,
                            word_number == word_count ? tw`text-yellow-200` : null]}>
                        {word_number <= word_count ? words[word_number] : null}
                        {word_number == word_count ? this.state.nextPossibleWord : null}
                        {word_number >= word_count ? ' ' : null}
                    </Text>
                </View>
            }
            words_formatted[i] = <View style={styles.wordsColumn} key={'c' + i}>
                    {word_column}</View>
        }
        return <View style={[ds.mainContainerPtNoNav]}>
        <ScrollView>
            <Text style={ds.header}>Recover Vault</Text>
            <View style={ds.container}>
                <Text style={tw`text-slate-200`}>Use your <b>Seed Phrase</b> to recover your vault.</Text>
            </View>

            <View style={ds.container}>
                <Text style={ds.label}>Recovery Phrase</Text>
                <View style={styles.words}>
                    {words_formatted}
                </View>
            </View>
            <View style={ds.container}>
                <Text style={ds.label}>Input Word</Text>
                <TextInput placeholder='word'
                    style={ds.input}
                    onChangeText={this.handleInputChange}
                    onKeyPress={this.checkInputSubmit}
                    // ref={(input) => this.wordInput = input}
                    onSubmitEditing={() => this.handleWordSubmit()}
                    blurOnSubmit={false}
                    value={this.state.wordInput} />      
            </View>
            <View style={[ds.buttonRow, tw`justify-end px-1`]}>
                <Pressable onPress={() => this.resetWords()}>
                    <View style={[ds.buttonSm, ds.redButton, tw`w-20 mr-2`]}>
                        <Text style={tw`text-sm text-slate-200`}>Reset All</Text>
                    </View>
                </Pressable>
                <Pressable onPress={() => this.handleDeleteWord()}>
                    <View style={[ds.buttonSm, tw`bg-amber-700`]}>
                        <Text style={tw`text-sm text-slate-200`}>Delete Word</Text>
                    </View>
                </Pressable>
            </View>
            {this.state.warning ? 
            <View style={styles.warningContainer}>
                <Text style={tw`px-2 mr-2`}>
                    <Icon name='warning' size={24} />
                </Text>
                <Text>{this.state.warning}</Text>
            </View> : null}
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
                    style={[ds.button, word_count != 12 ? {} : ds.greenButton]}>
                <Text style={[ds.buttonText, word_count != 12 ? tw`text-slate-400`: null]}>Recover</Text>
            </Pressable>
        </View>
        </View>
    }
}

const styles = StyleSheet.create({
    wordsColumn: tw`flex-col grow-1`,
    wordContainer: tw`flex-row items-center`,
    words: tw`flex-row bg-slate-800 p-2 px-3 border-2 border-blue-400`,
    number: tw`text-blue-400 mr-2 pt-1 text-xs w-4`,
    word: tw`text-blue-400 text-xl`,
    warningContainer: tw`flex-row border-2 border-yellow-400 bg-yellow-200 p-2 mx-1 items-center my-4 rounded-xl`,
})
