#!/usr/bin/env node
import {tsImport} from 'tsx/esm/api';

await tsImport('./app/cli.ts', import.meta.url);
