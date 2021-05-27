import React from 'react'
import {Text, View, TextInput, TouchableOpacity} from 'react-native';
import * as firebase from 'firebase';

export default class LoginScreen extends React.Component{

    constructor(){
        super()

        this.state = {
            emailID: '', 
            password: ''
        }
    }

    Login= async(email, password) =>{
        if(email && password){
            const response = await firebase.auth().signInWithEmailAndPassword(email, password)
        
            if(response){
                this.props.navigation.navigate('Transaction')
            }
        }else{
            alert('Enter Email & Password')
        }
    }
    render(){
        return(
            <View>

                <TextInput keyboardType = 'email-address' placeholder ='abc@example.com' onChangeText = {(text) =>{
                    this.setState({emailID:text})
                }}/>

                <TextInput secureTextEntry = {true} placeholder ='Enter Password' onChangeText = {(text) =>{
                    this.setState({password:text})
                }}/>

                <TouchableOpacity onPress = {() =>{
                    this.Login(this.state.emailID, this.state.password)
                }}>

                    <Text> Login </Text>
                </TouchableOpacity>

                <Text> Log In Screen </Text>
            </View>
        )
    }
}