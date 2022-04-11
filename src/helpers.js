import chroma from 'chroma-js'
import { toast } from 'react-toastify'

import { onlyNumbers, removeAccents } from 'core/helpers/format'

export const GOOGLE_MAPS_KEY = 'AIzaSyCganOYxAIipASwXwDbcIfH8Ul4m7Kq9Pw'

export function modalSubmit({ path, data, service, form, refresh, route }) {
  service
    .addOrUpdate(path, data)
    .then(refresh)
    .then(() => {
      route.history.goBack()
      form.setSubmitting(false)
    })
    .catch(err => form.setErrors({ global: err.message }))
}

export function submit({ path, callback, data, service, form }) {
  return service
    .addOrUpdate(path, data)
    .then(callback)
    .catch(err => form.setErrors({ global: err.message }))
}

export const slugify = text =>
  removeAccents(text)
    .toLowerCase()
    .replace(/[^A-Za-z]/g, '')

export const getAddress = cep =>
  fetch(`https://viacep.com.br/ws/${onlyNumbers(cep)}/json`).then(r => r.json())

export async function getGeometry({ streetName, streetNumber, district, city }) {
  const query = [streetNumber, streetName, district, city].filter(i => !!i).join(',')
  const request = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${GOOGLE_MAPS_KEY}`,
  )

  return request.json()
}

export const colorizedStyles = {
  control: styles => ({ ...styles, backgroundColor: 'white' }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma(data.color)

    let backgroundColor = null
    let styleColor = data.color

    if (isSelected) {
      backgroundColor = data.color
      styleColor = chroma.contrast(color, 'white') > 2 ? 'white' : 'black'
    } else if (isFocused) {
      backgroundColor = color.alpha(0.1).css()
    }

    if (isDisabled) {
      styleColor = '#ccc'
    }

    return {
      ...styles,
      backgroundColor,
      color: styleColor,
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled && (isSelected ? data.color : color.alpha(0.3).css()),
      },
    }
  },
  multiValue: (styles, { data }) => {
    const color = chroma(data.color)
    return {
      ...styles,
      backgroundColor: color.alpha(0.1).css(),
    }
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: data.color,
    ':hover': {
      backgroundColor: data.color,
      color: 'white',
    },
  }),
}

export const successMessage = message => {
  toast.success(message)
}

export const errorMessage = (message, error = null) => {
  toast.error(`${message} ${error !== null ? error : ''}`)
}

export const warnMessage = warn => {
  toast.warn(warn)
}
