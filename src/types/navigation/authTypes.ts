import {NativeStackScreenProps} from '@react-navigation/native-stack';

export type AuthStackParamList = {
  SignIn: undefined;
};

export type SignInScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'SignIn'
>;
