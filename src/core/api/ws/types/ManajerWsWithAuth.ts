import type { LogoutEventBus } from "~/modules/otentikasi/event/LogoutEventBus";

export abstract class ManajerWsWithAuth {
  constructor(logoutEventBus: LogoutEventBus) {
    logoutEventBus.on((data) => {
      this.handleLogout(data.idSession);
    });
  }

  abstract handleLogout(idSession: string): Promise<void>;
}
