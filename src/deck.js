import React, { Component } from 'react';

import { View, Animated, PanResponder, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;


class Deck extends Component {

    constructor(props) {
        super(props);
        const position = new Animated.ValueXY();
        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                // console.log(gesture);
                position.setValue({
                    x: gesture.dx,
                    y: gesture.dy
                })
            },
            onPanResponderRelease: () => {
                this.resetPosition();
            }
        })

        this.state = {
            panResponder: panResponder,
            position: position
        }
    }

    resetPosition() {
        Animated.spring(this.state.position, {
            toValue: {
                x: 0, y: 0
            }
        }).start();
    }

    getCardStyle() {
        const { position } = this.state;
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 2.0, 0, SCREEN_WIDTH * 2.0],
            outputRange: ['-120deg', '0deg', '120deg']
        })
        return {
            ...position.getLayout(),
            transform: [{rotate: rotate}]
        }
    }

    renderCards() {
        return this.props.data.map((item, key) => {
            if (key === 0) {
                return (
                    <Animated.View key={key}
                    style={this.getCardStyle()}
                        {...this.state.panResponder.panHandlers}>
                        {this.props.renderCard(item, key)}
                    </Animated.View>
                );
            }
            return this.props.renderCard(item, key)
        })
    }

    render() {
        return (
            <View>
                {this.renderCards()}
            </View>
        )
    }
}

export default Deck;