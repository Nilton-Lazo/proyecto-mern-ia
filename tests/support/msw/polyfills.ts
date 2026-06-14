/** Polyfills para MSW 2.x en entorno Jest/jsdom */
import { fetch, Headers, Request, Response } from 'undici';

Object.assign(globalThis, { fetch, Headers, Request, Response });
