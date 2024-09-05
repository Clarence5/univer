/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { MenuConfig } from '@univerjs/ui';
import type { BaseFunction, IFunctionInfo, IFunctionNames } from '@univerjs/engine-formula';
import type { Ctor } from '@univerjs/core';

/**
 * Base configuration for the plugin.
 */
export const PLUGIN_CONFIG_KEY_BASE = 'sheets-formula.base.config';

export const configSymbolBase = Symbol(PLUGIN_CONFIG_KEY_BASE);

export interface IUniverSheetsFormulaBaseConfig {
    menu?: MenuConfig;
    notExecuteFormula?: boolean;
    description?: IFunctionInfo[];
    function?: Array<[Ctor<BaseFunction>, IFunctionNames]>;
}

export const defaultPluginBaseConfig: IUniverSheetsFormulaBaseConfig = {};

/**
 * Remote configuration for the plugin.
 */
export const PLUGIN_CONFIG_KEY_REMOTE = 'sheets-formula.remote.config';

export const configSymbolRemote = Symbol(PLUGIN_CONFIG_KEY_REMOTE);

export interface IUniverSheetsFormulaRemoteConfig {
}

export const defaultPluginRemoteConfig: IUniverSheetsFormulaRemoteConfig = {};

/**
 * Mobile configuration for the plugin.
 */
export const PLUGIN_CONFIG_KEY_MOBILE = 'sheets-formula.mobile.config';

export const configSymbolMobile = Symbol(PLUGIN_CONFIG_KEY_MOBILE);

export interface IUniverSheetsFormulaMobileConfig {
    menu?: MenuConfig;
}

export const defaultPluginMobileConfig: IUniverSheetsFormulaMobileConfig = {};