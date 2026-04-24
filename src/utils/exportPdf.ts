import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportToPdf(canvasEl: HTMLElement): Promise<void> {
  const canvas = await html2canvas(canvasEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pdfW = pdf.internal.pageSize.getWidth()
  const pdfH = pdf.internal.pageSize.getHeight()

  pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
  pdf.save('cv.pdf') // add timestamp
}