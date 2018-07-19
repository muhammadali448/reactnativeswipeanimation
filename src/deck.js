import React, { Component } from 'react';

import { View,
        Animated,
        PanResponder,
        Dimensions,
        LayoutAnimation,
        UIManager } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THREESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {

    static defaultProps = {
        onSwipeRight: () => {

        },
        onSwipeLeft: () => {

        }
    }

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
            onPanResponderRelease: (event, gesture) => {
                if (gesture.dx > SWIPE_THREESHOLD) {
                    console.log('SWIPE RIGHT!!');
                    this.forceSwipe('right');
                }
                else if (gesture.dx < -SWIPE_THREESHOLD) {
                    console.log('SWIPE LEFT');
                    this.forceSwipe('left')
                }
                else {
                    this.resetPosition();
                }
            }
        })

        this.state = {
            panResponder: panResponder,
            position: position,
            index: 0
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this.setState({ index: 0 })
        }
    }

    componentWillUpdate() {
        UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
        LayoutAnimation.spring();
    }

    forceSwipe(direction) {
        const xValue = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
        Animated.timing(this.state.position, {
            toValue: {
                x: xValue, y: 0
            },
            duration: SWIPE_OUT_DURATION // miliseconds
        }).start(() => {
            this.onSwipeComplete(direction);
        })
    }

    onSwipeComplete(direction) {
        const { onSwipeRight, onSwipeLeft, data } = this.props;
        const item = data[this.state.index];
        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item)
        this.state.position.setValue({ x: 0, y: 0 });
        this.setState({ index: this.state.index + 1 })
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
            transform: [{ rotate: rotate }]
        }
    }

    renderCards() {

        if (this.state.index >= this.props.data.length) {
            return this.props.renderNoMoreCard()
        }

        return this.props.data.map((item, key) => {

            if (key < this.state.index) {
                return null;
            }

            if (key === this.state.index) {
                return (
                    <Animated.View key={key}
                        style={[this.getCardStyle(), styles.cardStyle]}
                        {...this.state.panResponder.panHandlers}>
                        {this.props.renderCard(item, key)}
                    </Animated.View>
                );
            }

            return (
                <Animated.View key={key}
                 style={[styles.cardStyle, { top: 10 * (key - this.state.index)  }]}>
                    {this.props.renderCard(item, key)}
                </Animated.View>
            );
        }).reverse()
    }

    render() {
        return (
            <View>
                {this.renderCards()}
            </View>
        )
    }
}

const styles = {
    cardStyle: {
        position: 'absolute',
        width: SCREEN_WIDTH
    }
}

export default Deck;