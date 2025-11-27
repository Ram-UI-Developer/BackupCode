import React, { useState } from 'react'
import Table from '../Table/Table'
import { useSelector } from 'react-redux'
import { Grid } from '../Grid/Grid'
import { GlobalFilter } from '../Table/GlobalFilter'

const CommonGridAndTable = (props) => {
    const title = useSelector((state) => state.title.title)
    const { data, COLUMNS, actionValue } = props
    const [action, setAction] = useState('table')
    const [searchTerm, setSearchTerm] = useState('')

    const handleChange = (e) => {
        setAction(e)
    }

    const filteredData = data.filter((item) => {
        return COLUMNS.some((column) => {
            const value = item[column.accessor]
            return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
    })

    return (
        <div>
            <div className="iconsBothTableAndGrid">
                <span className="">
                    {action == 'grid' ? (
                        <img
                            onClick={() => handleChange('table')}
                            src="/dist/SVGs/TableIcon.svg"
                            className="tableGridICon"
                        />
                    ) : (
                        <img src="/dist/SVGs/ActiveTableIcon.svg" className="tableGridICon" />
                    )}
                </span>
                <span className="">
                    {action == 'table' ? (
                        <img
                            onClick={() => handleChange('grid')}
                            src="/dist/SVGs/DeActiveGrid.svg"
                            className="tableGridICon"
                        />
                    ) : (
                        <img src="/dist/SVGs/GridIcon.svg" className="tableGridICon" />
                    )}
                </span>
                <span className="title">{title}</span>
                {/* {
                    actionValue == true ? "" :
                        <span style={{ marginLeft: "auto", }}>
                            <GlobalFilter filter={searchTerm} setFilter={setSearchTerm} />
                        </span>
                } */}
            </div>
            {action === 'grid' && <Grid data={filteredData} columns={COLUMNS} />}
            {action === 'table' && (
                <div>
                    <Table data={filteredData} serialNumber={true} columns={COLUMNS} />
                </div>
            )}
        </div>
    )
}

export default CommonGridAndTable
