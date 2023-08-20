/*
* WARNING: This is a work in progress
* Also this is a complex component
* It is a recursive way to build a form
* Given that the conditions dictionary is a nested object
* There is no limit on leves but that could be set
*/

import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import ds from "../../assets/styles";

import tw from "../../lib/tailwind";

const test_state = [{type: 'nested', operator: 'and', conditions: [
  { key: "name", type: "string", value: "John", operator: "eq" },
  { key: "age", type: "number", value: "18", operator: "gte" },
  { type: 'nested', operator: 'or', conditions:  [
    { key: "name", type: "string", value: "Jame", operator: "eq" },
    { key: "age", type: "number", value: "22", operator: "gte" }
  ]}
]}]

const SimpleCondition = ({condition, level, setCondition, removeCondition}) => {
  const color = level % 2 == 0 ? 'bg-gray-300' : 'bg-gray-100'
  return <View style={tw`flex flex-row justify-between ${color}`}>
    <Text>{condition.key} {condition.type} {condition.value} {condition.operator}</Text>
    <View style={tw`flex-grow-1`} />
    <View style={tw`flex flex-row`}>
      <Pressable style={[ds.buttonTiny, ds.purpleButton]} onPress={() => setCondition({type: 'nested', operator: 'and', conditions: []})}>
        <Text style={ds.buttonTextSm}>Nested</Text>
      </Pressable>
      <Pressable style={[ds.buttonTiny, ds.greenButton]} onPress={() => setCondition({...condition, value: condition.value + 1})}>
        <Text style={ds.buttonTextSm}>Count</Text>
      </Pressable>
      <Pressable style={[ds.buttonTiny, ds.redButton]} onPress={removeCondition}>
        <Text style={ds.buttonTextSm}>Del</Text>
      </Pressable>
    </View>
  </View>
}

const Condition = ({condition, index, level=1, setCondition, removeCondition}) => {
  const color = level % 2 == 0 ? 'bg-gray-300' : 'bg-gray-100'
  const is_nested = condition.type === "nested";

  const setConditionAtIndex = (i, c) => {
    const new_conditions = [...condition.conditions]
    new_conditions[i] = c
    setCondition({
      ...condition,
      conditions: new_conditions
    })
  }
  const handleRemoveCondition = (i) => {
    const new_conditions = [...condition.conditions]
    new_conditions.splice(i, 1)
    setCondition({
      ...condition,
      conditions: new_conditions
    })
  }
  const handleAddCondition = () => {
    setCondition({
      ...condition,
      conditions: [
        ...condition.conditions,
        { key: "x", type: "x", value: level, operator: index }
      ]
    });
  };
  const handleToggleOperator = () => {
    setCondition({
      ...condition,
      operator: condition.operator == 'and' ? 'or' : 'and'
    })
  }
  if (is_nested) {
    return <View style={tw`${color}`}>
      <View style={tw`py-1 flex flex-row`}>
        <Text>{condition.operator}</Text>
        <Pressable style={[ds.buttonTiny, ds.blueButton]} onPress={() => handleAddCondition()}>
          <Text style={ds.buttonTextSm}>Add</Text>
        </Pressable>
        <Pressable style={[ds.buttonTiny, ds.purpleButton]} onPress={() => handleToggleOperator()}>
          <Text style={ds.buttonTextSm}>To: {condition.operator == 'and' ? 'or' : 'and'}</Text>
        </Pressable>
        {level > 1 &&
        <Pressable style={[ds.buttonTiny, ds.redButton]} onPress={() => removeCondition()}>
          <Text style={ds.buttonTextSm}>Del</Text>
        </Pressable>}
      </View>
      <View style={tw`ml-2`}>
        {condition.conditions.map((condition, i) => (
          <Condition key={i} level={level+1} condition={condition} index={i} 
            setCondition={(c) => setConditionAtIndex(i, c)}
            removeCondition={() => handleRemoveCondition(i)}/>
          ))}
      </View>
    </View>
  } else {
    return <SimpleCondition  level={level} condition={condition} setCondition={setCondition} removeCondition={removeCondition} />
  }
}

const ConditionForm = () => {
  // ROOT LEVEL
  // Interaction with API is here
  // Final Submit is here
  const [conditions, setConditions] = useState(test_state)
  const handleSetCondition = (condition) => {
    console.log('handleSetCondition LEVEL 0')
    console.log(condition)
    setConditions([condition])
  }
  return <View>
    {conditions.map((condition, index) => (
      <Condition key={index} condition={condition} index={index} setCondition={handleSetCondition} />
    ))}
  </View>
}


// const ConditionB = ({ condition, index, addCondition, removeCondition, setCondition }) => {
//   const is_nested = condition.type === "nested";

//   // const handleAddCondition = () => {
//   //   setConditions([...conditions, { key: "", type: "", value: "", operator: "eq" }]);
//   // };
//   // const handleRemoveCondition = (index) => {
//   //   setConditions(conditions.filter((_, i) => i !== index));
//   // };

//   if(is_nested) {
//     return (
//       <View>
//         <Text>{condition.operator}</Text>
//         {condition.conditions.map((condition, index) => (
//           <Condition key={index} condition={condition} index={index} removeCondition={() => handleRemoveCondition(index)} />
//         ))}
//         <Pressable onPress={handleAddCondition}>
//           <Text>Add Condition</Text>
//         </Pressable>
//       </View>
//     )
//   } else {
//     return (
//       <View>
//         <Text>{condition.key}</Text>
//         <Text>{condition.type}</Text>
//         <Text>{condition.value}</Text>
//         <Text>{condition.operator}</Text>
//         <Pressable onPress={removeCondition}>
//           <Text>Remove Condition</Text>
//         </Pressable>
//       </View>
//     )
//   }
  

// function ConditionForm({ onSubmit, parentKey = false }) {
//   const [key, setKey] = useState("");
//   const [type, setType] = useState("");
//   const [value, setValue] = useState("");
//   const [operator, setOperator] = useState("eq");
//   const [conditions, setConditions] = useState(test_state);

//   const addCondition = () => {
//     const condition = { key, type, value, operator };
//     setConditions([...conditions, condition]);
//     setKey("");
//     setType("");
//     setValue("");
//     setOperator("eq");
//   };

//   const removeCondition = (index) => {
//     setConditions(conditions.filter((_, i) => i !== index));
//   };

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     onSubmit({
//       [parentKey]: conditions.length > 0 ? { and: conditions } : { [operator]: { [type]: value } }
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h3>{parentKey || "Conditions"}</h3>
//       {Object.keys(conditions).length == 1 && 
//         conditions[Object.keys(conditions)[0]].map((condition, index) => (
//           <ConditionForm key={index} onSubmit={({ and, ...condition }) => {
//               setConditions([...conditions.and.slice(0, index), condition, ...conditions.and.slice(index + 1)]);
//               if (and) {
//                 setConditions([
//                   ...conditions.slice(0, index + 1),
//                   { and },
//                   ...conditions.slice(index + 1)
//                 ]);
//               }
//             }}
//             parentKey={condition.key}
//           />
//         ))
//       }
//       {Object.keys(conditions).length > 1 && 
//       <div>
//         <label>
//           Key:
//           <input
//             type="text"
//             value={key}
//             onChange={(event) => setKey(event.target.value)}
//           />
//         </label>
//         <label>
//           Type:
//           <input type="text" value={type} onChange={(event) => setType(event.target.value)}
//           />
//         </label>
//         <label>
//           Value:
//           <input type="text"
//             value={value}
//             onChange={(event) => setValue(event.target.value)}
//           />
//         </label>
//         <label>
//           Operator:
//           <select
//             value={operator}
//             onChange={(event) => setOperator(event.target.value)}
//           >
//             <option value="eq">Equal to</option>
//             <option value="neq">Not equal to</option>
//             <option value="gt">Greater than</option>
//             <option value="lt">Less than</option>
//             <option value="gte">Greater than or equal to</option>
//             <option value="lte">Less than or equal to</option>
//             <option value="contains">Contains</option>
//             <option value="startswith">Starts with</option>
//             <option value="endswith">Ends with</option>
//             <option value="date_gt">After (date)</option>
//             <option value="date_lt">Before (date)</option>
//           </select>
//         </label>
//         <button type="button" onClick={addCondition}>Add condition</button>
//         <button type="submit">Submit</button>
//       </div>
//       }
//     </form>
//   );
// }

export default ConditionForm;


{/* import { useState } from "react";

function ConditionForm({ onSubmit }) {
  const [conditions, setConditions] = useState([{ type: "single", key: "", value: "", operator: "eq" }]);

  const handleAddCondition = () => {
    setConditions([...conditions, { type: "single", key: "", value: "", operator: "eq" }]);
  };

  const handleRemoveCondition = (index) => {
    setConditions([...conditions.slice(0, index), ...conditions.slice(index + 1)]);
  };

  const handleChangeCondition = (index, key, value) => {
    setConditions([
      ...conditions.slice(0, index),
      { ...conditions[index], [key]: value },
      ...conditions.slice(index + 1),
    ]);
  };

  const handleAddNestedCondition = (index) => {
    const nestedConditions = conditions[index].conditions || [{ type: "single", key: "", value: "", operator: "eq" }];
    const updatedCondition = { ...conditions[index], type: "nested", conditions: nestedConditions };
    setConditions([...conditions.slice(0, index), updatedCondition, ...conditions.slice(index + 1)]);
  };

  const handleRemoveNestedCondition = (parentIndex, index) => {
    const nestedConditions = conditions[parentIndex].conditions.filter((_, i) => i !== index);
    const updatedCondition = { ...conditions[parentIndex], conditions: nestedConditions };
    setConditions([...conditions.slice(0, parentIndex), updatedCondition, ...conditions.slice(parentIndex + 1)]);
  };

  const handleChangeNestedCondition = (parentIndex, index, key, value) => {
    const nestedConditions = conditions[parentIndex].conditions.map((c, i) =>
      i === index ? { ...c, [key]: value } : c
    );
    const updatedCondition = { ...conditions[parentIndex], conditions: nestedConditions };
    setConditions([...conditions.slice(0, parentIndex), updatedCondition, ...conditions.slice(parentIndex + 1)]);
  };

  const handleAddOrCondition = (index) => {
    const orConditions = conditions[index].or_conditions || [{ type: "single", key: "", value: "", operator: "eq" }];
    const updatedCondition = { ...conditions[index], type: "or", or_conditions: orConditions };
    setConditions([...conditions.slice(0, index), updatedCondition, ...conditions.slice(index + 1)]);
  };

  const handleRemoveOrCondition = (parentIndex, index) => {
    const orConditions = conditions[parentIndex].or_conditions.filter((_, i) => i !== index);
    const updatedCondition = { ...conditions[parentIndex], or_conditions: orConditions };
    setConditions([...conditions.slice(0, parentIndex), updatedCondition, ...conditions.slice(parentIndex + 1)]);
  };

  const handleChangeOrCondition = (parentIndex, index, key, value) => {
    const orConditions = conditions[parentIndex].or_conditions.map((c, i) =>
      i === index ? { ...c, [key]: value } : c
    );
    const updatedCondition = { ...conditions[parentIndex], or_conditions: orConditions };
    setConditions([...conditions.slice(0, parentIndex), updatedCondition, ...conditions.slice(parentIndex + 1)]);
  };

  const handleSubmit = () => {
    const conditionObject = buildConditionObject(conditions);
    onSubmit(conditionObject);
  };

  const buildConditionObject = (conditions) => {
    const orConditions = conditions.filter((c) => c.type === "or").map((c) => buildConditionObject(c.or */}









////////////////////////////////


// import { useState } from "react";

// function ConditionForm({ onSubmit }) {
//   const [conditions, setConditions] = useState([{ type: "single", key: "", value: "", operator: "eq" }]);

//   const handleAddCondition = () => {
//     setConditions([...conditions, { type: "single", key: "", value: "", operator: "eq" }]);
//   };

//   const handleRemoveCondition = (index) => {
//     setConditions([...conditions.slice(0, index), ...conditions.slice(index + 1)]);
//   };

//   const handleChangeCondition = (index, key, value) => {
//     setConditions([
//       ...conditions.slice(0, index),
//       { ...conditions[index], [key]: value },
//       ...conditions.slice(index + 1),
//     ]);
//   };

//   const handleAddNestedCondition = (index) => {
//     const nestedConditions = conditions[index].conditions || [{ type: "single", key: "", value: "", operator: "eq" }];
//     const updatedCondition = { ...conditions[index], type: "nested", conditions: nestedConditions };
//     setConditions([...conditions.slice(0, index), updatedCondition, ...conditions.slice(index + 1)]);
//   };

//   const handleRemoveNestedCondition = (parentIndex, index) => {
//     const nestedConditions = conditions[parentIndex].conditions.filter((_, i) => i !== index);
//     const updatedCondition = { ...conditions[parentIndex], conditions: nestedConditions };
//     setConditions([...conditions.slice(0, parentIndex), updatedCondition, ...conditions.slice(parentIndex + 1)]);
//   };

//   const handleChangeNestedCondition = (parentIndex, index, key, value) => {
//     const nestedConditions = conditions[parentIndex].conditions.map((c, i) =>
//       i === index ? { ...c, [key]: value } : c
//     );
//     const updatedCondition = { ...conditions[parentIndex], conditions: nestedConditions };
//     setConditions([...conditions.slice(0, parentIndex), updatedCondition, ...conditions.slice(parentIndex + 1)]);
//   };

//   const handleAddOrCondition = (index) => {
//     const orConditions = conditions[index].or_conditions || [{ type: "single", key: "", value: "", operator: "eq" }];
//     const updatedCondition = { ...conditions[index], type: "or", or_conditions: orConditions };
//     setConditions([...conditions.slice(0, index), updatedCondition, ...conditions.slice(index + 1)]);
//   };

//   const handleRemoveOrCondition = (parentIndex, index) => {
//     const orConditions = conditions[parentIndex].or_conditions.filter((_, i) => i !== index);
//     const updatedCondition = { ...conditions[parentIndex], or_conditions: orConditions };
//     setConditions([...conditions.slice(0, parentIndex), updatedCondition, ...conditions.slice(parentIndex + 1)]);
//   };

//   const handleChangeOrCondition = (parentIndex, index, key, value) => {
//     const orConditions = conditions[parentIndex].or_conditions.map((c, i) =>
//       i === index ? { ...c, [key]: value } : c
//     );
//     const updatedCondition = { ...conditions[parentIndex], or_conditions: orConditions };
//     setConditions([...conditions.slice(0, parentIndex), updatedCondition, ...conditions.slice(parentIndex + 1)]);
//   };

//   const handleSubmit = () => {
//     const conditionObject = buildConditionObject(conditions);
//     onSubmit(conditionObject);
//   };

//   const buildConditionObject = (conditions) => {
//     const orConditions = conditions.filter((c) => c.type === "or").map((c) => buildConditionObject(c.or_conditions));
   

// const nestedConditions = conditions
// .filter((c) => c.type === "nested")
// .map((c) => ({ [c.key]: buildConditionObject(c.conditions) }));

// const singleConditions = conditions
// .filter((c) => c.type === "single")
// .reduce((acc, c) => {
//   const value = c.value === "true" ? true : c.value === "false" ? false : c.value;
//   return { ...acc, [c.key]: { [c.operator]: value } };
// }, {});

// return orConditions.length ? { $or: orConditions } : { ...nestedConditions, ...singleConditions };
// };

// return (
// <div>
// {conditions.map((condition, index) => (
//   <div key={index}>
//     <div>
//       <input
//         type="text"
//         placeholder="Key"
//         value={condition.key}
//         onChange={(e) => handleChangeCondition(index, "key", e.target.value)}
//       />
//       <select value={condition.operator} onChange={(e) => handleChangeCondition(index, "operator", e.target.value)}>
//         <option value="eq">Equal to</option>
//         <option value="ne">Not equal to</option>
//         <option value="gt">Greater than</option>
//         <option value="lt">Less than</option>
//       </select>
//       <input
//         type="text"
//         placeholder="Value"
//         value={condition.value}
//         onChange={(e) => handleChangeCondition(index, "value", e.target.value)}
//       />
//       <button onClick={() => handleRemoveCondition(index)}>X</button>
//     </div>
//     {condition.type === "nested" && (
//       <div style={{ marginLeft: 20 }}>
//         <h4>Nested Conditions</h4>
//         {condition.conditions.map((nestedCondition, nestedIndex) => (
//           <div key={nestedIndex}>
//             <div>
//               <input
//                 type="text"
//                 placeholder="Key"
//                 value={nestedCondition.key}
//                 onChange={(e) => handleChangeNestedCondition(index, nestedIndex, "key", e.target.value)}
//               />
//               <select
//                 value={nestedCondition.operator}
//                 onChange={(e) => handleChangeNestedCondition(index, nestedIndex, "operator", e.target.value)}
//               >
//                 <option value="eq">Equal to</option>
//                 <option value="ne">Not equal to</option>
//                 <option value="gt">Greater than</option>
//                 <option value="lt">Less than</option>
//               </select>
//               <input
//                 type="text"
//                 placeholder="Value"
//                 value={nestedCondition.value}
//                 onChange={(e) => handleChangeNestedCondition(index, nestedIndex, "value", e.target.value)}
//               />
//               <button onClick={() => handleRemoveNestedCondition(index, nestedIndex)}>X</button>
//             </div>
//           </div>
//         ))}
//         <button onClick={() => handleAddNestedCondition(index)}>Add Nested Condition</button>
//       </div>
//     )}
//     {condition.type === "or" && (
//       <div style={{ marginLeft: 20 }}>
//         <h4>Or Conditions</h4>
//         {condition.or_conditions.map((orCondition, orIndex) => (
//           <div key={orIndex}>
//             <div>
//               <input type="text" placeholder="Key" value={orCondition.key}
//                   onChange={(e) => handleChangeOrCondition(index, orIndex, "key", e.target.value)} />
//               <select value={orCondition.operator}
//                   onChange={(e) => handleChangeOrCondition(index, orIndex, "operator", e.target.value)}>
//                 <option value="eq">Equal to</option>
//                 <option value="ne">Not equal to</option>
//                 <option value="gt">Greater than</option>
//                 <option value="lt">Less than</option>
//               </select>
//               <input type="text" placeholder="Value" value={orCondition.value}
//                   onChange={(e) => handleChangeOrCondition(index, orIndex, "value", e.target.value)} />
//               <button onClick={() => handleRemoveOrCondition(index, orIndex)}>X</button>
//             </div>
//           </div>
//         ))}
//       <button onClick={() => handleAddOrCondition(index)}>Add Or Condition</button>
//       </div>
//     )}
//   </div>
// ))}
// <button onClick={handleAddCondition}>Add Condition</button>
// <button onClick={handleResetConditions}>Reset</button>
// <div>
// <pre>{JSON.stringify(buildConditionObject(conditions), null, 2)}</pre>
// </div>
// </div>
// );
// };