import {
  Plus,
  Trash2,
} from "lucide-react";

import SettingToggle from "../SettingToggle";
import SettingSelect from "../SettingSelect";

function createRule(
  defaultField = "",
) {
  return {
    id:
      typeof crypto !==
        "undefined" &&
      crypto.randomUUID
        ? crypto.randomUUID()
        : `rule-${Date.now()}-${Math.random()}`,

    enabled: true,
    field: defaultField,
    operator: "greaterThan",
    value: 1000,
    color: "#22c55e",
    applyTo: "sameSeries",
  };
}

function ConditionalFormattingSection({
  openSection,
  toggleSection,
  settings,
  updateSetting,
  chartConfig,
}) {
  const isOpen =
    openSection ===
    "conditionalFormatting";

  const yKeys = Array.isArray(
    chartConfig.y,
  )
    ? chartConfig.y
    : chartConfig.y
      ? [chartConfig.y]
      : [];

  const conditionalFormatting =
    settings.conditionalFormatting || {
      enabled: false,
      rules: [],
    };

  const rules = Array.isArray(
    conditionalFormatting.rules,
  )
    ? conditionalFormatting.rules
    : [];

  const updateConditionalFormatting = (
    updates,
  ) => {
    updateSetting(
      "conditionalFormatting",
      {
        ...conditionalFormatting,
        ...updates,
      },
    );
  };

  const addRule = () => {
    updateConditionalFormatting({
      rules: [
        ...rules,
        createRule(
          yKeys[0] || "",
        ),
      ],
    });
  };

  const updateRule = (
    ruleId,
    key,
    value,
  ) => {
    updateConditionalFormatting({
      rules: rules.map(
        (rule) =>
          rule.id === ruleId
            ? {
                ...rule,
                [key]: value,
              }
            : rule,
      ),
    });
  };

  const removeRule = (
    ruleId,
  ) => {
    updateConditionalFormatting({
      rules: rules.filter(
        (rule) =>
          rule.id !== ruleId,
      ),
    });
  };

  const operatorOptions = [
    {
      value: "greaterThan",
      label: "Greater than >",
    },
    {
      value:
        "greaterThanOrEqual",
      label:
        "Greater than or equal ≥",
    },
    {
      value: "lessThan",
      label: "Less than <",
    },
    {
      value: "lessThanOrEqual",
      label:
        "Less than or equal ≤",
    },
    {
      value: "equals",
      label: "Equals =",
    },
    {
      value: "notEquals",
      label: "Not equal ≠",
    },
  ];

  return (
    <div className="app-border border-b">
      <button
        type="button"
        onClick={() =>
          toggleSection(
            "conditionalFormatting",
          )
        }
        className="
          app-surface-secondary
          app-text
          flex w-full
          items-center
          justify-between
          p-4
          text-xs
          font-bold
          transition-colors
          hover:bg-[rgb(var(--color-surface-hover))]
        "
      >
        Conditional Formatting

        <span
          className={`transition-transform ${
            isOpen
              ? "rotate-180"
              : ""
          }`}
        >
          ^
        </span>
      </button>

      {isOpen && (
        <div className="space-y-4 p-4">
          <SettingToggle
            label="Enable conditional formatting"
            checked={
              conditionalFormatting.enabled ??
              false
            }
            onChange={(checked) =>
              updateConditionalFormatting({
                enabled: checked,
              })
            }
          />

          {yKeys.length === 0 && (
            <div
              className="
                app-surface-secondary
                app-border
                rounded-lg
                border
                p-3
              "
            >
              <p className="app-text-muted text-xs">
                Add a field to the Y axis
                before creating formatting
                rules.
              </p>
            </div>
          )}

          {conditionalFormatting.enabled &&
            rules.length > 0 && (
              <div className="space-y-3">
                <p className="app-text-muted text-[10px] font-bold uppercase tracking-wider">
                  Formatting Rules
                </p>

                {rules.map(
                  (
                    rule,
                    index,
                  ) => (
                    <div
                      key={rule.id}
                      className="
                        app-surface-secondary
                        app-border
                        space-y-4
                        rounded-xl
                        border
                        p-3
                      "
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="
                              flex h-6 w-6
                              shrink-0
                              items-center
                              justify-center
                              rounded-md
                              bg-[rgb(var(--color-primary)/0.12)]
                              text-[10px]
                              font-bold
                              text-[rgb(var(--color-primary))]
                            "
                          >
                            {index + 1}
                          </span>

                          <span className="app-text-secondary truncate text-xs font-bold">
                            Rule{" "}
                            {index + 1}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeRule(
                              rule.id,
                            )
                          }
                          className="
                            app-text-muted
                            rounded-lg
                            p-1.5
                            transition-colors
                            hover:bg-[rgb(var(--color-danger)/0.12)]
                            hover:text-[rgb(var(--color-danger))]
                          "
                          title="Delete rule"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>
                      </div>

                      <SettingToggle
                        label="Rule enabled"
                        checked={
                          rule.enabled !==
                          false
                        }
                        onChange={(
                          checked,
                        ) =>
                          updateRule(
                            rule.id,
                            "enabled",
                            checked,
                          )
                        }
                      />

                      <SettingSelect
                        label="Field"
                        value={
                          rule.field ||
                          ""
                        }
                        options={[
                          {
                            value: "",
                            label:
                              "Select field",
                          },
                          ...yKeys.map(
                            (
                              field,
                            ) => ({
                              value:
                                field,
                              label:
                                field,
                            }),
                          ),
                        ]}
                        onChange={(
                          value,
                        ) =>
                          updateRule(
                            rule.id,
                            "field",
                            value,
                          )
                        }
                      />

                      <SettingSelect
                        label="Condition"
                        value={
                          rule.operator ||
                          "greaterThan"
                        }
                        options={
                          operatorOptions
                        }
                        onChange={(
                          value,
                        ) =>
                          updateRule(
                            rule.id,
                            "operator",
                            value,
                          )
                        }
                      />

                      <div className="space-y-1.5">
                        <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                          Value
                        </label>

                        <input
                          type="number"
                          value={
                            rule.value ??
                            ""
                          }
                          onChange={(
                            event,
                          ) =>
                            updateRule(
                              rule.id,
                              "value",
                              event
                                .target
                                .value ===
                                ""
                                ? ""
                                : Number(
                                    event
                                      .target
                                      .value,
                                  ),
                            )
                          }
                          className="app-input w-full text-sm"
                          placeholder="1000"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                          Color
                        </label>

                        <div
                          className="
                            app-input
                            flex h-10
                            items-center
                            gap-2
                            px-2
                          "
                        >
                          <input
                            type="color"
                            value={
                              rule.color ||
                              "#22c55e"
                            }
                            onChange={(
                              event,
                            ) =>
                              updateRule(
                                rule.id,
                                "color",
                                event
                                  .target
                                  .value,
                              )
                            }
                            className="
                              h-7 w-9
                              shrink-0
                              cursor-pointer
                              border-none
                              bg-transparent
                              p-0
                            "
                          />

                          <span
                            className="
                              h-5 w-5
                              shrink-0
                              rounded
                              border
                              border-[rgb(var(--color-border))]
                            "
                            style={{
                              backgroundColor:
                                rule.color ||
                                "#22c55e",
                            }}
                          />

                          <input
                            type="text"
                            value={
                              rule.color ||
                              "#22c55e"
                            }
                            onChange={(
                              event,
                            ) =>
                              updateRule(
                                rule.id,
                                "color",
                                event
                                  .target
                                  .value,
                              )
                            }
                            className="
                              app-text-secondary
                              min-w-0
                              flex-1
                              bg-transparent
                              font-mono
                              text-xs
                              uppercase
                              outline-none
                            "
                          />
                        </div>
                      </div>

                      <SettingSelect
                        label="Apply color to"
                        value={
                          rule.applyTo ||
                          "sameSeries"
                        }
                        options={[
                          {
                            value:
                              "sameSeries",
                            label:
                              "Selected field only",
                          },
                          {
                            value:
                              "allSeries",
                            label:
                              "All series",
                          },
                        ]}
                        onChange={(
                          value,
                        ) =>
                          updateRule(
                            rule.id,
                            "applyTo",
                            value,
                          )
                        }
                      />
                    </div>
                  ),
                )}
              </div>
            )}

          {conditionalFormatting.enabled &&
            rules.length === 0 &&
            yKeys.length > 0 && (
              <div
                className="
                  app-surface-secondary
                  app-border
                  rounded-lg
                  border-2
                  border-dashed
                  p-3
                  text-center
                "
              >
                <p className="app-text-muted text-xs">
                  Add a rule to color
                  values based on a
                  condition.
                </p>
              </div>
            )}

          {conditionalFormatting.enabled && (
            <button
              type="button"
              onClick={addRule}
              disabled={
                yKeys.length === 0
              }
              className="
                btn-secondary
                flex w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                px-3
                py-2
                text-xs
                font-semibold
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Plus size={15} />
              Add Rule
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ConditionalFormattingSection;