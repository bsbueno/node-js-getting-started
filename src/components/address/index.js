import React, { useRef, useState } from 'react'
import { BrazilStates, CepMask } from 'core/constants'
import { Field } from 'core/components/form/field'
import { Select } from 'core/components/form/select'
import { TextInput } from 'core/components/form/text-input'
import { onlyNumbers } from 'core/helpers/format'
import { getAddress } from 'helpers'

export const AddressForm = ({ address, errors, touched, setValues, onBlurNumber, disabled }) => {
  const numberRef = useRef(null)
  const [loading, setLoading] = useState(false)

  return (
    <>
      <div className="row">
        <div className="col-lg-2">
          <Field label="CEP">
            <TextInput
              disabled={disabled}
              meta={{
                error: errors.postalCode,
                touched: touched.postalCode,
                loading,
              }}
              mask={CepMask}
              value={address.postalCode}
              onChange={(postalCode, type) => {
                setValues('postalCode', postalCode, type)

                if (type === 'blur' && onlyNumbers(postalCode).length === 8) {
                  setLoading(true)
                  getAddress(postalCode)
                    .then(resp => {
                      if (!resp.erro) {
                        setValues({
                          complement: resp.complemento,
                          city: resp.localidade,
                          streetName: resp.logradouro,
                          district: resp.bairro,
                          state: resp.uf,
                        })

                        numberRef.current.focus()
                      }
                    })
                    .finally(() => setLoading(false))
                }
              }}
            />
          </Field>
        </div>

        <div className="col-lg">
          <Field label="Endereço">
            <TextInput
              disabled={disabled}
              meta={{
                error: errors.streetName,
                touched: touched.streetName,
              }}
              value={address.streetName}
              onChange={(streetName, type) => setValues('streetName', streetName, type)}
            />
          </Field>
        </div>

        <div className="col-lg-2">
          <Field label="Número">
            <TextInput
              disabled={disabled}
              ref={numberRef}
              meta={{
                error: errors.streetNumber,
                touched: touched.streetNumber,
              }}
              value={address.streetNumber}
              onChange={(streetNumber, type) => {
                setValues('streetNumber', streetNumber, type)

                if (type === 'blur' && onBlurNumber) {
                  onBlurNumber()
                }
              }}
            />
          </Field>
        </div>

        <div className="col-lg">
          <Field label="Complemento">
            <TextInput
              disabled={disabled}
              meta={{
                error: errors.complement,
                touched: touched.complement,
              }}
              value={address.complement}
              onChange={(complement, type) => setValues('complement', complement, type)}
            />
          </Field>
        </div>
      </div>

      <div className="row">
        <div className="col-lg">
          <Field label="Bairro">
            <TextInput
              disabled={disabled}
              meta={{
                error: errors.district,
                touched: touched.district,
              }}
              value={address.district}
              onChange={(district, type) => setValues('district', district, type)}
            />
          </Field>
        </div>

        <div className="col-lg">
          <Field label="Cidade">
            <TextInput
              disabled={disabled}
              meta={{
                error: errors.city,
                touched: touched.city,
              }}
              value={address.city}
              onChange={(city, type) => setValues('city', city, type)}
            />
          </Field>
        </div>

        <div className="col-lg-3">
          <Field label="Estado">
            <Select
              disabled={disabled}
              items={BrazilStates}
              selected={address.state}
              getId={({ uf }) => uf}
              getDisplay={({ name }) => name}
              onChange={({ uf: state }) => setValues('state', state)}
            />
          </Field>
        </div>
      </div>
    </>
  )
}
