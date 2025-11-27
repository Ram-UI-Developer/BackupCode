import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { DeleteIcon } from '../../../Common/CommonIcons/CommonIcons'
import Table from '../../../Common/Table/Table'

const PTRules = ({ pTSlabs, setPTSlabs }) => {
    // Default slab state for tax or expense rules - initialized with one empty rule object
    const [defaultslab, setDefaultSlab] = useState([
        {
            fromValue: 0,
            toValue: null,
            amount: '', // Amount for this slab
            taxRuleId: '' // Associated tax rule
        }
    ])

    // Boolean state to control visibility (e.g., modal or form section)
    const [show, setShow] = useState(false)

    useEffect(() => {
        setDefaultSlab(pTSlabs.length != 0 ? pTSlabs : defaultslab)
        isLastToAmountEmptyOrNull()
    }, [pTSlabs])

    const handleInputChange = (value, index, name) => {
        const newData = [...defaultslab]
        newData[index][name] = value
        setPTSlabs(newData)
    }

    const handleRemove = (index) => {
        setShow(true)
        const rows = [...defaultslab]

        rows.splice(index, 1)
        if (rows.length > 0) {
            rows[rows.length - 1].toValue = null
        }
        setDefaultSlab(rows)
        setPTSlabs(rows)
    }

    const formatNumber = (number) => {
        if (number == null) return ''
        return new Intl.NumberFormat().format(number)
    }

    const handleKeyPress = (event) => {
        const regex = /^[0-9.]$/
        const key = String.fromCharCode(event.charCode)
        if (!regex.test(key)) {
            event.preventDefault()
        }
    }

    const COLUMNS = [
        {
            Header: 'S.No',
            accessor: '',
            style: { overflowWrap: 'break-word' },
            disableSortBy: true,
            width: '40%',
            Cell: ({ row }) => (
                <>
                    <div className="text-center">{row.index + 1}</div>
                </>
            )
        },
        {
            Header: () => <div className="numericColHeading">From Range</div>,
            accessor: 'fromValue',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="box">
                    <Form.Control
                        style={{ borderBottom: 'none', textAlign: 'right' }}
                        size="sm"
                        type="text"
                        readOnly
                        defaultValue={formatNumber(row.original.fromValue)}
                        className="read-only-input"
                    />
                </div>
            )
        },
        {
            Header: () => <div className="numericColHeading">To Range</div>,
            accessor: 'toValue',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="box">
                    <Form.Control
                        size="sm"
                        type={row.index != defaultslab.length - 1 ? 'text' : 'number'}
                        style={{
                            textAlign: 'right',
                            ...(row.index != defaultslab.length - 1 ? { borderBottom: 'none' } : {})
                        }}
                        readOnly={row.index != defaultslab.length - 1}
                        onKeyPress={handleKeyPress}
                        min={0}
                        defaultValue={
                            row.original.toValue === 0 ? '' :
                                (row.index != defaultslab.length - 1
                                    ? formatNumber(row.original.toValue)
                                    : row.original.toValue)
                        }

                        onBlur={
                            row.index == defaultslab.length - 1
                                ? (e) => handleInputChange(e.target.value, row.index, 'toValue')
                                : undefined
                        }
                    />
                </div>
            )
        },
        {
            Header: () => <div className="numericColHeading">Value</div>,
            accessor: 'amount',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="box">
                    <Form.Control
                        size="sm"
                        type="number"
                        defaultValue={row.original.amount}
                        onKeyPress={handleKeyPress}
                        min={0}
                        max={100}
                        onBlur={(e) => handleInputChange(e.target.value, row.index, 'amount')}
                    />
                </div>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-center actionsWidth">
                        <Button
                            type="button"
                            className="iconWidth"
                            variant=""
                            disabled={row.index != defaultslab.length - 1 || row.index == 0}
                            onClick={() => handleRemove(row.index)}
                        >
                            <DeleteIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]
    const isLastToAmountEmptyOrNull = () => {
        if (
            defaultslab[defaultslab.length - 1].fromValue <
            defaultslab[defaultslab.length - 1].toValue
        ) {
            setShow(true)
        } else {
            setShow(false)
        }
    }

    /**
     * Adds a new tax slab to the list of default tax slabs.
     * Hides the current view.
     * Calculates the new tax slab values based on the last slab in the list.
     * Updates the default tax slab list with the new tax slab.
     * @returns None
     */
    const addTaxSlab = () => {
        setShow(false)
        const lastSlab = defaultslab[defaultslab.length - 1]
        const lastAmount = Number(lastSlab ? lastSlab.toValue : 0)
        const newFromAmount = lastAmount + 1

        setDefaultSlab([
            ...defaultslab,
            {
                fromValue: newFromAmount,
                toValue: '',
                amount: '',
                taxRuleId: ''
            }
        ])
    }

    return (
        <>
            <div
                className="mb-5"
                style={{ marginTop: '3%', marginRight: '22.5%', marginLeft: '15%' }}
            >
                <Table columns={COLUMNS} data={defaultslab} key={defaultslab.length} />
                {show && (
                    <Button
                        className="addMoreBtn"
                        variant=""
                        disabled={String(defaultslab[defaultslab.length - 1].amount).length <= 0}
                        onClick={addTaxSlab}
                    >
                        Add More+
                    </Button>
                )}
            </div>
        </>
    )
}

export default PTRules
