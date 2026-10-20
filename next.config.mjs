import path from 'node:path';
import {fileURLToPath} from 'node:url';
/** @type {import('next').NextConfig} */
const config={reactStrictMode:true,serverExternalPackages:['postgres'],outputFileTracingRoot:path.dirname(fileURLToPath(import.meta.url))};
export default config;
