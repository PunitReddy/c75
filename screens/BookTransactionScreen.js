import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Image, Alert, KeyboardAvoidingView} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase'
import db from '../config.js'

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookID: '',
        scannedStudentID: '',
        buttonState: 'normal',
        transactionMessage:''
      }
    }

    getCameraPermissions = async (ID) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: ID,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const{buttonState}=this.state
      if(buttonState==='BookID'){
        this.setState({
          scanned: true,
          scannedBookID: data,
          buttonState: 'normal'
        });
      } else if(buttonState==='StudentID'){
        this.setState({
          scanned: true,
          scannedStudentID: data,
          buttonState: 'normal'
        });
      }
      
    }

    handleTransaction = async () =>{
      
      var transactionType = await this.checkBookEligibility()
      if(!transactionType){

        alert('The Book Does Not Exist')
        this.setState({
          scannedBookId:'',
          scannedStudentID:''
        })
      } else if(transactionType==='issue'){

        var isStudentEligible = await this.checkStudentForIssue()
        if(isStudentEligible){
          this.initiateBookIssue()
          alert('Book Issued')
        }
      } else{
        var isStudentEligible = await this.checkStudentForReturn()
        if(isStudentEligible){
          this.initiateBookReturn()
          alert('Book Returned')
        }
      }
    }

    initiateBookIssue = async () =>{
      db.collection('transactions').add({
        'studentID':this.state.scannedStudentID,
        'bookID':this.state.scannedBookID,
        'transactionType':'issue',
        // 'date':firebase.firestore.Timestamp.now().toDate()
      })
      db.collection('students').doc(this.state.scannedStudentID).update({
        'numberOfBooks':firebase.firestore.FieldValue.increment(1)
      })
      db.collection('books').doc(this.state.scannedBookID).update({
        'bookAvailability':false
      })
      Alert.alert('Book Issued')
      this.setState({
        scannedBookId:'',
        scannedStudentID:''
      })
    }

    initiateBookReturn = async () =>{
      db.collection('transactions').add({
        'studentID':this.state.scannedStudentID,
        'bookID':this.state.scannedBookID,
        'transactionType':'return',
        'date':firebase.firestore.Timestamp.now().toDate()
      })
      db.collection('students').doc(this.state.scannedStudentID).update({
        'numberOfBooks':firebase.firestore.FieldValue.increment(-1)
      })
      db.collection('books').doc(this.state.scannedBookID).update({
        'bookAvailability':true
      })
      Alert.alert('Book Returned')
      this.setState({
        scannedBookId:'',
        scannedStudentID:''
      })
    }

    checkStudentForReturn = async() =>{

      const Transactionref = await db.collection('transactions').where('bookID', '==', this.state.scannedBookID).limit(1).get()
      var isStudentEligible = ''
      Transactionref.docs.map((doc) =>{
        var lastBook = doc.data()
        if(lastBook.studentID === this.state.scannedStudentID){
        isStudentEligible = true
         } else{
          isStudentEligible = false
          alert('The Book Was Not Issued By This Student')
          this.setState({
            scannedBookId:'',
            scannedStudentID:''
          })
        }
      })
      return isStudentEligible
    }

    checkStudentForIssue= async() =>{

      const Studentref = await db.collection('students').where('studentID','==',this.state.scannedStudentID).get()
      var isStudentEligible=''
      if(Studentref.docs.length==0){
        alert('Student ID Does Not Exist')
        isStudentEligible=false
        this.setState({
          scannedBookId:'',
          scannedStudentID:''
        })
      } else{
        Studentref.docs.map((doc) =>{
          var student = doc.data()
          if(student.numberOfBooks<2){
            isStudentEligible=true
          } else{
            isStudentEligible=false
            alert('Student Has Already Issued Two Books')
            this.setState({
              scannedBookId:'',
              scannedStudentID:''
            })
          }
        })
      }
      return isStudentEligible
    }

    checkBookEligibility= async()=> {

      const Bookref = await db.collection('books').where('bookID','==',this.state.scannedBookID).get()
      var transactionType=''
      if(Bookref.docs.length==0){
        alert('Book ID Does Not Exist')
        transactionType=false
        this.setState({
          scannedBookId:'',
          scannedStudentID:''
        })
      } else{

        Bookref.docs.map((doc) =>{
          var book=doc.data()
          if(book.bookAvailability){
            transactionType='issue'
          } else{
            transactionType='return'
          }
        })
      }
      return transactionType
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style={styles.container} behavior='padding'enabled>

          <Text> WILY </Text>

          <Image 
           source={require('../assets/booklogo.jpg')}
           style={{width:300, height: 300}}
          />
          
            <TextInput onChangeText={text =>this.setState({scannedBookID:text})} placeholder="Book ID"
            value={this.state.scannedBookID}/>
            <TouchableOpacity 
            onPress={()=>{
              this.getCameraPermissions('BookID')
            }}>
              <Text>Scan</Text>
            </TouchableOpacity>

            <TextInput onChangeText={text =>this.setState({scannedStudentID:text})} placeholder="Student ID"
            value={this.state.scannedStudentID}/>
            <TouchableOpacity
            onPress={()=>{
              this.getCameraPermissions('StudentID')
            }}>
              <Text>Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={async() => {
              this.handleTransaction()
            }}>

              <Text>Submit</Text>

            </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={this.getCameraPermissions}
            style={styles.scanButton}>
            <Text style={styles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity> */}
        </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 20,
    }
  });