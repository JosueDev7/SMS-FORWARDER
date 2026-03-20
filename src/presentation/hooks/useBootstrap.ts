import { useEffect } from 'react';
import { useAppStore } from '@presentation/context/appStore';
import { requestSmsPermissions } from '@infrastructure/native/permissions';
import { logger } from '@shared/utils/logger';

const TAG = 'useBootstrap';

export const useBootstrap = (): void => {
  const init = useAppStore((state) => state.init);
  const bindSmsListener = useAppStore((state) => state.bindSmsListener);

  useEffect(() => {
    let unsub = () => undefined;

    const setup = async () => {
      logger.info(TAG, 'Bootstrap iniciando…');

      // Request SMS permissions before anything else.
      const granted = await requestSmsPermissions();
      logger.info(TAG, `Permisos SMS: ${granted ? 'CONCEDIDOS' : 'DENEGADOS'}`);

      await init();
      unsub = bindSmsListener();
      logger.info(TAG, 'Bootstrap completo.');
    };

    void setup();

    return () => {
      unsub();
    };
  }, [bindSmsListener, init]);
};
