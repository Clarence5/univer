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

import { Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SHEET_DRAWING_PLUGIN, SheetsDrawingLoadController } from './controllers/sheet-drawing.controller';
import { ISheetDrawingService, SheetDrawingService } from './services/sheet-drawing.service';
import { SheetsDrawingRenderController } from './controllers/render-controllers/sheet-drawing.render-controller';

export class UniverSheetsDrawingPlugin extends Plugin {
    static override pluginName = SHEET_DRAWING_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: unknown,
        @Inject(Injector) override readonly _injector: Injector,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
    }

    override onStarting(): void {
        ([
            [SheetsDrawingLoadController],
            [ISheetDrawingService, { useClass: SheetDrawingService }],
        ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));
    }

    override onRendered(): void {
        ([[SheetsDrawingRenderController]] as Dependency[]).forEach((m) => {
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, m));
        });
    }
}
