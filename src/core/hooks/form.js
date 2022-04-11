import { useState } from 'react'
import { deepMerge } from 'core/helpers/functional'
import { fillObject } from 'core/helpers/misc'
import { setValueInPath } from 'core/helpers/path'

const initialStatus = {
  displayName: '',
  submitting: false,
  errors: {},
  touched: {},
}

export function useForm(settings, route) {
  const hasId = !!route.match.params.id
  const [fetching, setFetching] = useState(hasId)
  const [status, setStatus] = useState(initialStatus)
  const [entity, setEntity] = useState(settings.initialEntity)
  const abortControl = new AbortController()

  return {
    entity,
    hasId,
    fetching,
    submitting: status.submitting,
    displayName: status.displayName,
    errors: status.errors,
    touched: status.touched,
    handleSubmit: onSubmit => {
      const errors = settings.validate(entity)
      const canSubmit = Object.values(errors).length === 0

      setStatus(prev => ({
        ...prev,
        touched: fillObject(entity, true),
        submitting: canSubmit,
        errors,
      }))

      const elem = document.activeElement

      if ('blur' in elem) {
        elem.blur()
      }

      if (canSubmit) {
        onSubmit(entity)
      }
    },
    handleFetch: ({ action, errorFn, mapper }) => {
      const handleError = err => {
        setFetching(false)
        errorFn(err)
      }

      const finallyDo = ent => {
        setStatus(prev => ({
          ...prev,
          displayName: settings.displayName ? settings.displayName(ent).toString() : '',
        }))
        setFetching(false)
        setEntity(prev => deepMerge(prev, ent))
      }

      setFetching(true)
      action(route.match.params.id, abortControl).then(resp => {
        const promEnt = !mapper ? resp : mapper(resp)

        if (promEnt instanceof Promise) {
          promEnt.then(ent => finallyDo(ent)).catch(handleError)
        } else {
          finallyDo(promEnt)
        }
      })
    },
    handleChange: ({ type = 'select', path, values }) => {
      if (type === 'blur') {
        setStatus(prev => ({
          ...prev,
          touched: setValueInPath(prev.touched, path, true),
          errors: settings.validate(entity),
        }))

        return
      }

      setEntity(prev => {
        const ent = values instanceof Function ? values(prev) : { ...prev, ...values }

        setStatus(prevStat => {
          const errors = settings.validate(ent)
          let touched = { ...prevStat.touched }

          if (type === 'select') {
            touched = setValueInPath(touched, path, true)
          }

          return { ...prevStat, errors, touched }
        })

        return ent
      })
    },
    setSubmitting: submitting => setStatus(prev => ({ ...prev, submitting })),
    setErrors: errors =>
      setStatus(prev => ({
        ...prev,
        errors: { ...prev.errors, ...errors },
        submitting: false,
      })),
    setValues: values =>
      setEntity(prev => ({
        ...prev,
        ...(values instanceof Function ? values(prev) : values),
      })),
    resetForm: () => {
      setFetching(false)
      setEntity(settings.initialEntity)
      setStatus(initialStatus)
    },
  }
}
