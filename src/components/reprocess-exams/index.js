import React, { useState } from 'react'
import { Field } from 'core/components/form/field'
import { Button } from 'core/components/button'

export const ReprocessExams = ({ global, service }) => {
  const { modal } = global

  const [fetching, setFetching] = useState(false)

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-microscope" />
            </span>
            <h3 className="kt-portlet__head-title">Reprocessar Exames</h3>
          </div>
        </div>
        <div className="kt-portlet__body kt-pb-0 position-relative">
          <div className="row">
            <div className="col-lg kt-align-right">
              <Field>
                <Button
                  customClassName="btn-info btn-icon-sm"
                  icon="fas fa-search"
                  loading={fetching}
                  disabled={fetching}
                  onClick={() => {
                    setFetching(true)
                    service
                      .post('exam.reprocess', {})
                      .then(() => {
                        setFetching(false)
                      })
                      .catch(err => modal.alert(err.message))
                  }}
                  title="Reprocessar"
                />
              </Field>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
