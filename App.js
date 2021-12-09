import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {  StyleSheet, 
          Text, 
          View, 
          TouchableOpacity,
          TouchableHighlight,
          TextInput, 
          ScrollView,
          Alert,
       } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons'; 
import { theme } from './colors';
import { strings } from './strings';

const STORAGE_KEY = "@toDos";
const IS_WORKING_KEY = "@isWorking"; 

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [complete, setComplete] = useState(false);
  const [todos, setTodos] = useState({});
  const work = () => {
    AsyncStorage.setItem(IS_WORKING_KEY, "true");    
    setWorking(true);
  }

  const travel = () => {
    AsyncStorage.setItem(IS_WORKING_KEY, "false");    
    setWorking(false);
  };

  const textInputChangeText = (payload) => {    
    setText(payload);
  };

  const saveTodos = async (toSave) => {
    const save = JSON.stringify(toSave);
    await AsyncStorage.setItem(STORAGE_KEY, save);
  };

  const loadTodos = async() =>{
    try {
      const getResult = await AsyncStorage.getItem(STORAGE_KEY);
      setTodos(JSON.parse(getResult));
    } catch(e){
      //
    }
  };

  const loadIsWorking = async () => {
    try {
      const isWorking = await AsyncStorage.getItem(IS_WORKING_KEY);            
      if(isWorking !== null){
        const isTrueSet = (isWorking === 'true');
        setWorking(isTrueSet);
      }   
    } catch (error) {
      console.log("==== loadIsWorking Error ====");
    }
  }

  useEffect(()=>{
    loadIsWorking();
    loadTodos();
  }, []);

  const addToDo = async () =>{
    if(text === "") return;
    const newTodos = {...todos, [Date.now()]:{text, working, complete}}
    setTodos(newTodos);
    await saveTodos(newTodos);
    setText("");
  };

  const deleteToDo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      {
        text: strings.cancel,
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel"
      },
      { 
        text: strings.ok, onPress: async () => {
        const newTodos = {...todos}
        delete newTodos[key]
        setTodos(newTodos);
        await saveTodos(newTodos);
      }}
    ]);
  }

  const completeToDo = (key) => {  
    const newTodos = {...todos}
    const isComplete = newTodos[key].complete;
    const msg = isComplete ? "To Do Complete Cancel" : "To Do completed";
    Alert.alert(msg, "Are you sure?",[
      {
        text:strings.cancel,
        onPress: () => console.log("Cancel Pressed"),
        style : "cancel"
      },
      {
        text: strings.ok,
        onPress: async () => {
          newTodos[key].complete = !isComplete;
          setTodos(newTodos);
          await saveTodos(newTodos);
          //console.log(todos);
        }
      }
    ]);
  }

  const modifyToDo = (key) => {
    const newTodos = {...todos}
    

  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText, color: working? "white": theme.gray}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText, color:working? theme.gray : "white"}}>Travel</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput 
          value={text}
          placeholder={working? "Add a To Do" : "Where do you want to go?"} 
          onChangeText={textInputChangeText}
          onSubmitEditing={addToDo}
          returnKeyType="done"
          style={styles.input}/>
      </View>
      <ScrollView>
        {Object.keys(todos).map((key) => 
         todos[key].working === working ? (
          <View style={styles.toDo} key={key}>         
            <Text style={todos[key].complete ? styles.toDoTextComplete : styles.toDoText}>{todos[key].text}</Text>
            <View style={styles.toDoIcon}>
              <TouchableOpacity onPress={(event) => { 
                modifyToDo(key);
                console.log(event.nativeEvent.target.key);
                }}>
              <FontAwesome name="pencil" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => completeToDo(key)}>
                <Fontisto name="check" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={()=> deleteToDo(key)}>
                <Fontisto name="trash" size={20} color="white" />
              </TouchableOpacity>      
            </View>      
          </View>) : null 
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection:"row",
    marginTop:100,
    justifyContent:"space-between",
  },
  btnText: {
    color:"white",
    fontWeight: "600",
    fontSize: 38,
  },
  input: {
    backgroundColor:"white",
    paddingVertical:15,
    paddingHorizontal:20,
    borderRadius: 20,
    marginVertical:20,
    fontSize:18,
  },
  toDo: {
    flex:1,
    backgroundColor:theme.todoBg,
    marginBottom:15,
    paddingVertical:20,
    paddingHorizontal:30,
    borderRadius: 15,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
  },
  toDoText: {
    flex:0.7,
    color:"white",
    fontSize:18,
    fontWeight:"500",    
  },
  toDoTextComplete: {
    flex:0.7,
    color:"#333",
    fontSize:18,
    fontWeight:"500", 
    textDecorationColor:"#333",   
    textDecorationLine:"line-through"
  },
  toDoIcon: {
    flex:0.3,
    flexDirection:"row",
    justifyContent:"space-between",
  },
});
