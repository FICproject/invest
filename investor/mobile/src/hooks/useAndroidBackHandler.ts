import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export const useAndroidBackHandler = (handler: () => boolean) => {
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => {
      subscription.remove();
    };
  }, [handler]);
};

export default useAndroidBackHandler;
