import { setInterval } from "timers/promises";
import { trySyncPocket } from "../sync";

export const CronTask = async ({
  interval,
  callback,
}: {
  interval: number;
  callback: () => Promise<unknown>;
}) => {
  for await (const time of setInterval(interval)) {
    callback();
  }
};

export const install = () => {
  CronTask({
    interval: 60 * 1000,
    callback: async () => {
      await trySyncPocket({ limit: 500 });
    },
  });
};
