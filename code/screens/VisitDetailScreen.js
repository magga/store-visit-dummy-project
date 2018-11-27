import React, { Component } from 'react';
import { View, Text, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Card, CardItem, Content, List, ListItem, Body, Button } from 'native-base';
import _ from 'lodash';
import { ConfirmDialog } from 'react-native-simple-dialogs';
import firebase from 'firebase';
import { connect } from 'react-redux';

import { formattingDateTime } from './../helper';
import * as actions from './../actions';

class VisitDetailScreen extends Component {
    static navigationOptions = {
        title: 'Detail'
    };

    constructor(props) {
        super(props);

        this.state = {
            dialogVisible: false,
            alasan: '',
            isLoading: false,
            visit: this.props.navigation.state.params.visit
        };
    }

    componentDidMount() {
        this.firebaseRef = firebase.database().ref(`customerStoreVisit/${this.state.visit.id}`);
        this.firebaseRef.on('value', (snapshot) => {
            const data = snapshot.val();

            if (data) {
                this.setState({ visit: data });
                this.props.SetDetailStoreVisit(data);
            } else {
                Alert.alert('ERROR', 'Error reading data', [{ text: 'ok', onPress: () => this.props.navigation.goBack() }], { cancelable: false });
            }
        });
    }

    _renderListItem(upper, lower) {
        return (
            <ListItem>
                <Body>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{upper}</Text>
                    <Text style={{ marginLeft: 0, marginTop: 5, fontSize: 12 }}>{lower}</Text>
                </Body>
            </ListItem>
        );
    }

    _renderData() {
        const { visitDate, store, interestedCategories, status } = this.state.visit;
        const intArr = _.toArray(interestedCategories);
        const name = intArr.map((data, idx) => intArr[idx + 1] ? `${data.category}, ` : data.category);

        return (
            <Card transparent>
                <CardItem header>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Data Store Visit</Text>
                </CardItem>

                <CardItem>
                    <Content>
                        <List>
                            {this._renderListItem('Tanggal Kunjungan', formattingDateTime(visitDate))}
                            {this._renderListItem('Toko', store.name)}
                            {this._renderListItem('Kategori Dipilih', name)}
                            {this._renderListItem('Status', status)}
                        </List>
                    </Content>
                </CardItem>
            </Card>
        );
    }

    _selesai() {
        Alert.alert('WARNING', 'Apakah anda yakin?', [{ text: 'tidak' }, {
            text: 'ya',
            onPress: () => {
                this.setState({ isLoading: true });

                const copy = { ...this.state.visit };

                copy.status = 'finished';
                copy.finishedDate = (new Date()).toISOString();

                firebase.database().ref(`customerStoreVisit/${copy.id}`).set(copy)
                .then(() => {
                    Alert.alert('', 'Berhasil', [{ text: 'oke' }]);
                    this.setState({ isLoading: false });
                })
                .catch((err) => {
                    Alert.alert('ERROR', `Error, please try again. \n\nError : ${err.message}`, [{ text: 'ok' }], { cancelable: false });
                });
            }
        }]);
    }

    _renderButtonArea() {
        if (this.state.isLoading) {
            return (
                <Card>
                    <CardItem style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size='large' color='teal' />
                    </CardItem>
                </Card>
            );
        }

        return (
            <View>
                <Card>
                    <CardItem>
                        <Button 
                            style={{ width: '100%', justifyContent: 'center', borderRadius: 0, backgroundColor: this.state.visit.status === 'sales_accepted' ? 'teal' : 'grey' }} 
                            onPress={() => this.setState({ dialogVisible: true })}
                            disabled={this.state.visit.status !== 'sales_accepted'}
                        >
                            <Text style={{ fontSize: 14, color: 'white' }} >Ketemu</Text>
                        </Button>
                    </CardItem>
                </Card>

                <Card>
                    <CardItem>
                        <Button 
                            style={{ width: '100%', justifyContent: 'center', borderRadius: 0, backgroundColor: this.state.visit.status === 'sales_met' ? 'teal' : 'grey' }} 
                            onPress={() => this._selesai()}
                            disabled={this.state.visit.status !== 'sales_met'}
                        >
                            <Text style={{ fontSize: 14, color: 'white' }} >Selesai</Text>
                        </Button>
                    </CardItem>
                </Card>

                <Card>
                    <CardItem>
                        <Button 
                            style={{ width: '100%', justifyContent: 'center', borderRadius: 0, backgroundColor: this.state.visit.status === 'sales_accepted' ? 'teal' : 'grey' }} 
                            onPress={() => this.props.navigation.navigate('customer_chat', { visit: this.state.visit })}
                            disabled={this.state.visit.status !== 'sales_accepted'}
                        >
                            <Text style={{ fontSize: 14, color: 'white' }} >Chat Customer</Text>
                        </Button>
                    </CardItem>
                </Card>
            </View>
        );
    }

    _ketemu() {
        this.setState({ isLoading: true });

        const copy = { ...this.state.visit };

        copy.status = 'sales_met';
        copy.salesMetDate = (new Date()).toISOString();
        copy.salesMetTriggerBy = 'sales';
        copy.salesMetAlasan = this.state.alasan;

        firebase.database().ref(`customerStoreVisit/${copy.id}`).set(copy)
        .then(() => {
            Alert.alert('', 'Berhasil', [{ text: 'oke' }]);
            this.setState({ isLoading: false });
        })
        .catch((err) => {
            Alert.alert('ERROR', `Error, please try again. \n\nError : ${err.message}`, [{ text: 'ok' }], { cancelable: false });
        });
    }

    _renderDialog() {
        return (
            <ConfirmDialog
                title={'Tombol ini hanya boleh ditekan jika customer tidak membawa handphone atau untuk alasan tertentu tidak dapat menekan tombol "Ketemu" pada aplikasinya. Apakah anda yakin akan melanjutkan?'}
                visible={this.state.dialogVisible}
                positiveButton={{
                    title: 'lanjut',
                    onPress: () => {
                        if (this.state.alasan === '') {
                            Alert.alert('WARNING', 'Harap masukkan alasan terlebih dahulu', [{ text: 'oke' }]);
                            return;
                        }

                        Alert.alert('WARNING', 'Apakah anda yakin?', [{ text: 'tidak', onPress: () => this.setState({ dialogVisible: false, }) }, {
                            text: 'ya',
                            onPress: () => {
                                this.setState({ dialogVisible: false, });

                                this._ketemu();
                            }
                        }]);
                    }
                }}
                negativeButton={{
                    title: 'batal',
                    onPress: () => {
                        this.setState({ dialogVisible: false });
                    }
                }}
            >
                <View>
                    <TextInput
                        style={{ height: 40, borderBottomWidth: 1 }}
                        value={this.state.alasan}
                        placeholder={'masukkan alasan anda menekan tombol "Ketemu"'}
                        onChangeText={(text) => this.setState({ alasan: text })}
                        autoCorrect={false}
                    />
                </View>
            </ConfirmDialog>
        );
    }

    render() {
        return (
            <ScrollView style={{ flex: 1 }}>
                {this._renderDialog()}
                {this._renderData()}
                {this._renderButtonArea()}
            </ScrollView>
        );
    }
}

export default connect(null, actions)(VisitDetailScreen);
