import React from 'react'
import { Text, View, TextInput, Pressable } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import { DEBUG, ROUTES } from '../../config'
import SessionManager from '../../classes/SessionManager'
import { FieldError, Error } from '../../components'


const LoginForm = (props) => {
  return (<View style={tw`grow-1`}>
    <View>
      <Text style={ds.label}>Email</Text>
      <TextInput style={ds.input}
        onChangeText={props.handleEmailChange}
        value={props.email}
        editable={!props.disableInput} />
      <FieldError name='email' errors={props.errors} />
    </View>
    <View>
      <Text style={ds.label}>Password</Text>
      <TextInput style={ds.input}
        onChangeText={props.handlePasswordChange}
        value={props.password}
        secureTextEntry={true}
        editable={!props.disableInput} />
      <FieldError name='password' errors={props.errors} />
    </View>
    {props.error != null && <Error msg={props.error} />}
  </View>)
}

function validate_email(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

const FORM_DATA = DEBUG ? {
  email: 'michael@arxsky.com',
  password: 'pass123!@#'
} : {email: '', password: ''}

export default class LoginScreen extends React.Component {
  state = {
    ...FORM_DATA,
    errors: {},
    error: null,
    disableInput: false,
  }
  constructor(props) {
    super(props)
  }
  handleEmailChange = (data) => {
    this.setState({email: data})
  }
  handlePasswordChange = (data) => {
    this.setState({password: data})
  }
  tryLogin = () => {
    let errors = {}
    if(!validate_email(this.state.email))
      errors['email'] = 'Invalid email address'
    if(this.state.password == '')
      errors['password'] = 'Password cannot be blank'
    this.setState({errors: errors})
    if(Object.keys(errors).length == 0) {
      SessionManager.login(
        this.state.email,
        this.state.password,
        () => this.props.navigation.navigate(ROUTES.HomeRoute),
        (error) => {
          console.log(error)
          this.setState({error: error})
        }
      )
    }
  }
  render() {
    return (
      <View style={ds.landingContainer}>
        <Text style={ds.header}>Login</Text>
        <LoginForm
          handleEmailChange={this.handleEmailChange}
          handlePasswordChange={this.handlePasswordChange}
          email={this.state.email}
          password={this.state.password}
          errors={this.state.errors}
          tryLogin={this.tryLogin}
          disableInput={this.state.disableInput}
          error={this.state.error}
        />
        <View style={[ds.buttonRow, tw`justify-around mb-10`]}>
          <Pressable style={[ds.button]}
            onPress={this.props.navigation.goBack}>
            <Text style={ds.buttonText}>Back</Text>
          </Pressable>
          <Pressable style={[ds.button, ds.lightblueButton]} 
            onPress={this.tryLogin}>
            <Text style={ds.buttonText}>Login</Text>
          </Pressable>
        </View>
      </View>
    )
  }
}