const REGEX = {
  EMAIL: /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/,
  PASSWORD: /^(?=.*[!@#$%^&*.])[a-zA-Z0-9!@#$%^&*.]{8,}$/,
  AT_LEAST_ONE_SPECIAL_CHAR: /[!@#$%^&*.]/,
  AT_LEAST_ONE_CAP_LETTER: /[A-Z]/,
  AT_LEAST_ONE_NUMBER: /[0-9]/,
  PHONE: /^\d{8,12}$/,
};

const SOCIAL_LOGIN = {
  GOOGLE: {
    IOS_CLIENT_ID:
      '1065357527571-rs15k9j9pftct9mo5q4ce6i1bucn7mq1.apps.googleusercontent.com',
    ANDROID_CLIENT_ID:
      '66276996017-j58675bf1vctp1o3lmfoja1ok107mu6i.apps.googleusercontent.com',
  },
};

export {REGEX, SOCIAL_LOGIN};
