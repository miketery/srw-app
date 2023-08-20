import { useState } from "react"
import { Text, View, TextInput, Pressable, Switch } from 'react-native'

import ds from "../assets/styles"
import tw from "../lib/tailwind"
import { INPUT_TYPES } from "../config"
import { FieldError } from "./Dialogue"

const placeholderTextColorVC = '#999'

const DynamicForm = ({ template, templateFormData, setTemplateData, errors }) => {
  const generateInput = (input) => {
    const { name, type, placeholder } = input;
    switch (type) {
      case INPUT_TYPES.STRING:
        return (<TextInput
            style={ds.dynamicBoxVC}
            type="text"
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColorVC}
            id={name}
            name={name}
            value={templateFormData[name] || ""}
            onChange={(event) => setTemplateData(name, event.target.value)}
          />);
      case INPUT_TYPES.TEXT:
        return (<textarea
            id={name}
            name={name}
            value={templateFormData[name] || ""}
            onChange={(event) => setTemplateData(name, event.target.value)}
          ></textarea>);
      case INPUT_TYPES.INTEGER:
        return (<TextInput
            type="number"
            id={name}
            name={name}
            value={templateFormData[name] || ""}
            onChange={(event) => setTemplateData(name, event.target.value)}
          />);
      case INPUT_TYPES.BOOLEAN:
        let value = templateFormData[name] || false
        return (<Switch 
            style={tw`m-2`}
            id={name}
            value={value}
            onValueChange={(event) => setTemplateData(name, !value)}
        />);
      default:
        return (<TextInput
            type="text"
            id={name}
            name={name}
            value={templateFormData[name] || ""}
            onChange={(event) => setTemplateData(name, event.target.value)}
          />);
    }
  };

  const GenerateForm = () => {
    console.log('generateForm', template)
    return template.fields.map((field, index) => {
      return (
        <View key={index}>
          <View>
            <Text htmlFor={field.name} style={ds.labelVC}>{field.label}</Text>
          </View>
          {field.description != '' && 
            <Text style={tw`italic text-gray-500 my-1`}>{field.description}</Text>}
          {generateInput(field)}
          <FieldError name={field.name} errors={errors} style={tw`text-red-600`} />
        </View>
      );
    });
  };

  return <View style={tw`bg-gray-200`}>{GenerateForm()}</View>
}

export default DynamicForm;

// case INPUT_TYPES.DECIMAL:
//   return (<TextInput
//       type="number"
//       id={name}
//       name={name}
//       value={templateFormData[name] || ""}
//       step="0.01"
//       onChange={(event) => handleInputChange(event, input)}
//     />);

// case INPUT_TYPES.DATE:
//   return (<TextInput
//       type="date"
//       id={name}
//       name={name}
//       value={templateFormData[name] || ""}
//       onChange={(event) => setTemplateData(name, event.target.value)}
//     />);

// case INPUT_TYPES.DATETIME:
//           return (
//             <TextInput
//               type="datetime-local"
//               id={name}
//               name={name}
//               value={templateFormData[name] || ""}
//               onChange={(event) => handleInputChange(event, input)}
//             />
//           );
//         case INPUT_TYPES.BOOLEAN:
//           return (
//             <TextInput
//               type="checkbox"
//               id={name}
//               name={name}
//               checked={templateFormData[name] || false}
//               onChange={(event) => handleInputChange(event, input)}
//             />
//           );
//         case INPUT_TYPES.LIST:
//           return (
//             <select
//               id={name}
//               name={name}
//               value={templateFormData[name] || ""}
//               onChange={(event) => handleInputChange(event, input)}
//             >
//               {input.options.map((option, index) => (
//                 <option key={index} value={option}>
//                   {option}
//                 </option>
//               ))}
//             </select>
//           );
//         case INPUT_TYPES.CHOICE:
//           return (
//             <select
//               id={name}
//               name={name}
//               value={templateFormData[name] || ""}
//               onChange={(event) => handleInputChange(event, input)}
//             >
//               {Object.values(input.options).map((option, index) => (
//                 <option key={index} value={option}>
//                   {option}
//                 </option>
//               ))}
//             </select>
//           );
//         case "Dict":
//           return (
//             <TextInput
//               type="text"
//               id={name}
//               name={name}
//               value={templateFormData[name] || ""}
//               onChange={(event) => handleInputChange(event, input)}
//             />
//           );