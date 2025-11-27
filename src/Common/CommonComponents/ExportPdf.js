import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * ExportPdf - Generates and downloads a PDF file using provided data
 *
 * @param {Array} fileColumns - Array of objects that define table headers and data keys
 * @param {Array} data - The actual row data to be populated in the PDF table
 * @param {String} toDate - End date of the data being exported
 * @param {String} fromDate - Start date of the data being exported
 * @param {String} locationName - Name of the location for which data is being exported
 * @param {String} fileName - Name of the file to be used for downloaded PDF
 */
const ExportPdf = (fileColumns, data, toDate, fromDate, locationName, fileName) => {
    // Create a new jsPDF document instance
    const pdfDoc = new jsPDF()
    // Add title text at coordinates (15, 10) in the PDF
    pdfDoc.text(`${fileName} from ${fromDate} to ${toDate} of ${locationName}`, 15, 10)
    // Add a table using the autoTable plugin
    autoTable(pdfDoc, {
        theme: 'grid', // Grid theme gives the table cell borders
        headStyles: { fontSize: 10 }, // Style for header row: font size 10
        bodyStyles: { fontSize: 8, fontStyle: 'italic' }, // Style for body: smaller italic text
        columns: fileColumns.map((col) => ({ ...col, dataKey: col.filed })), // Use 'filed' property from each column object as the data key
        body: data // Provide the actual row data for the table
    })
    // Save the PDF file with a name that includes the fileName and toDate
    return pdfDoc.save(`${fileName}_${toDate}.pdf`)
}

export default ExportPdf
