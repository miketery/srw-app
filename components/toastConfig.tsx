import Toast, { BaseToast, ErrorToast, SuccessToast } from 'react-native-toast-message';

// defaults
// position: top
// visibilityTime: 4000
const defaultToastConfig = {
  contentContainerStyle: {paddingHorizontal: 12 },
  text1Style: {
    fontSize: 18,
  },
  text2Style: {
    fontSize: 15,
    color: '#333',
  }
}


const toastConfig = {
    success: (props) => (<SuccessToast
        // style={{ borderLeftColor: 'pink' }}
        {...props}
        {...defaultToastConfig}
      />
    ),
    error: (props) => (
        <ErrorToast
          {...props}
          {...defaultToastConfig}
        />
      ),    
}


export default toastConfig;