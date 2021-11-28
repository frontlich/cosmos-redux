import { Plugin } from './types';

const plugins: Plugin[] = [];

const add = (p: Plugin) => {
  plugins.push(p);
};

function get<K extends keyof Plugin>(key: K): Exclude<Plugin[K], undefined>[] {
  return plugins.map((p) => p && p[key]).filter(Boolean);
}

export const plugin = { add, get };

export default plugin;
