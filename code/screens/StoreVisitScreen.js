import React, { Component } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Segment, Button } from 'native-base';

import AllVisitSegment from './AllVisitSegment';
import MyListSegment from './MyListSegment';

class StoreVisitScreen extends Component {
    static navigationOptions = {
        title: 'Store Visit',
    };

    constructor(props) {
        super(props);

        this.state = {
            activeSegment: 'all-visit'
        };
    }

    _renderSegment() {
        return (
            <Segment style={{ backgroundColor: 'white' }}>
                <Button 
                    first 
                    active={this.state.activeSegment === 'all-visit'}
                    onPress={() => this.setState({ activeSegment: 'all-visit' })}
                    style={{ borderColor: '#007AFF', backgroundColor: this.state.activeSegment === 'all-visit' ? '#007AFF' : 'white' }}
                >
                    <Text style={{ color: this.state.activeSegment === 'all-visit' ? 'white' : 'black', marginLeft: 10, marginRight: 10 }}>All Visit</Text>
                </Button>

                <Button 
                    last 
                    active={this.state.activeSegment === 'my-list'}
                    onPress={() => this.setState({ activeSegment: 'my-list' })}
                    style={{ borderColor: '#007AFF', backgroundColor: this.state.activeSegment === 'my-list' ? '#007AFF' : 'white' }}
                >
                    <Text style={{ color: this.state.activeSegment === 'my-list' ? 'white' : 'black', marginLeft: 10, marginRight: 10 }}>My List</Text>
                </Button>
            </Segment>
        );
    }

    _renderView() {
        if (this.state.activeSegment === 'all-visit') {
            return (
                <AllVisitSegment navigation={this.props.navigation} />
            );
        }

        return (
            <MyListSegment navigation={this.props.navigation} />
        );
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                {this._renderSegment()}
                
                <ScrollView>    
                    {this._renderView()}
                </ScrollView>
            </View>
        );
    }
}

export default StoreVisitScreen;
