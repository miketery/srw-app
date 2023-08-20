import axios from 'axios'
import React from 'react'
import { Text, View, Pressable, TextInput } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'

import { DEBUG, ENDPOINTS, ROUTES } from '../../config'
import SessionManager from '../../classes/SessionManager'
import { FieldError, Error, GoBackButton } from '../../components'


const RegisterForm = (props) => {
  return (<View style={tw`grow-1`}>
    <View>
      <Text style={ds.label}>Name</Text>
      <TextInput style={ds.input}
        onChangeText={props.handleNameChange}
        value={props.name}
        editable={!props.disableInput} />
      <FieldError name='name' errors={props.errors} />
    </View>
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
  name: 'Bobby',
  email: 'test@arxsky.dev',
  password: 'pass123!@#',
} : {name: '', email: '', password: ''}

export default class RegisterScreen extends React.Component {
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
  handleNameChange = (data) => {
    this.setState({name: data})
  }
  handlePasswordChange = (data) => {
    this.setState({password: data})
  }
  tryRegister = () => {
    let errors = {}
    if(!validate_email(this.state.email))
      errors['email'] = 'Invalid email address'
    if(this.state.password == '')
      errors['password'] = 'Password cannot be blank'
    if(Object.keys(errors).length == 0) {
      delete axios.defaults.headers.common['Authorization']
      axios.post(ENDPOINTS.register, {
        name: this.state.name,
        email: this.state.email,
        password: this.state.password
      }).then((response) => {
        this.setState({error: null})
        this.tryLogin()
      }).catch((error) => {
        console.log(error.response)
        if(error.response.status == 400 && !('errors' in error.response.data))
          this.setState({errors: error.response.data})
        else if ('error' in error.response.data)
          this.setState({error: error.response.data.error})
        else
          this.setState({error: 'Unknown error'})
      })
    } else {
      this.setState({errors: errors})
    }
  }
  tryLogin = () => {   
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
  render() {
    return (
      <View style={ds.landingContainer}>
        <Text style={ds.header}>Sign Up</Text>
        <RegisterForm
          handleEmailChange={this.handleEmailChange}
          handleNameChange={this.handleNameChange}
          handlePasswordChange={this.handlePasswordChange}
          name={this.state.name}
          email={this.state.email}
          password={this.state.password}
          errors={this.state.errors}
          tryRegister={this.tryRegister}
          disableInput={this.state.disableInput}
          error={this.state.error}
        />
        <View style={[ds.buttonRow, tw`justify-around mb-10`]}>
          <Pressable style={[ds.button]}
            onPress={this.props.navigation.goBack}>
            <Text style={ds.buttonText}>Back</Text>
          </Pressable>
          <Pressable onPressIn={this.tryRegister}
              style={[ds.button, ds.purpleButton, tw`w-40`]}>
            <Text style={ds.buttonText}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    )
  }
}