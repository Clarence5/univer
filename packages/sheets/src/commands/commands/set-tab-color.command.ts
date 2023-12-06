import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { ISetTabColorMutationParams } from '../mutations/set-tab-color.mutation';
import { SetTabColorMutation, SetTabColorUndoMutationFactory } from '../mutations/set-tab-color.mutation';

export interface ISetTabColorCommandParams {
    value: string;
}

export const SetTabColorCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-tab-color',

    handler: async (accessor: IAccessor, params: ISetTabColorCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const setTabColorMutationParams: ISetTabColorMutationParams = {
            color: params.value,
            workbookId,
            worksheetId,
        };

        const undoMutationParams = SetTabColorUndoMutationFactory(accessor, setTabColorMutationParams);
        const result = commandService.syncExecuteCommand(SetTabColorMutation.id, setTabColorMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [{ id: SetTabColorMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetTabColorMutation.id, params: setTabColorMutationParams }],
            });
            return true;
        }

        return false;
    },
};