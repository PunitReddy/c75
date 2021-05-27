import React from 'react';
import { Text, View } from 'react-native';
import db from '../config'
import { ScrollView, FlatList, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
export default class Searchscreen extends React.Component {

  constructor(){
    super()

    this.state={
      allTransactions:[],
      lastVisibleTransaction:null,
      search: ''
    }
  }

  componentDidMount = async() =>{

    const Query = await db.collection('transactions').limit(10).get()
    Query.docs.map((doc)=>{
      this.setState({
        allTransactions:[...this.state.allTransactions,doc.data()],
        lastVisibleTransaction:doc
      })
    })
  }

  fetchMoreTransactions = async() =>{

    var text = this.state.search.toUpperCase()
    var enteredText = text.split('')
    if(enteredText[0].toUpperCase()==='B'){

      const transaction = await db.collection('transactions').where('bookID', '==', text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions, doc.data()],
        lastVisibleTransaction:doc
        }) 
      })
    }else if(enteredText[0].toUpperCase()==='S'){

      const transaction = await db.collection('transactions').where('studentID', '==', text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions, doc.data()],
        lastVisibleTransaction:doc
        }) 
    })
  }


    const Query = await db.collection('transactions').startAfter(this.state.lastVisibleTransaction).limit(10).get()
    Query.docs.map((doc)=>{
      this.setState({
        allTransactions:[...this.state.allTransactions,doc.data()],
        lastVisibleTransaction:doc
      })
    })
  }

  searchTransaction = async(text) =>{

    var enteredText = text.split('')
    var text = text.toUpperCase()
    if(enteredText[0].toUpperCase()==='B'){
      const transaction = await db.collection('transactions').where('bookID', '==', text).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions, doc.data()],
        lastVisibleTransaction:doc
        })
      })
    }else if(enteredText[0].toUpperCase()==='S'){
      const transaction = await db.collection('transactions').where('studentID', '==', text).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions, doc.data()],
        lastVisibleTransaction:doc
        })
    })
  }
}

    render() {
      return (
      <View>
        <View>

          <TextInput placeholder = 'Enter Book ID or Student ID'
          onChangeText = {(text)=>{this.setState({search:text})}}
          />

          <TouchableOpacity onPress = {()=>{
            this.searchTransaction(this.state.search)
          }}>
            <Text>Search</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          
         data = {this.state.allTransactions}
         renderItem = {({item})=>(
          <View style={{ borderBottomWidth:2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{'Book ID: ' + item.bookID}</Text>
          <Text>{'Student ID: ' + item.studentID}</Text>
          <Text>{'Transaction Type: ' + item.transactionType}</Text>
          <Text>{'Date: ' + item.date}</Text>
          </View>
         )}
          keyExtractor ={(item, index) =>index.toString()}
          onEndReached={this.fetchMoreTransactions}
          onEndReachedThreshold={0.7}
        />
        </View>
      );
    }
  }