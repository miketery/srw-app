import React from "react"

import {KeyShare, Guardian, Share} from '../../classes/KeyShare'

export default class KeyShareTest extends React.Component {
    vault = null
    ks = null
    constructor(props) {
        super(props)
        this.vault = props.vault
    }
    componentDidMount() {
        
    }
    createKeyShare() {
        this.ks = KeyShare.create(this.vault, 'First KeyShare')
        this.ks.save(() => {
            console.log('saved KeyShare')
        })
    }
    addGuardian() {
        let g = new Guardian('Alice', '', '', '')
    }

}