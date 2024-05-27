import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import MemoryConfig from '../_base/components/memory-config'
import VarReferencePicker from '../_base/components/variable/var-reference-picker'
import Editor from '../_base/components/prompt/editor'
import ResultPanel from '../../run/result-panel'
import useConfig from './use-config'
import type { ParameterExtractorNodeType } from './types'
import ExtractParameter from './components/extract-parameter/list'
import ImportFromTool from './components/extract-parameter/import-from-tool'
import AddExtractParameter from './components/extract-parameter/update'
import ReasoningModePicker from './components/reasoning-mode-picker'
import Field from '@/app/components/workflow/nodes/_base/components/field'
import Split from '@/app/components/workflow/nodes/_base/components/split'
import ModelParameterModal from '@/app/components/header/account-setting/model-provider-page/model-parameter-modal'
import OutputVars, { VarItem } from '@/app/components/workflow/nodes/_base/components/output-vars'
import { InputVarType, type NodePanelProps } from '@/app/components/workflow/types'
import TooltipPlus from '@/app/components/base/tooltip-plus'
import { HelpCircle } from '@/app/components/base/icons/src/vender/line/general'
import BeforeRunForm from '@/app/components/workflow/nodes/_base/components/before-run-form'
import { VarType } from '@/app/components/workflow/types'

const i18nPrefix = 'workflow.nodes.parameterExtractor'
const i18nCommonPrefix = 'workflow.common'

const Panel: FC<NodePanelProps<ParameterExtractorNodeType>> = ({
  id,
  data,
}) => {
  const { t } = useTranslation()

  const {
    readOnly,
    inputs,
    handleInputVarChange,
    filterVar,
    isChatModel,
    isChatMode,
    isCompletionModel,
    handleModelChanged,
    handleImportFromTool,
    handleCompletionParamsChange,
    addExtractParameter,
    handleExactParamsChange,
    handleInstructionChange,
    hasSetBlockStatus,
    handleMemoryChange,
    isSupportFunctionCall,
    handleReasoningModeChange,
    availableVars,
    availableNodesWithParent,
    inputVarValues,
    varInputs,
    isShowSingleRun,
    hideSingleRun,
    runningStatus,
    handleRun,
    handleStop,
    runResult,
    setInputVarValues,
  } = useConfig(id, data)

  const model = inputs.model

  return (
    <div className='mt-2'>
      <div className='px-4 pb-4 space-y-4'>
        <Field
          title={t(`${i18nPrefix}.inputVar`)}
        >
          <>
            <VarReferencePicker
              readonly={readOnly}
              nodeId={id}
              isShowNodeName
              value={inputs.query || []}
              onChange={handleInputVarChange}
              filterVar={filterVar}
            />
          </>
        </Field>
        <Field
          title={t(`${i18nCommonPrefix}.model`)}
        >
          <ModelParameterModal
            popupClassName='!w-[387px]'
            isInWorkflow
            isAdvancedMode={true}
            mode={model?.mode}
            provider={model?.provider}
            completionParams={model?.completion_params}
            modelId={model?.name}
            setModel={handleModelChanged}
            onCompletionParamsChange={handleCompletionParamsChange}
            hideDebugWithMultipleModel
            debugWithMultipleModel={false}
            readonly={readOnly}
          />
        </Field>
        <Field
          title={t(`${i18nPrefix}.extractParameters`)}
          operations={
            !readOnly
              ? (
                <div className='flex items-center space-x-1'>
                  {!readOnly && (
                    <ImportFromTool onImport={handleImportFromTool} />
                  )}
                  {!readOnly && (<div className='w-px h-3 bg-gray-200'></div>)}
                  <AddExtractParameter type='add' onSave={addExtractParameter} />
                </div>
              )
              : undefined
          }
        >
          <ExtractParameter
            readonly={readOnly}
            list={inputs.parameters || []}
            onChange={handleExactParamsChange}
          />
        </Field>
        <Editor
          title={
            <div className='flex items-center space-x-1'>
              <span className='uppercase'>{t(`${i18nPrefix}.instruction`)}</span>
              <TooltipPlus popupContent={
                <div className='w-[120px]'>
                  {t(`${i18nPrefix}.instructionTip`)}
                </div>}>
                <HelpCircle className='w-3.5 h-3.5 ml-0.5 text-gray-400' />
              </TooltipPlus>
            </div>
          }
          value={inputs.instruction}
          onChange={handleInstructionChange}
          readOnly={readOnly}
          isChatModel={isChatModel}
          isChatApp={isChatMode}
          isShowContext={false}
          hasSetBlockStatus={hasSetBlockStatus}
          nodesOutputVars={availableVars}
          availableNodes={availableNodesWithParent}
        />
        <Field
          title={t(`${i18nPrefix}.advancedSetting`)}
          supportFold
        >
          <>

            {/* Memory */}
            {isChatMode && (
              <div className='mt-4'>
                <MemoryConfig
                  readonly={readOnly}
                  config={{ data: inputs.memory }}
                  onChange={handleMemoryChange}
                  canSetRoleName={isCompletionModel}
                />
              </div>
            )}
            {isSupportFunctionCall && (
              <div className='mt-2'>
                <ReasoningModePicker
                  type={inputs.reasoning_mode}
                  onChange={handleReasoningModeChange}
                />
              </div>
            )}
          </>
        </Field>

      </div>
      {inputs.parameters?.length > 0 && (<>
        <Split />
        <div className='px-4 pt-4 pb-2'>
          <OutputVars>
            <>
              <VarItem
                name='__is_success'
                type={VarType.number}
                description={t(`${i18nPrefix}.isSuccess`)}
              />
              <VarItem
                name='__reason'
                type={VarType.string}
                description={t(`${i18nPrefix}.errorReason`)}
              />
              {inputs.parameters.map((param, index) => (
                <VarItem
                  key={index}
                  name={param.name}
                  type={param.type}
                  description={param.description}
                />
              ))}
            </>
          </OutputVars>
        </div>
      </>)}
      {isShowSingleRun && (
        <BeforeRunForm
          nodeName={inputs.title}
          onHide={hideSingleRun}
          forms={[
            {
              inputs: [{
                label: t(`${i18nPrefix}.inputVar`)!,
                variable: 'query',
                type: InputVarType.paragraph,
                required: true,
              }, ...varInputs],
              values: inputVarValues,
              onChange: setInputVarValues,
            },
          ]}
          runningStatus={runningStatus}
          onRun={handleRun}
          onStop={handleStop}
          result={<ResultPanel {...runResult} showSteps={false} />}
        />
      )}
    </div>
  )
}

export default React.memo(Panel)
