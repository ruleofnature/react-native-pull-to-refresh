'use strict'

import Indicator from './Indicator'
import React from 'react'
import PropTypes from 'prop-types'
import { View,Text, ScrollView } from 'react-native'

const INDICATOR_HEIGHT = 20

export default class PTRViewiOS extends React.Component {
  constructor () {
    super()
    this.state = {
      expand: -INDICATOR_HEIGHT,
      scroll_offset: 0,
      isLoading: false,
      needPull: true,
      bounce: true
    }
  }
  _handleScroll (e) {
    var offset = e.nativeEvent.contentOffset.y
    if(offset<-10){

      this.setState({bounce:false})

    }else if(offset==0){
      this.setState({bounce:true})

    }
    if (!this.state.isLoading) {
      //console.log("scroll",offset,this.props.offset,-this.props.offset)
      this.setState({scroll_offset: offset})
      this.setState({ needPull: offset < this.props.offset})

    }
  }
  _handleRelease (e) {
    this.setState({bounce:true})

    if (this.state.scroll_offset < this.props.offset) {

      return
    }
    this.setState({
      state: 'laoding',
      isLoading: true,
    }, () => {
      this._expander(true)
      this._handleOnRefresh()
    })
  }
  _delay () {
    return new Promise((resolve) => {
      setTimeout(resolve, this.props.delay)
    })
  }
  _handleOnRefresh () {
    return new Promise((resolve) => {
      Promise.all([
        this.props.onRefresh(resolve),
        this._delay()
      ])
        .then(() => {
          this._endLoading()
        })
    })
  }
  _endLoading () {
    this.setState({
      isLoading: false,
      scroll_offset: 0,
      expand: -INDICATOR_HEIGHT
    })
    this._expander(false)
  }
  _expander (is_expand) {
    var that = this
    var threshold = -INDICATOR_HEIGHT
    var n = -5

    if (is_expand) {
      threshold = 5
      n = 1
    }

    (function loop () {
      var animation = requestAnimationFrame(loop)
      that.setState({expand: that.state.expand += n})
      if (
        (is_expand && that.state.expand >= threshold) ||
        (!is_expand && that.state.expand <= threshold) ||
        (is_expand && !that.state.isLoading)
      ) {
        cancelAnimationFrame(animation)
      }
    })()
  }
  render () {
    return (
      <View style={{flex: 1}}>
        <ScrollView
        scrollEnabled={this.props.scrollEnabled}
        ref={(ref) => this.scrollView = ref}
          onScroll={this._handleScroll.bind(this)}
          onResponderRelease={this._handleRelease.bind(this)}
          scrollEventThrottle={24}
          showsVerticalScrollIndicator={false}
          style={this.props.style}
          bounces={this.state.bounce}
          //contentContainerStyle={{flexGrow: 1,justifyContent:'flex-end'}}
          contentContainerStyle={{flexGrow: 1}}
        >
          <View  >
          {this.props.children}
            {/*<Indicator
              isLoading={this.state.isLoading}
              needPull={this.state.needPull}
            />*/}

          </View>
        </ScrollView>
      </View>
    )
  }
}

PTRViewiOS.defaultProps = {
  offset: 100,
  delay: 0
}

PTRViewiOS.propTypes = {
  offset: PropTypes.number,
  delay: PropTypes.number,
  onRefresh: PropTypes.func,
  style: PropTypes.object,
  children (props, propName, componentName) {
  }
}
