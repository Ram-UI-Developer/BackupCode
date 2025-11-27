import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import TableHeader from '../../../Common/CommonComponents/TableHeader'
import { DeleteIcon } from '../../../Common/CommonIcons/CommonIcons'
import Table from '../../../Common/Table/Table'

const TaxSlabs = ({ setTaxSlabs, taxSlabs }) => {
    // Default tax slab used when no specific slabs are defined (e.g., fallback)
    const [defaultslab, setDefaultSlab] = useState([
        {
            fromAmount: 0,
            toAmount: null,
            percentage: '', // Tax percentage for the slab
            taxRuleId: '' // Associated rule ID for reference
        }
    ])

    // Boolean to control visibility of a modal or section (e.g., Add Slab form)
    const [show, setShow] = useState(false)

    useEffect(() => {
        setDefaultSlab(taxSlabs.length != 0 ? taxSlabs : defaultslab)
        isLastToAmountEmptyOrNull()
    }, [taxSlabs])

    /**
     * Updates the value of a specific property in an object within an array and sets the state with the updated data.
     * @param {any} value - The new value to be assigned to the property.
     * @param {number} index - The index of the object in the array to be updated.
     * @param {string} name - The name of the property to be updated.
     * @returns None
     */
    const handleInputChange = (value, index, name) => {
        const newData = [...defaultslab]
        newData[index][name] = value
        setTaxSlabs(newData)
    }

    const handleRemove = (index) => {
        setShow(true)
        const rows = [...defaultslab]

        rows.splice(index, 1)
        if (rows.length > 0) {
            rows[rows.length - 1].toAmount = null
        }
        setDefaultSlab(rows)
        setTaxSlabs(rows)
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
        const currentValue = event.target.value
        const digitCount = (currentValue.match(/\d/g) || []).length

        // Only allow more digits if less than 9 digits are present
        if (/\d/.test(key) && digitCount >= 9) {
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
            accessor: 'fromAmount',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="box">
                    <Form.Control
                        style={{ borderBottom: 'none', textAlign: 'right' }}
                        size="sm"
                        type="text"
                        readOnly
                        defaultValue={formatNumber(row.original.fromAmount)}
                        className="read-only-input"
                    />
                </div>
            )
        },
        {
            Header: () => <div className="numericColHeading">To Range</div>,
            accessor: 'toAmount',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="box">
                    <Form.Control
                        size="sm"
                        maxLength={9}
                        type={row.index != defaultslab.length - 1 ? 'text' : 'number'}
                        style={{
                            textAlign: 'right',
                            ...(row.index != defaultslab.length - 1 ? { borderBottom: 'none' } : {})
                        }}
                        readOnly={row.index != defaultslab.length - 1}
                        onKeyPress={handleKeyPress}
                        min={0}
                        defaultValue={
                            row.index != defaultslab.length - 1
                                ? formatNumber(row.original.toAmount)
                                : row.original.toAmount
                        }
                        onBlur={
                            row.index == defaultslab.length - 1
                                ? (e) => handleInputChange(e.target.value, row.index, 'toAmount')
                                : undefined
                        }
                    />
                </div>
            )
        },
        {
            Header: () => <div className="numericColHeading">Percentage</div>,
            accessor: 'percentage',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="box">
                    <Form.Control
                        size="sm"
                        type="number"
                        defaultValue={row.original.percentage}
                        onKeyPress={handleKeyPress}
                        min={0}
                        max={100}
                        onBlur={(e) => handleInputChange(e.target.value, row.index, 'percentage')}
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
            defaultslab[defaultslab.length - 1].fromAmount <
            defaultslab[defaultslab.length - 1].toAmount
        ) {
            setShow(true)
        } else {
            setShow(false)
        }
    }

    /**
     * Adds a new tax slab to the default slab list by incrementing the last slab's 'toAmount' by 1.
     * Also sets the new tax slab with default values for 'toAmount', 'percentage', and 'taxRuleId'.
     * @returns None
     */
    const addTaxSlab = () => {
        setShow(false)
        const lastSlab = defaultslab[defaultslab.length - 1]
        const lastAmount = Number(lastSlab ? lastSlab.toAmount : 0)
        const newFromAmount = lastAmount + 1

        setDefaultSlab([
            ...defaultslab,
            {
                fromAmount: newFromAmount,
                toAmount: '',
                percentage: '',
                taxRuleId: ''
            }
        ])
    }

    return (
        <>
            <div style={{ marginLeft: '15%' }}>
                <TableHeader tableTitle={'Tax Slabs'} />
            </div>
            <div style={{ marginTop: '5%', marginRight: '22.5%', marginLeft: '15%' }}>
                <Table columns={COLUMNS} data={defaultslab} key={defaultslab.length} />
                {show && (
                    <Button
                        className="addMoreBtn"
                        variant=""
                        disabled={
                            String(defaultslab[defaultslab.length - 1].percentage).length <= 0
                        }
                        onClick={addTaxSlab}
                    >
                        Add More+
                    </Button>
                )}
            </div>
        </>
    )
}

export default TaxSlabs
