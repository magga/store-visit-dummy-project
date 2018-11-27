import React, { Component } from 'react';
import { View, Text, ActivityIndicator, AsyncStorage, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Card, CardItem, Body, Input, Right, Button, Thumbnail, ListItem } from 'native-base';
import firebase from 'firebase';
import _ from 'lodash';
import moment from 'moment';
import TimerMixin from 'react-timer-mixin';

import { formattingDateTime } from './../helper';

class AllVisitSegment extends Component {
    constructor(props) {
        super(props);

        this.state = {
            areaId: '',
            storeId: '',
            data: [],
            counter: 0,
            salesId: '',
            isLoading: true,
            isFetchingData: false
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

                TimerMixin.setInterval(() => this.setState({ counter: (this.state.counter + 1) % 1000 }), 1000);
                this.setState({ isLoading: false });
                this._setRef();
            })
            .catch((err) => Alert.alert('ERROR', `Error getting salesId, please refresh. \n\nError : ${err.message}`, [{ text: 'ok' }]));
        })
        .catch((err) => Alert.alert('ERROR', `Error getting storeId, please refresh. \n\nError : ${err.message}`, [{ text: 'ok' }]));
    }

    componentWillUnmount() {
        if (this.firebaseRef) {
            this.firebaseRef.off();
        }
    }

    _setRef() {
        this.setState({ isFetchingData: true });

        if (this.firebaseRef) {
            this.firebaseRef.off();
        }

        this.firebaseRef = firebase.database().ref('customerStoreVisit');
        this.firebaseRef.orderByChild('store/id').equalTo(this.state.storeId).on('value', (snapshot) => {
            const data = snapshot.val();

            if (data) {
                this.setState({ data: _.toArray(data) });
            } else {
                this.setState({ data: [] });
            }

            this.setState({ isFetchingData: false });
        });
    }

    _renderTimer(data) {
        const { createdDate, timeoutDuration, status } = data;

        if (status !== 'opened') {
            return (
                <View style={{ flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
                    <Text style={{ color: 'red' }}>{status}</Text>
                </View>
            );
        }

        if (moment().diff(moment(createdDate), 'm') < timeoutDuration) {
            return (
                <View style={{ flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
                    <TouchableOpacity onPress={() => this._ambil(data)}><Text style={{ color: '#0076FF' }}>ambil ></Text></TouchableOpacity>
                    <Text style={{ marginTop: 5 }}>{`${timeoutDuration - moment().diff(moment(createdDate), 'm')} menit lagi expired`}</Text>
                </View>
            );
        }

        return (
            <View style={{ flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
                <Text style={{ color: 'red' }}>expired</Text>
            </View>
        );
    }

    _getInterestedName(data) {
        if (!data) {
            return '';
        }

        const arrData = _.toArray(data);
        return arrData.map((cat, idx) => {
            if (arrData[idx + 1]) {
                return `${cat.category}, `;
            }

            return cat.category;
        });
    }

    _renderListItem() {
        return this.state.data.map((data, idx) => {
            const { customer, visitDate, interestedCategories } = data;
            const { firstname, lastname } = customer;

            return (
                <ListItem key={idx}>
                    <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Text style={{ fontSize: 14 }}>{`${firstname} ${lastname}`}</Text>
                        <Text style={{ fontSize: 12, marginTop: 5 }}>{formattingDateTime(visitDate)}</Text>
                        <Text style={{ fontSize: 12, marginTop: 5, color: 'teal' }}>{this._getInterestedName(interestedCategories)}</Text>
                    </View>

                    {this._renderTimer(data)} 
                </ListItem>
            );
        });
    }

    _renderList() {
        if (this.state.isFetchingData) {
            return (
                <ActivityIndicator size='large' color='#007AFF' style={{ marginTop: 20 }} />
            );
        }

        return (
            <ScrollView>
                {this._renderListItem()}
            </ScrollView>
        );
    }

    _ambil(data) {
        Alert.alert('WARNING', 'Apakah anda yakin mengambil visit ini ?', [{ text: 'tidak' }, {
            text: 'ya',
            onPress: () => {
                const copy = { ...data };

                copy.status = 'sales_accepted';
                copy.salesAcceptedDate = (new Date()).toISOString();
                copy.sales = {
                    id: this.state.salesId,
                    name: this.state.salesId,
                    photo: `https://loremflickr.com/320/240?lock=${this.state.salesId}`
                };

                firebase.database().ref(`customerStoreVisit/${copy.id}`).set(copy)
                .then(() => {
                    Alert.alert('BERHASIL', 'Silahkan lihat jadwal anda di tab My List', [{ text: 'oke' }]);
                });
            }
        }]);
    }

    render() {
        if (this.state.isLoading) {
            return (
                <ActivityIndicator size='large' color='#007AFF' style={{ marginTop: 20 }} />
            );
        }

        return (
            <View style={{ flex: 1, marginTop: 20 }}>
                <Card>
                    <CardItem>
                        <Body>
                            <Input 
                                placeholder='store id'
                                value={this.state.storeId}
                                onChangeText={(text) => {
                                    AsyncStorage.setItem('storeId', text);
                                    this.setState({ storeId: text });
                                }}
                                style={{ borderBottomWidth: 1, width: '100%' }}
                            />
                        </Body>
                        <Right>
                            {this.state.isFetchingData ?
                                <ActivityIndicator size='small' color='#007AFF' /> :
                                <Button 
                                    onPress={() => {
                                        this._setRef();
                                    }}
                                >
                                    <Text style={{ padding: 10, color: 'white' }}>Set Store ID</Text>
                                </Button>
                            }
                        </Right>
                    </CardItem>
                </Card>

                <Card>
                    <CardItem>
                        <Thumbnail source={{ uri: `https://loremflickr.com/320/240?lock=${this.state.salesId}` }} />
                        <Text style={{ marginLeft: 15 }}>{`Sales ID Anda : ${this.state.salesId}`}</Text>
                    </CardItem>
                </Card>

                {this._renderList()}
            </View>
        );
    }
}

export default AllVisitSegment;
