import React, { useEffect, useState, forwardRef, useRef } from 'react'
import { Card, Row, Col, Form, Container } from 'react-bootstrap'
import RangeSlider from 'react-bootstrap-range-slider'
import { annexureGenerationByAmount } from '../../../Common/Services/OtherServices'
import { toast } from 'react-toastify'
import { formatCurrency } from '../../../Common/CommonComponents/CurrencyFormate'
import { useSelector } from 'react-redux'
import { ToastError } from '../../../Common/CommonComponents/ToastCustomized'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
// Creating the component with forwardRef to allow parent access to the child DOM node
const Annexure = forwardRef((props, ref) => {
    const userDetails = useSelector((state) => state.user.userDetails) // Getting user details from Redux
    const [value, setValue] = useState(props.averageSal) // CTC value from props
    const [minValue, setMinValue] = useState(props.minValue) // Min salary
    const [maxValue, setMaxValue] = useState(props.maxValue) // Max salary
    const [annexure, setAnnexure] = useState(null) // Stores generated annexure
    const [shouldUpdate, setShouldUpdate] = useState(false) // Flag to control when to regenerate annexure
    const [currencyCode, setCurrencyCode] = useState(props.currencyCode) // Currency code
    const [isSliding, setIsSliding] = useState(false) // Track if the slider is in use
    const debounceTimeout = useRef(null) // Ref to hold timeout ID for debouncing
    const [action, setAction] = useState(null) // Action prop used to determine read-only mode
    const [loading, setLoading] = useState(true) // Loading indicator

    // Keys to render specific annexure sections
    const requiredKeys = ['earnings', 'deductions', 'total', 'totalEarnings', 'totaldeductions']
    // Handler for slider movement
    const sliderHandler = (e) => {
        setValue(e.target.value)
        setIsSliding(true)
    }
    // Triggered after slider stops moving, debounced to avoid rapid requests
    const slideCompleteHandler = () => {
        setIsSliding(false)
        clearTimeout(debounceTimeout.current)
        debounceTimeout.current = setTimeout(() => {
            annexureGenerationHandler()
        }, 300)
    }

    // Input field change handler
    const formInputHandler = (e) => {
        setValue(Number(e.target.value))
    }
    // Input blur handler for validation
    const formInputBlurHandler = (e) => {
        if (Number(e.target.value) < minValue || Number(e.target.value) > maxValue) {
            toast.error(`The value should be within ${minValue} and ${maxValue}`)
        } else {
            setShouldUpdate(true)
        }
    }
    // Initial render: call annexure generator
    useEffect(() => {
        annexureGenerationHandler()
    }, [])
    // Whenever props change (especially range), update state accordingly
    useEffect(() => {
        if (!props.maxValue) {
            setAction(props.action)
        } else {
            const averageSal = (Number(props.minValue) + Number(props.maxValue)) / 2
            setMinValue(Number(props.minValue))
            setMaxValue(Number(props.maxValue))
            setValue(averageSal)
            setCurrencyCode(props.currencyCode)
            setShouldUpdate(true)
        }
    }, [props.minValue, props.maxValue, props.currencyCode, props.averageSal])
    // If value changes and within range and not sliding, generate annexure
    useEffect(() => {
        if (value !== null && value > minValue && value < maxValue && !isSliding && shouldUpdate) {
            setLoading(true)
            setAnnexure([])
            slideCompleteHandler()
        }
    }, [value, isSliding, shouldUpdate])
    // Actual API call to generate annexure
    const annexureGenerationHandler = () => {
        if (value === undefined || value <= 0) {
            return
        }
        setLoading(true)
        annexureGenerationByAmount({
            mode: props.mode,
            amount: value,
            organizationId: userDetails.organizationId,
            templateId: props.templateId,
            body: props.body
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setAnnexure(res.data)
                    setLoading(false)
                    setShouldUpdate(false)
                }
            })
            .catch(() => {
                ToastError('Failed to generate annexure')
                setLoading(false)
            })
    }
    // Format amount based on currency
    const currencyFormateHandler = (amount) => {
        return formatCurrency(amount, currencyCode || 'INR')
    }
    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            clearTimeout(debounceTimeout.current)
        }
    }, [])

    return (
        <Container>
            <Card>
                {/* Only render form controls if not read-only */}
                {action == 'readOnly' ? (
                    <></>
                ) : (
                    <Form style={{ marginTop: '2%' }}>
                        <Form.Group as={Row} className="justify-content-center">
                            <Form.Label column md={1} className="text-right">
                                CTC
                            </Form.Label>
                            {/* Slider with min/max labels */}
                            <Col md={4}>
                                <div style={{ margin: '0 auto' }}>
                                    <div
                                        style={{ display: 'flex', justifyContent: 'space-between' }}
                                    >
                                        <span>{currencyFormateHandler(minValue)}</span>
                                        <span>{currencyFormateHandler(maxValue)}</span>
                                    </div>
                                    <RangeSlider
                                        value={value}
                                        min={minValue}
                                        max={maxValue}
                                        onChange={sliderHandler}
                                        tooltip="off"
                                        style={{ width: '100%' }}
                                        onAfterChange={slideCompleteHandler}
                                    />
                                </div>
                            </Col>
                            {/* Input field for exact CTC value */}
                            <Col md={2} className="flex">
                                <Form.Control
                                    type="number"
                                    style={{ textAlign: 'right' }}
                                    value={value}
                                    onChange={formInputHandler}
                                    min={minValue}
                                    max={maxValue}
                                    onBlur={formInputBlurHandler}
                                />
                            </Col>
                            {/* Currency info */}
                            <Col md={2} className="flex">
                                <Form.Label column>Currency</Form.Label>
                            </Col>

                            <Col md={2} className="flex">
                                <Form.Control disabled value={`${currencyCode}`} />
                            </Col>
                        </Form.Group>
                    </Form>
                )}
                {/* Loading spinner */}
                {loading ? (
                    <DetailLoader />
                ) : (
                    <Card.Body ref={ref}>
                        {/* Render annexure only if data is present */}
                        {annexure
                            ? Object.keys(annexure).map((component, componentIndex) =>
                                  requiredKeys.map(
                                      (requiredKey) =>
                                          requiredKey === component &&
                                          (Array.isArray(annexure[component]) ? (
                                              // Earnings or Deductions List
                                              <Card className="mb-3" key={componentIndex}>
                                                  <Card.Body>
                                                      <Card.Title>
                                                          {component === 'earnings'
                                                              ? `Gross Earnings (A)`
                                                              : `Benefits(B)`}
                                                      </Card.Title>
                                                      <table className="table">
                                                          <thead>
                                                              <tr>
                                                                  <th className="col-6">
                                                                      Component
                                                                  </th>
                                                                  <th
                                                                      className="col-3"
                                                                      style={{ textAlign: 'right' }}
                                                                  >
                                                                      Per Annum
                                                                  </th>
                                                                  <th
                                                                      className="col-3"
                                                                      style={{ textAlign: 'right' }}
                                                                  >
                                                                      Per Month
                                                                  </th>
                                                              </tr>
                                                          </thead>
                                                          <tbody>
                                                              {annexure[component].map(
                                                                  (record, recordIndex) => (
                                                                      <tr
                                                                          key={recordIndex}
                                                                          style={{
                                                                              background: 'none'
                                                                          }}
                                                                      >
                                                                          <td
                                                                              className="col-6"
                                                                              style={{
                                                                                  border: 'none'
                                                                              }}
                                                                          >
                                                                              {record.name}
                                                                          </td>
                                                                          <td
                                                                              className="col-3"
                                                                              style={{
                                                                                  textAlign:
                                                                                      'right',
                                                                                  border: 'none'
                                                                              }}
                                                                          >
                                                                              {currencyFormateHandler(
                                                                                  record.annual
                                                                              )}
                                                                          </td>
                                                                          <td
                                                                              className="col-3"
                                                                              style={{
                                                                                  textAlign:
                                                                                      'right',
                                                                                  border: 'none'
                                                                              }}
                                                                          >
                                                                              {currencyFormateHandler(
                                                                                  record.monthly
                                                                              )}
                                                                          </td>
                                                                      </tr>
                                                                  )
                                                              )}
                                                          </tbody>
                                                      </table>
                                                  </Card.Body>
                                              </Card>
                                          ) : (
                                              // Total earnings/deductions/CTC rows
                                              <Card key={componentIndex}>
                                                  <Card.Body>
                                                      <table className="table">
                                                          <tbody
                                                              style={{
                                                                  backgroundColor:
                                                                      component === 'total'
                                                                          ? 'palegreen'
                                                                          : 'palegoldenrod'
                                                              }}
                                                          >
                                                              <tr>
                                                                  <td>
                                                                      {component ===
                                                                      'totaldeductions'
                                                                          ? 'Total Benefits (B)'
                                                                          : component === 'total'
                                                                            ? 'Cost to Company (A + B)'
                                                                            : 'Total Earnings (A)'}
                                                                  </td>
                                                                  <td
                                                                      className="col-3"
                                                                      style={{ textAlign: 'right' }}
                                                                  >
                                                                      {' '}
                                                                      {currencyFormateHandler(
                                                                          annexure[component].annual
                                                                      )}
                                                                  </td>
                                                                  <td
                                                                      className="col-3"
                                                                      style={{ textAlign: 'right' }}
                                                                  >
                                                                      {' '}
                                                                      {currencyFormateHandler(
                                                                          annexure[component]
                                                                              .monthly
                                                                      )}
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </Card.Body>
                                              </Card>
                                          ))
                                  )
                              )
                            : null}
                    </Card.Body>
                )}
            </Card>
        </Container>
    )
})

export default Annexure
