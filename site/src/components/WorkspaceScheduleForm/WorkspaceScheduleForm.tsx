import Checkbox from "@material-ui/core/Checkbox"
import FormControl from "@material-ui/core/FormControl"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import FormGroup from "@material-ui/core/FormGroup"
import FormHelperText from "@material-ui/core/FormHelperText"
import FormLabel from "@material-ui/core/FormLabel"
import MenuItem from "@material-ui/core/MenuItem"
import makeStyles from "@material-ui/core/styles/makeStyles"
import TextField from "@material-ui/core/TextField"
import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import { useFormik } from "formik"
import { FC } from "react"
import * as Yup from "yup"
import { FieldErrors } from "../../api/errors"
import { Workspace } from "../../api/typesGenerated"
import { getFormHelpers } from "../../util/formUtils"
import { isWorkspaceOn } from "../../util/workspace"
import { FormFooter } from "../FormFooter/FormFooter"
import { FullPageForm } from "../FullPageForm/FullPageForm"
import { Stack } from "../Stack/Stack"
import { zones } from "./zones"

// REMARK: some plugins depend on utc, so it's listed first. Otherwise they're
//         sorted alphabetically.
dayjs.extend(utc)
dayjs.extend(advancedFormat)
dayjs.extend(isSameOrBefore)
dayjs.extend(timezone)

export const Language = {
  errorNoDayOfWeek: "Must set at least one day of week",
  errorNoTime: "Start time is required",
  errorTime: "Time must be in HH:mm format (24 hours)",
  errorTimezone: "Invalid timezone",
  daysOfWeekLabel: "Days of Week",
  daySundayLabel: "Sunday",
  dayMondayLabel: "Monday",
  dayTuesdayLabel: "Tuesday",
  dayWednesdayLabel: "Wednesday",
  dayThursdayLabel: "Thursday",
  dayFridayLabel: "Friday",
  daySaturdayLabel: "Saturday",
  startTimeLabel: "Start time",
  startTimeHelperText: "Your workspace will automatically start at this time.",
  timezoneLabel: "Timezone",
  ttlLabel: "Time until shutdown (hours)",
  ttlHelperText: "Your workspace will automatically shut down after this amount of time has elapsed.",
  ttlCausesShutdownHelperText: "Your workspace will shut down",
  ttlCausesShutdownAt: "at",
  ttlCausesShutdownImmediately: "immediately!",
  ttlCausesShutdownSoon: "within 30 minutes.",
  ttlCausesNoShutdownHelperText: "Your workspace will not automatically shut down.",
}

export interface WorkspaceScheduleFormProps {
  fieldErrors?: FieldErrors
  initialValues?: WorkspaceScheduleFormValues
  isLoading: boolean
  now?: dayjs.Dayjs
  onCancel: () => void
  onSubmit: (values: WorkspaceScheduleFormValues) => void
  workspace: Workspace
}

export interface WorkspaceScheduleFormValues {
  sunday: boolean
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean

  startTime: string
  timezone: string
  ttl: number
}

export const validationSchema = Yup.object({
  sunday: Yup.boolean(),
  monday: Yup.boolean().test("at-least-one-day", Language.errorNoDayOfWeek, function (value) {
    const parent = this.parent as WorkspaceScheduleFormValues

    if (!parent.startTime) {
      return true
    } else {
      return ![
        parent.sunday,
        value,
        parent.tuesday,
        parent.wednesday,
        parent.thursday,
        parent.friday,
        parent.saturday,
      ].every((day) => day === false)
    }
  }),
  tuesday: Yup.boolean(),
  wednesday: Yup.boolean(),
  thursday: Yup.boolean(),
  friday: Yup.boolean(),
  saturday: Yup.boolean(),

  startTime: Yup.string()
    .ensure()
    .test("required-if-day-selected", Language.errorNoTime, function (value) {
      const parent = this.parent as WorkspaceScheduleFormValues

      const isDaySelected = [
        parent.sunday,
        parent.monday,
        parent.tuesday,
        parent.wednesday,
        parent.thursday,
        parent.friday,
        parent.saturday,
      ].some((day) => day)

      if (isDaySelected) {
        return value !== ""
      } else {
        return true
      }
    })
    .test("is-time-string", Language.errorTime, (value) => {
      if (value === "") {
        return true
      } else if (!/^[0-9][0-9]:[0-9][0-9]$/.test(value)) {
        return false
      } else {
        const parts = value.split(":")
        const HH = Number(parts[0])
        const mm = Number(parts[1])
        return HH >= 0 && HH <= 23 && mm >= 0 && mm <= 59
      }
    }),
  timezone: Yup.string()
    .ensure()
    .test("is-timezone", Language.errorTimezone, function (value) {
      const parent = this.parent as WorkspaceScheduleFormValues

      if (!parent.startTime) {
        return true
      } else {
        // Unfortunately, there's not a good API on dayjs at this time for
        // evaluating a timezone. Attempt to parse today in the supplied timezone
        // and return as valid if the function doesn't throw.
        try {
          dayjs.tz(dayjs(), value)
          return true
        } catch (e) {
          return false
        }
      }
    }),
  ttl: Yup.number()
    .integer()
    .min(0)
    .max(24 * 7 /* 7 days */),
})

export const defaultWorkspaceScheduleTTL = 8

export const defaultWorkspaceSchedule = (
  ttl = defaultWorkspaceScheduleTTL,
  timezone = dayjs.tz.guess(),
): WorkspaceScheduleFormValues => ({
  sunday: false,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,

  startTime: "09:30",
  timezone,
  ttl,
})

export const WorkspaceScheduleForm: FC<WorkspaceScheduleFormProps> = ({
  fieldErrors,
  initialValues = defaultWorkspaceSchedule(),
  isLoading,
  now = dayjs(),
  onCancel,
  onSubmit,
  workspace,
}) => {
  const styles = useStyles()

  const form = useFormik<WorkspaceScheduleFormValues>({
    initialValues,
    onSubmit,
    validationSchema,
  })
  const formHelpers = getFormHelpers<WorkspaceScheduleFormValues>(form, fieldErrors)

  const checkboxes: Array<{ value: boolean; name: string; label: string }> = [
    { value: form.values.sunday, name: "sunday", label: Language.daySundayLabel },
    { value: form.values.monday, name: "monday", label: Language.dayMondayLabel },
    { value: form.values.tuesday, name: "tuesday", label: Language.dayTuesdayLabel },
    { value: form.values.wednesday, name: "wednesday", label: Language.dayWednesdayLabel },
    { value: form.values.thursday, name: "thursday", label: Language.dayThursdayLabel },
    { value: form.values.friday, name: "friday", label: Language.dayFridayLabel },
    { value: form.values.saturday, name: "saturday", label: Language.daySaturdayLabel },
  ]

  return (
    <FullPageForm onCancel={onCancel} title="Workspace Schedule">
      <form onSubmit={form.handleSubmit} className={styles.form}>
        <Stack>
          <TextField
            {...formHelpers("startTime", Language.startTimeHelperText)}
            disabled={isLoading}
            InputLabelProps={{
              shrink: true,
            }}
            label={Language.startTimeLabel}
            type="time"
          />

          <TextField
            {...formHelpers("timezone")}
            disabled={isLoading}
            InputLabelProps={{
              shrink: true,
            }}
            label={Language.timezoneLabel}
            select
          >
            {zones.map((zone) => (
              <MenuItem key={zone} value={zone}>
                {zone}
              </MenuItem>
            ))}
          </TextField>

          <FormControl component="fieldset" error={Boolean(form.errors.monday)}>
            <FormLabel className={styles.daysOfWeekLabel} component="legend">
              {Language.daysOfWeekLabel}
            </FormLabel>

            <FormGroup>
              {checkboxes.map((checkbox) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checkbox.value}
                      disabled={isLoading}
                      onChange={form.handleChange}
                      name={checkbox.name}
                      color="primary"
                      size="small"
                      disableRipple
                    />
                  }
                  key={checkbox.name}
                  label={checkbox.label}
                />
              ))}
            </FormGroup>

            {form.errors.monday && <FormHelperText>{Language.errorNoDayOfWeek}</FormHelperText>}
          </FormControl>

          <TextField
            {...formHelpers("ttl", ttlShutdownAt(now, workspace, form.values.timezone, form.values.ttl))}
            disabled={isLoading}
            inputProps={{ min: 0, step: 1 }}
            label={Language.ttlLabel}
            type="number"
          />

          <FormFooter onCancel={onCancel} isLoading={isLoading} />
        </Stack>
      </form>
    </FullPageForm>
  )
}

export const ttlShutdownAt = (now: dayjs.Dayjs, workspace: Workspace, tz: string, formTTL: number): string => {
  // a manual shutdown has a deadline of '"0001-01-01T00:00:00Z"'
  // SEE: #1834
  const deadline = dayjs(workspace.latest_build.deadline).utc()
  const hasDeadline = deadline.year() > 1
  const ttl = workspace.ttl_ms ? workspace.ttl_ms / (1000 * 60 * 60) : 0
  const delta = formTTL - ttl

  if (delta === 0 || !isWorkspaceOn(workspace)) {
    return Language.ttlHelperText
  } else if (formTTL === 0) {
    return Language.ttlCausesNoShutdownHelperText
  } else {
    const newDeadline = dayjs(hasDeadline ? deadline : now).add(delta, "hours")
    if (newDeadline.isSameOrBefore(now)) {
      return `⚠️ ${Language.ttlCausesShutdownHelperText} ${Language.ttlCausesShutdownImmediately} ⚠️`
    } else if (newDeadline.isSameOrBefore(now.add(30, "minutes"))) {
      return `⚠️ ${Language.ttlCausesShutdownHelperText} ${Language.ttlCausesShutdownSoon} ⚠️`
    } else {
      return `${Language.ttlCausesShutdownHelperText} ${Language.ttlCausesShutdownAt} ${newDeadline
        .tz(tz)
        .format("MMM D, YYYY h:mm A")}.`
    }
  }
}

const useStyles = makeStyles({
  form: {
    "& input": {
      colorScheme: "dark",
    },
  },
  daysOfWeekLabel: {
    fontSize: 12,
  },
})
