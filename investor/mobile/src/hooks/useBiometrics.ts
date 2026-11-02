import { useState, useEffect } from 'react';
import storage from '../utils/storage';

let biometricCallback: ((success: boolean) => void) | null = null;

export const useBiometrics = () => {
  const [isSupported] = useState<boolean>(true);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isPromptVisible, setIsPromptVisible] = useState<boolean>(false);

  useEffect(() => {
    storage.isBiometricsEnabled().then((enabled) => {
      setIsEnabled(enabled);
    });
  }, []);

  const toggleBiometrics = async (enabled: boolean) => {
    await storage.setBiometrics(enabled);
    setIsEnabled(enabled);
  };

  const authenticate = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setIsPromptVisible(true);
      biometricCallback = resolve;
    });
  };

  const handleBiometricResult = (success: boolean) => {
    setIsPromptVisible(false);
    if (biometricCallback) {
      biometricCallback(success);
      biometricCallback = null;
    }
  };

  return {
    isSupported,
    isEnabled,
    isPromptVisible,
    toggleBiometrics,
    authenticate,
    handleBiometricResult,
  };
};

export default useBiometrics;
