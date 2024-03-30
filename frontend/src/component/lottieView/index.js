import React from 'react'
import Lottie from 'react-lottie';
 
export default class LottieControl extends React.Component {
 
  constructor(props) {
    super(props);
    this.state = {isStopped: false, isPaused: false};
  }
 
  render() {
    const buttonStyle = {
      display: 'block',
      margin: '10px auto'
    };
 
    const defaultOptions = {
      loop: true,
      autoplay: true, 
      animationData: this.props.animationData,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    };
 
    return <div>
      <Lottie options={defaultOptions}
              height={this.props.height}
              width={this.props.width}
              isStopped={this.state.isStopped}
              isPaused={this.state.isPaused}/>
    </div>
  }
}