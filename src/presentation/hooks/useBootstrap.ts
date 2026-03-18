import { useEffect } from 'react';
import { useAppStore } from '@presentation/context/appStore';

export const useBootstrap = (): void => {
  const init = useAppStore((state) => state.init);
  const bindSmsListener = useAppStore((state) => state.bindSmsListener);

  useEffect(() => {
    let unsub = () => undefined;

    const setup = async () => {
      await init();
      unsub = bindSmsListener();
    };

    void setup();

    return () => {
      unsub();
    };
  }, [bindSmsListener, init]);
};
