import { Plugin } from './types';

const plugins: Plugin[] = [];

const add = (...plugins: Plugin[]) => {
  plugins.push(...plugins);
};

function get<K extends keyof Plugin>(key: K): Exclude<Plugin[K], undefined>[] {
  return plugins.map((p) => p && p[key]).filter(Boolean);
}

export const plugin = { add, get };

export default plugin;
