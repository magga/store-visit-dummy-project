import React, { Component } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Toast } from 'native-base';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { connect } from 'react-redux';
import _ from 'lodash';
import firebase from 'firebase';

class CustomerChatScreen extends Component {
    static navigationOptions = {
        title: 'Chat',
        tabBarVisible: false,
        headerBackTitle: null
    };

    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            data: this.props.navigation.state.params.visit,
            isLoading: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.current) {
            this.setState({ data: nextProps.current });
        } else {
            this.setState({ data: null });
        }
    }

    _onSend(messages = []) {
        if (messages.length > 0) {
            const { id } = this.state.data;
            const { _id } = messages[0];

            this.setState({ isLoading: true });

            firebase.database().ref(`customerStoreVisit/${id}/chat/${_id}`).set({ 
                ...messages[0], 
                createdAt: (new Date()).toISOString(),
                user: {
                    ...messages[0].user,
                    avatar: `https://loremflickr.com/320/240?lock=${this.state.data.sales.id}`
                }
            })
            .then(() => {
                this.setState({ isLoading: false });
            })
            .catch((err) => {
                Toast.show({ text: `Error mengirimkan pesan, silahkan coba lagi. Error : ${err.message}`, buttonText: 'oke', duration: 3000, type: 'danger' });
                this.setState({ isLoading: false });
            });
        }
    }

    _renderBubble(props) {
        return (
        <Bubble
            {...props}
            wrapperStyle={{
                right: {
                    backgroundColor: 'white'
                },
                left: {
                    backgroundColor: 'teal'
                }
            }}
            textStyle={{
                right: {
                    color: 'black',
                },
                left: {
                    color: 'white'
                }
            }}
        />
        );
    }

    render() {
        let messages = [];

        if (this.state.data && this.state.data.chat) {
            messages = _.orderBy(_.toArray(this.state.data.chat), ['createdAt'], ['desc']);
        }

        return (
            <View style={{ flex: 1 }}>
                { this.state.isLoading &&
                    <ActivityIndicator size='large' color='teal' style={{ position: 'absolute', top: 20, left: 0, right: 0 }} />
                }
                
                <GiftedChat
                    messages={messages}
                    onSend={text => this._onSend(text)}
                    user={{
                        _id: 'sales',
                    }}
                    renderBubble={this._renderBubble}
                    textInputProps={{ autoCorrect: false }}
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        current: state.storevisit.current
    };
};

export default connect(mapStateToProps)(CustomerChatScreen);
