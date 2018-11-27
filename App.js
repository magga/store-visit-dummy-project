import React, { Component } from 'react';
import { View, Platform } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { Root, Toast, ActionSheet } from 'native-base';
import firebase from 'firebase';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import reducers from './code/reducers';

import StoreVisitScreen from './code/screens/StoreVisitScreen';
import VisitDetailScreen from './code/screens/VisitDetailScreen';
import CustomerChatScreen from './code/screens/CustomerChatScreen';

class App extends Component {
	constructor(props) {
		super(props);

		this._initializeFirebase();
	}

	componentWillUnmount() {
		Toast.toastInstance = null;
		ActionSheet.actionsheetInstance = null;
	}

	_initializeFirebase() {
		if (!firebase.apps.length) {
			firebase.initializeApp({
				apiKey: 'AIzaSyAu9ojRYxtOnS-aroTzrrO8OBtUSGRwQu8',
				authDomain: 'my-hartono-app.firebaseapp.com',
				databaseURL: 'https://my-hartono-app.firebaseio.com',
				projectId: 'my-hartono-app',
				storageBucket: 'my-hartono-app.appspot.com',
				messagingSenderId: '1056256229852'
			});
		}        
	}
	
	render() {
		return (
			<Root>
				<Provider store={createStore(reducers)}>
					<View style={{ flex: 1 }}>
						<AppNavigator />
					</View>
				</Provider>
			</Root>
		);
	}
}

const AppNavigator = createStackNavigator({
	store_visit: StoreVisitScreen,
	visit_detail: VisitDetailScreen,
	customer_chat: CustomerChatScreen
});

export default App;
