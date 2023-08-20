import axios from 'axios'
import React, {useState} from 'react'
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native'

import ds from '../../assets/styles'
import tw from '../../lib/tailwind'
import { BottomGradient, LoadingScreen, TopGradient } from '../../components'
import { FieldError } from '../../components'

import DynamicForm from '../../components/DynamicForm'

import Organization from '../../classes/Organization'
import Template from '../../classes/Template'
import SessionManager from '../../classes/SessionManager'
import { ENDPOINTS } from '../../config'

const placeholderTextColorVC = '#999'


function BaseCertificateForm(props) {
  // Name
  // Issuer
  // Holder
  // Issued
  // Valid from (not before)
  // Expiry (not after))
  return <View>
    <Text style={tw``}>Description</Text>
    <Text style={tw`italic`}>{props.template_desc}</Text>
    <View>
      <Text style={ds.labelVC}>Credential Name</Text>
      <View style={ds.staticBoxVC}>
        <Text style={ds.value}>{props.template_name}</Text>
      </View>
    </View>
    <View>
      <Text style={ds.labelVC}>Credential Type</Text>
      <View style={ds.staticBoxVC}>
        <Text style={ds.value}>{props.template_type}</Text>
      </View>
    </View>
    <View>
      <Text style={ds.labelVC}>Issuer</Text>
      <View style={ds.staticBoxVC}>
        <Text style={ds.value}>{props.issuer_name}</Text>
        <Text style={ds.monoKeyVC}>{props.issuer}</Text>
      </View>
    </View>
    <View>
      <Text  style={ds.labelVC}>Holder</Text>
      <View style={ds.staticBoxVC}>
        <Text style={ds.value}>{props.holder_name}</Text>
        <Text style={ds.monoKeyVC}>{props.holder}</Text>
      </View>
    </View>
    <View>
      <Text style={ds.labelVC}>Valid From (YYYY/MM/DD)</Text>
      <Text style={ds.labelVCSm}>Optional</Text>
      <TextInput style={ds.dynamicBoxVC}
        placeholder='e.g. 2023/03/01'
        placeholderTextColor={placeholderTextColorVC} 
        value={props.not_before}
        onChange={(event) => props.handleInputChange(event, 'not_before')}/>
      <FieldError errors={props.errors} name='not_before' style={tw`text-red-600`} />
    </View>
    <View>
      <Text  style={ds.labelVC}>Expires (YYYY/MM/DD)</Text>
      <Text  style={ds.labelVCSm}>Optional</Text>
      <TextInput style={ds.dynamicBoxVC}
        placeholder='e.g. 2025/01/01'
        placeholderTextColor={placeholderTextColorVC} 
        value={props.not_after}
        onChange={(event) => props.handleInputChange(event, 'not_after')}/>
      <FieldError errors={props.errors} name='not_after' style={tw`text-red-600`} />
    </View>
  </View>
}

export default class CredentialRequestScreen extends React.Component {
  organization_uuid = null
  template_uuid = null
  user = null
  state = {
    organization: null,
    template: null,
    holder: null,
    not_before: '',
    not_after: '',
    templateFormData: {},
    errors: {}, // form errors
    error: null, // general error
  }
  template_data = {}
  constructor(props) {
    console.log('[CredentialRequestScreen] constructor')
    super(props)
    this.organization_uuid = this.props.route.params.organization_uuid
    this.template_uuid = this.props.route.params.template_uuid
    console.log(this.organization_uuid, this.template_uuid)
    this.user = SessionManager.getUser()
    this.state.holder = this.user;
  }
  componentDidMount() {
    // do Promise all check...
    Organization.get(this.organization_uuid).then((organization) => {
      this.setState({ organization: organization })
    })
    Template.get(this.template_uuid).then((template) => {
      const templateFormData = template.fields.map(field => {
        if(field.type == 'boolean')
          return {name: field.name, value: field.default == 'True'}
        return {name: field.name, value: field.default}
      })
      this.setState({
        template: template,
        templateFormData: Object.assign({}, ...templateFormData.map(x=>({[x.name]: x.value})))
      })
    })
  }
  handleInputChange = (event, field) => {
    let value = event.target.value
    // filter for number and slash
    if(['not_before', 'not_after'].includes(field))
      value = value.replace(/[^0-9\/]/g, '')
    this.setState({[field]: value})
  }
  setTemplateData = (name, data) => {
    this.setState({templateFormData: {...this.state.templateFormData, [name]: data}})
  }
  handleSubmit = () => {
    console.log('[CredentialRequestScreen.handleSubmit]')
    console.log(this.state.templateFormData)
    // check form data
    const payload = {
      template: this.state.template.uuid,
      issuer: this.state.organization.uuid,
      issuer_name: this.state.organization.name,
      holder: this.state.holder.uuid,
      holder_name: this.state.holder.name,
      not_before: this.state.not_before || null,
      not_after: this.state.not_after || null,
      data: this.state.templateFormData,
    }
    console.log(payload)
    // submit
    axios.post(ENDPOINTS.credential_create, payload)
    .then(response => {
      console.log(response)
    }).catch(error => {
      console.log(error.response.data)
      if(error.response.status == 400 && !('errors' in error.response.data))
        this.setState({errors: error.response.data})
      else if ('error' in error.response.data)
        this.setState({error: error.response.data.error})
      else
        this.setState({error: 'Unknown error'})
    })
  }
  render() {
    if(!this.state.organization || !this.state.template)
      return <LoadingScreen />
    return (
      <View style={ds.mainContainerPtGradient}>
        <ScrollView style={ds.scrollViewGradient} showsVerticalScrollIndicator={false}>
          <Text style={ds.header}>Credential Request</Text>
          <View style={ds.formVC}><form>
            <BaseCertificateForm
              template_name={this.state.template.name}
              template_desc={this.state.template.description}
              template_type={this.state.template.type}
              issuer={this.state.organization.uuid}
              issuer_name={this.state.organization.name}
              holder={this.state.holder.uuid}
              holder_name={this.state.holder.name}
              not_before={this.state.not_before}
              not_after={this.state.not_after}
              handleInputChange={this.handleInputChange}
              errors={this.state.errors}
            />
            <View style={tw`h-1 bg-gray-400 mt-3 mb-1 rounded-full`} />
            <DynamicForm
              templateFormData={this.state.templateFormData}
              template={this.state.template}
              setTemplateData={this.setTemplateData}
              errors={this.state.errors}
              />
            <View style={ds.buttonRow}>
              <View></View>
              <Pressable style={[ds.buttonSm, ds.greenButton]}
                  onPress={this.handleSubmit}>
                <Text style={ds.buttonTextSm}>Request</Text>
              </Pressable>
            </View>
          </form></View>
        </ScrollView>
        <TopGradient />
        <BottomGradient />
      </View>
    )
  }
}