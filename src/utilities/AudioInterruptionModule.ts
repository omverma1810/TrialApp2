import {NativeModules, NativeEventEmitter} from 'react-native';

interface AudioInterruptionModuleInterface {
  startListening: () => void;
  stopListening: () => void;
  checkMicrophoneAvailability: () => Promise<boolean>;
}

const {AudioInterruptionModule} = NativeModules;

export const AudioInterruptionEmitter = AudioInterruptionModule
  ? new NativeEventEmitter(AudioInterruptionModule)
  : null;

export default AudioInterruptionModule as AudioInterruptionModuleInterface;
