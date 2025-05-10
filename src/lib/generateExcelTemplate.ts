import * as XLSX from "xlsx"

/**
 * Generates an Excel template with headers based on selected fields
 * @param segments The segments from the URL params
 * @param selectedFields Array of field paths to include as headers
 */
export const generateExcelTemplate = (segments: any, selectedFields: string[]) => {
  try {
    if (!segments || !segments[1]) {
      return
    }

    // Create a worksheet with just the headers
    const headers = selectedFields.map((field) => {
      // For nested fields, use the full path
      return field
    })

    // Create an empty row with the headers
    const emptyRow: Record<string, string> = {}
    headers.forEach((header) => {
      emptyRow[header] = ""
    })

    // Create the worksheet with just the headers (no data)
    const worksheet = XLSX.utils.json_to_sheet([emptyRow])

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, segments[1])

    // Generate the Excel file
    const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" })
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${segments[1]}-template.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return true
  } catch (error) {
    return false
  }
}
