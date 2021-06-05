import React from "react";
import './Recorder.css'
import {Button, createMuiTheme, ThemeProvider} from "@material-ui/core";
import {Delete, Pause, PlayArrowOutlined, Stop,} from "@material-ui/icons";
import MicIcon from '@material-ui/icons/Mic';
import AudioPlayer from "material-ui-audio-player";
import Timer from "react-compound-timer";
import AudioReactRecorder, {RecordState} from "audio-react-recorder";

class RecorderView extends React.Component {
    muiTheme = createMuiTheme({});

    constructor(props) {
        super(props);
        this.state = {
            blob: null,
            showStartButton: true,
            showStopButton: false,
            showPauseButton: false,
            showResumeButton: false,
            showResetButton: false,
            showAudio: false,
            showRecorder: false,
            showTimer: false,
            timer: {
                minute: 0,
                second: 0
            },
            recorderState: {
                recordState: null
            }
        }
    }

    startRecording() {
        console.log('Start recording');
        this.setState({
            showStartButton: false,
            showPauseButton: true,
            showTimer: true,
            showRecorder: true
        }, () => {
            console.log('Start the recorder');
            this.setState({
                recorderState: {
                    recordState: RecordState.START
                }
            });
        });
    }

    stopRecording() {
        console.log('Stop recording');
        console.log('Stop the recorder');
        this.setState({
            recorderState: {
                recordState: RecordState.STOP
            }
        }, () => {
            this.setState({
                showStopButton: false,
                showResumeButton: false,
                showResetButton: true,
                showTimer: false,
                showAudio: true,
                showRecorder: false,
            })
        });
    }

    resumeRecording() {
        console.log('Resume recording');
        this.setState({
            showResumeButton: false,
            showStopButton: false,
            showPauseButton: true,
            recorderState: {
                recordState: RecordState.START
            }
        });
    }

    pauseRecording() {
        console.log('Pause recording');
        this.setState({
            showPauseButton: false,
            showResumeButton: true,
            showStopButton: true,
            recorderState: {
                recordState: RecordState.PAUSE
            }
        });
    }

    deleteRecording() {
        console.log('Delete recording');
        this.setState({
            blob: null,
            showStartButton: true,
            showStopButton: false,
            showPauseButton: false,
            showResumeButton: false,
            showResetButton: false,
            showAudio: false,
            showTimer: false,
            timer: {
                minute: 0,
                second: 0
            },
            recorderState: {
                recordState: null
            }
        });
    }

    render() {
        return (
            <Timer startImmediately={false}>
                {({start, resume, pause, stop, reset}) => (
                    <div>
                        {
                            this.state.showRecorder &&
                            <AudioReactRecorder state={this.state.recorderState.recordState}
                                                backgroundColor={this.props.backgroundColor}
                                                onStop={(audioData) => {
                                                    this.setState({
                                                        blob: audioData
                                                    });
                                                    this.props.parentCallBack(this.props.recorderId, audioData)
                                                }}/>
                        }
                        {
                            this.state.showTimer &&
                            <div style={{textAlign: "center", fontSize: 50}}>
                                <Timer.Minutes
                                    formatValue={text => (text.toString().length > 1 ? text : '0' + text)}
                                />:
                                <Timer.Seconds
                                    formatValue={text => (text.toString().length > 1 ? text : '0' + text)}
                                />
                            </div>
                        }
                        {
                            this.state.showAudio &&
                            <div className='recorder-item recorder-player' style={{paddingBottom: 10}}>
                                <ThemeProvider theme={this.muiTheme}>
                                    <AudioPlayer
                                        elevation={1}
                                        width="70%"
                                        variation="primary"
                                        spacing={3}
                                        download={true}
                                        autoplay={true}
                                        order="standart"
                                        preload="auto"
                                        src={this.state.blob == null ? null : this.state.blob.url}
                                    />
                                </ThemeProvider>
                            </div>
                        }
                        {
                            this.state.showStartButton &&
                            <div className='recorder-item'>
                                <Button variant="contained"
                                        color="primary"
                                        startIcon={<MicIcon/>}
                                        onClick={() => {
                                            start();
                                            this.startRecording();
                                        }}><b>Ghi âm</b></Button>
                            </div>
                        }
                        {
                            this.state.showPauseButton &&
                            <div className='recorder-item'>
                                <Button variant="outlined"
                                        color="secondary"
                                        startIcon={<Pause/>}
                                        onClick={() => {
                                            pause();
                                            this.pauseRecording();
                                        }}><b>Tạm dừng</b></Button>
                            </div>
                        }
                        <span className='recorder-item'>
                                {
                                    this.state.showResumeButton &&
                                    <Button variant="outlined"
                                            color="primary"
                                            startIcon={<PlayArrowOutlined/>}
                                            onClick={() => {
                                                resume();
                                                this.resumeRecording();
                                            }}><b>Tiếp tục</b></Button>
                                }{
                            this.state.showStopButton &&
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<Stop/>}
                                onClick={() => {
                                    stop();
                                    this.stopRecording();
                                }}><b>Hoàn thành</b></Button>
                        }</span>
                        {
                            this.state.showResetButton &&
                            <div className='recorder-item recorder-delete'>
                                <Button variant="contained"
                                        startIcon={<Delete/>}
                                        onClick={() => {
                                            let abortController = new AbortController();
                                            abortController.abort();
                                            reset();
                                            this.deleteRecording();
                                        }}><b>Xóa</b></Button>
                            </div>
                        }
                    </div>
                )}
            </Timer>
        )
    }

}

export default RecorderView;

