import React, { Component } from 'react';
import { View, Text, AsyncStorage, Alert, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Card, CardItem, Thumbnail, ListItem, Body } from 'native-base';
import firebase from 'firebase';
import _ from 'lodash';

import { formattingDateTime } from './../helper';

class MyListSegment extends Component {
    constructor(props) {
        super(props);

        this.state = {
            areaId: '',
            storeId: '',
            data: [],
            counter: 0,
            salesId: '',
            isLoading: true
        };
    }

    componentDidMount() {
        AsyncStorage.getItem('storeId')
        .then((valStore) => {
            if (valStore) {
                this.setState({ storeId: valStore });
            } else {
                const storeId = 'STORE001';

                AsyncStorage.setItem('storeId', storeId);
                this.setState({ storeId });
            }

            AsyncStorage.getItem('salesId')
            .then((valSales) => {
                if (valSales) {
                    this.setState({ salesId: valSales });
                } else {
                    const salesId = Math.ceil(Math.random() * 30976).toString();
    
                    AsyncStorage.setItem('salesId', salesId);
                    this.setState({ salesId });
                }

                this._setRef();
            })
            .catch((err) => Alert.alert('ERROR', `Error getting salesId, please refresh. \n\nError : ${err.message}`, [{ text: 'ok' }]));
        })
        .catch((err) => Alert.alert('ERROR', `Error getting storeId, please refresh. \n\nError : ${err.message}`, [{ text: 'ok' }]));
    }

    _setRef() {
        this.setState({ isLoading: true });

        if (this.firebaseRef) {
            this.firebaseRef.off();
        }

        this.firebaseRef = firebase.database().ref('customerStoreVisit');
        this.firebaseRef.orderByChild('sales/id').equalTo(this.state.salesId).once('value')
        .then((snapshot) => {
            const data = snapshot.val();

            if (data) {
                this.setState({ data: _.toArray(data) });
            }

            this.setState({ isLoading: false });
        })
        .catch((err) => Alert.alert('ERROR', `Error set ref, please refresh. \n\nError : ${err.message}`, [{ text: 'ok' }]));
    }

    _renderList() {
        return this.state.data.map((data, idx) => {
            const { customer, visitDate } = data;
            const { firstname, lastname } = customer;

            return (
                <ListItem key={idx}>
                    <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Text style={{ fontSize: 14 }}>{`${firstname} ${lastname}`}</Text>
                        <Text style={{ fontSize: 12, marginTop: 5 }}>{formattingDateTime(visitDate)}</Text>
                    </View>

                    <View style={{ flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('visit_detail', { visit: data })}><Text style={{ color: '#0076FF' }}>detail ></Text></TouchableOpacity>
                    </View>
                </ListItem>
            );
        });
    }

    render() {
        if (this.state.isLoading) {
            return (
                <ActivityIndicator size='large' color='#007AFF' style={{ marginTop: 20 }} />
            );
        }

        return (
            <ScrollView style={{ flex: 1, marginTop: 20 }}>
                <Card>
                    <CardItem>
                        <Thumbnail source={{ uri: `https://loremflickr.com/320/240?lock=${this.state.salesId}` }} />
                        <Text style={{ marginLeft: 15 }}>{`Sales ID Anda : ${this.state.salesId}`}</Text>
                    </CardItem>
                </Card>

                {this._renderList()}
            </ScrollView>
        );
    }
}

export default MyListSegment;
