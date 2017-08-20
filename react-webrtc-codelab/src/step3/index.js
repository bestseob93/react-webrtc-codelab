import React, { Component } from 'react';

class StepThree extends Component {
  constructor(props) {
    super(props);

    this.state = {
      startBtn: false,
      callBtn: true,
      hangBtn: true
    };

    this.gotStream = this.gotStream.bind(this);
    this.trace = this.trace.bind(this);
    this._start = this._start.bind(this);
    this._call = this._call.bind(this);
    this._hangUp = this._hangUp.bind(this);
    this.gotRemoteStream = this.gotRemoteStream.bind(this);
    this.gotRemoteIceCandidate = this.gotRemoteIceCandidate.bind(this);
    this.gotLocalIceCandidate = this.gotLocalIceCandidate.bind(this); 
    this.gotRemoteDescription = this.gotRemoteDescription.bind(this);
    this.gotLocalDescription = this.gotLocalDescription.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  trace(text) {
    console.log((performance.now() / 1000).toFixed(3) + ": " + text);
  }

  gotStream(stream) {
    this.trace("Received local stream");
    this.localVideo.src = window.URL.createObjectURL(stream);
    this.localStream = stream;
    this.setState({
      callBtn: false
    });
  }
  

  _start() {
    this.trace("Requesting local stream");
    this.setState({
      startBtn: true
    });
    navigator.getUserMedia({audio:true, video:true}, this.gotStream,
      function(error) {
        this.trace("getUserMedia error: ", error);
      });
  }

  _call() {
    this.setState({
      callBtn: true,
      hangBtn: false
    });
    this.trace("Starting call");
  
    if (this.localStream.getVideoTracks().length > 0) {
      this.trace('Using video device: ' + this.localStream.getVideoTracks()[0].label); // FaceTime HD 카메라 (in mac os)
    }
    if (this.localStream.getAudioTracks().length > 0) {
      this.trace('Using audio device: ' + this.localStream.getAudioTracks()[0].label); // 기본값. 여기서 설정을 확인할 수 있나보다.
    }
  
    var servers = null;
  
    this.localPeerConnection = new RTCPeerConnection(servers);
    this.trace("Created local peer connection object localPeerConnection");
    this.localPeerConnection.onicecandidate = this.gotLocalIceCandidate;
  
    this.remotePeerConnection = new RTCPeerConnection(servers);
    this.trace("Created remote peer connection object remotePeerConnection");
    this.remotePeerConnection.onicecandidate = this.gotRemoteIceCandidate;
    this.remotePeerConnection.onaddstream = this.gotRemoteStream;
  
    this.localPeerConnection.addStream(this.localStream);
    this.trace("Added localStream to localPeerConnection");
    this.localPeerConnection.createOffer(this.gotLocalDescription, this.handleError);
  }

  gotLocalDescription(description){
    this.localPeerConnection.setLocalDescription(description);
    this.trace("Offer from localPeerConnection: \n" + description.sdp);
    this.remotePeerConnection.setRemoteDescription(description);
    this.remotePeerConnection.createAnswer(this.gotRemoteDescription, this.handleError);
  }

  gotRemoteDescription(description){
    this.remotePeerConnection.setLocalDescription(description);
    this.trace("Answer from remotePeerConnection: \n" + description.sdp);
    this.localPeerConnection.setRemoteDescription(description);
  }


  _hangUp() {
    this.trace("Ending call");
    this.localPeerConnection.close();
    this.remotePeerConnection.close();
    this.localPeerConnection = null;
    this.remotePeerConnection = null;

    this.setState({
      callBtn: false,
      hangBtn: true
    });
  }

  gotRemoteStream(event){
    this.remoteVideo.src = window.URL.createObjectURL(event.stream);
    this.trace("Received remote stream");
  }

  gotLocalIceCandidate(event){
    if (event.candidate) {
      this.remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
      this.trace("Local ICE candidate: \n" + event.candidate.candidate);
    }
  }

  gotRemoteIceCandidate(event){
    if (event.candidate) {
      this.localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
      this.trace("Remote ICE candidate: \n " + event.candidate.candidate);
    }
  }

  handleError() {

  }

  render() {
    return (
      <div className="App">
        <video ref={(video) => this.localVideo = video} autoPlay muted></video>
        <video ref={(video) => this.remoteVideo = video} autoPlay muted></video>
        <div>
          <button disabled={this.state.startBtn} ref={(btn) => this.startButton = btn} onClick={this._start}>Start</button>
          <button disabled={this.state.callBtn} ref={(btn) => this.callButton = btn} onClick={this._call}>Call</button>
          <button disabled={this.state.hangBtn} ref={(btn) => this.hangupButton = btn} onClick={this._hangUp}>Hang Up</button>
        </div>
      </div>
    );
  }
}

export default StepThree;