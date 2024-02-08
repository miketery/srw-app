import { BaseToast, ErrorToast, InfoToast, SuccessToast } from 'react-native-toast-message';

// defaults
// position: top
// visibilityTime: 4000

const contentContainerStyle = {
  paddingHorizontal: 12,
  margin: -1,
}

const defaultToastConfig = {
  text1Style: {
    color: '#e2e8f0', 
    fontSize: 18,
  },
  text2Style: {
    fontSize: 15,
    color: '#e2e8f0',
  }
}


const toastConfig = {
  success: (props) => (<SuccessToast
      // style={{ borderLeftColor: 'pink' }}
      {...props}
      {...defaultToastConfig}
      contentContainerStyle={{
        ...contentContainerStyle,
        backgroundColor: '#052e16'
      }}
      style={{ borderLeftColor: '#15803d', borderRadius: 0 }}

    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      {...defaultToastConfig}
      contentContainerStyle={{
        ...contentContainerStyle,
        backgroundColor: '#450a0a'
      }}
      style={{ borderLeftColor: '#dc2626', borderRadius: 0 }}
    />
  ),
  info: (props) => (
    <InfoToast
      {...props}
      {...defaultToastConfig}
      contentContainerStyle={{
        ...contentContainerStyle,
        backgroundColor: '#172554'
      }}
      style={{ borderLeftColor: '#0e7490', borderRadius: 0 }}
    />
  )
}


export default toastConfig;